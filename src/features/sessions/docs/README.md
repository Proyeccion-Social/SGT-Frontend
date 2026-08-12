# Sessions

## Propósito y objetivo

La feature `sessions` gestiona el ciclo de vida completo de una sesión de tutoría. Su objetivo es:

- Permitir a los estudiantes crear nuevas sesiones a partir de la disponibilidad de un tutor.
- Mostrar el listado de sesiones del usuario (tutor o estudiante).
- Proveer detalle, edición, cancelación, modificación y confirmación de sesiones.
- Registrar asistencia y completar sesiones.
- Servir como el núcleo operativo de la plataforma.

## Problema que resuelve

La coordinación de una tutoría requiere múltiples estados y acciones:

1. Agendamiento inicial.
2. Confirmación por parte del tutor.
3. Posibles modificaciones de fecha/hora/modalidad.
4. Cancelaciones.
5. Registro de asistencia post-sesión.
6. Evaluación final.

`sessions` encapsula todas estas operaciones y sus interfaces asociadas.

## Componentes principales

### Wizard de agendamiento

- [components/SchedulingWizard.tsx](../components/SchedulingWizard.tsx): wizard de 4 pasos para agendar una sesión.
  - Paso 1: Selección de tutor (entre los disponibles en la franja).
  - Paso 2: Detalles (título, descripción).
  - Paso 3: Tipo de sesión (Individual / Grupal).
  - Paso 4: Modalidad (`PRES`/`VIRT`) — siempre se muestra, filtra opciones según la franja.
- [components/scheduling/Availability.tsx](../components/scheduling/Availability.tsx): paso 1, selección de tutor. Cada tarjeta resuelve su perfil en tres estados: cargado, skeleton (aún sin resolver) y error con reintento — la carga usa `Promise.allSettled`, de modo que un tutor que falle no deja sin cargar a los demás. Sin foto se usa el fallback `/default-avatar.svg`, nunca un texto.
- [components/scheduling/Details.tsx](../components/scheduling/Details.tsx): paso 2, formulario de detalles.
- [components/scheduling/SessionType.tsx](../components/scheduling/SessionType.tsx): paso 3, tipo de sesión.
- [components/scheduling/Modality.tsx](../components/scheduling/Modality.tsx): paso 4, selección de modalidad (acepta `availableModalities` para filtrar opciones).
- [components/scheduling/SlotPopover.tsx](../components/scheduling/SlotPopover.tsx): popover que aparece al seleccionar una franja en el calendario.

### Calendario y vistas de sesiones

- [components/StudentSchedule.astro](../components/StudentSchedule.astro): vista del calendario de slots disponibles (SSR).
- [components/SessionDetailModal.tsx](../components/SessionDetailModal.tsx): modal con detalles completos de una sesión.
- [components/SessionDetaiView.tsx](../components/SessionDetaiView.tsx): vista detallada dentro del modal.
- [components/EditSessionView.tsx](../components/EditSessionView.tsx): edición de detalles básicos (título, descripción, enlace, ubicación) con validación y renderizado condicional de enlace o ubicación según la modalidad de la sesión.
- [components/ProposeModificationView.tsx](../components/ProposeModificationView.tsx): proponer cambios de modalidad, duración o fecha. Valida contra la disponibilidad real del tutor: la modalidad solo es editable si el slot soporta ambas (`BOTH`/ambigua), la duración solo ofrece valores que caben en la disponibilidad contigua, y el selector de horario solo lista franjas libres. Exige al menos un cambio para poder confirmar (SCHEDULING-42).
- [components/PendingModificationView.tsx](../components/PendingModificationView.tsx): visualizar modificaciones pendientes.
- [components/CancelSessionModal.tsx](../components/CancelSessionModal.tsx): cancelar sesión.
- [components/FinishSession.tsx](../components/FinishSession.tsx): marcar sesión como completada.
- [components/AttendancePostSession.tsx](../components/AttendancePostSession.tsx): registrar asistencia de participantes.
- [components/SubjectSelector.tsx](../components/SubjectSelector.tsx): selector de materia.
- [components/CustomSelect.tsx](../components/CustomSelect.tsx): select personalizado.

## Servicios y APIs

### [services/sessionService.ts](../services/sessionService.ts)

- `createSession(data: CreateSessionDTO, token)` → `POST /scheduling/sessions/individual`
  - Crea una nueva sesión individual.
- `getSessions(role: string, token)` → `GET /scheduling/sessions/my-sessions/{role}`
  - Sesiones del usuario según rol (`TUTOR`/`STUDENT`).
- `getSessionDetail(sessionId, token)` → `GET /scheduling/sessions/{sessionId}`
  - Detalle completo de una sesión.
- `getTutorInfo(tutorId, token)` → `GET /tutors/{tutorId}`
  - Información pública del tutor.
- `cancelSession(sessionId, reason, token)` → `DELETE /scheduling/sessions/{sessionId}`
  - Cancela una sesión.
- `modifySession(sessionId, body: ModifySessionBody, token)` → `POST /scheduling/sessions/{sessionId}/propose-modification`
  - Propone una modificación.
- `editSession(sessionId, body: EditSessionBody, token)` → `PATCH /scheduling/sessions/{sessionId}/details`
  - Edita detalles básicos.
- `confirmSession(sessionId, body, token)` → `POST /scheduling/sessions/{sessionId}/confirm`
  - Confirma una sesión pendiente.
- `rejectSession(sessionId, body, token)` → `POST /scheduling/sessions/{sessionId}/reject`
  - Rechaza una sesión pendiente.
- `getSessionModifications(sessionId, token)` → obtiene modificaciones pendientes.
- `acceptModification(sessionId, token)` → acepta una modificación propuesta.
- `rejectModification(sessionId, token)` → rechaza una modificación propuesta.
- `registerAttendance(sessionId, data: RegisterAttendanceDTO, token)` → POST asistencia.
- `registerCompletedSession(sessionId, data: CompleteSessionBody, token)` → POST completar sesión.

## Hooks personalizados

- [hooks/useSession.ts](../hooks/useSession.ts): lógica para crear una sesión desde el cliente.
- [hooks/useSessionDetail.ts](../hooks/useSessionDetail.ts): obtención de detalle de sesión.
- [hooks/useSchedulingWizard.ts](../hooks/useSchedulingWizard.ts): estado del wizard de agendamiento.
- [hooks/useCancelSession.ts](../hooks/useCancelSession.ts): lógica de cancelación.
- [hooks/useAvailability.ts](../hooks/useAvailability.ts): carga de disponibilidad.

## Tipos

### [types/session.types.ts](../types/session.types.ts)

- `Session`: entidad principal de sesión.
- `Modality = 'VIRT' | 'PRES'`: modalidad.
- `SessionStatus`: todos los estados del ciclo de vida (`PENDING_TUTOR_CONFIRMATION`, `SCHEDULED`, `PENDING_MODIFICATION`, `REJECTED_BY_TUTOR`, `CANCELLED_BY_STUDENT/TUTOR/ADMIN`, `EXPIRED_UNCONFIRMED`, `COMPLETED`, etc.).
- `ParticipantStatus`: estados de participantes (`CONFIRMED`, `PENDING`, `CANCELLED`, `ATTENDED`, `ABSENT`, `LATE`, `NO_SHOW`).
- `AvailabilitySlot`: slot de disponibilidad del tutor; su `modality` puede ser `'VIRT' | 'PRES' | 'BOTH' | null` (`BOTH`/`null` = soporta ambas).
- `SessionTutor`, `SessionSubject`, `SessionParticipant`: entidades relacionadas.
- `CreateSessionDTO`: payload de creación.
- `ModifySessionBody`: payload de modificación.
- `EditSessionBody`: payload de edición de detalles.
- `RegisterAttendanceDTO`: payload de asistencia.
- `CompleteSessionBody`: payload de completar sesión.

## Utilidades

### [utils/sessionStatus.ts](../utils/sessionStatus.ts)

Derivaciones de estado y reglas de negocio de la card de información:

- `getSessionTimePhase()`: fase temporal de la sesión (`upcoming` / `in_progress` / `ended`) según fecha y horas programadas.
- `getSessionDisplayStatus()`: label visible del estado. Una sesión `SCHEDULED` muestra **"En curso"** mientras está en su franja horaria y **"Esperando a que el tutor marque asistencia"** una vez terminada.
- `canProposeModification()`: visibilidad/habilitación del botón "Proponer modificación" — solo visible en `SCHEDULED` futura (SCHEDULING-40); deshabilitado con tooltip si quedan 3 días o menos (SCHEDULING-41).
- `canCancelSession()`: visibilidad/habilitación del botón "Cancelar tutoría" — visible en `PENDING_TUTOR_CONFIRMATION` y `SCHEDULED` futura; deshabilitado con tooltip si quedan menos de 24 horas; oculto si la sesión está en curso o terminada.
- `isTerminalStatus()`, `SESSION_STATUS_LABELS`: estados terminales (incl. `EXPIRED_UNCONFIRMED`) y mapa de etiquetas.

## Store global

Usa [src/store/sessionStore.ts](../../../store/sessionStore.ts):

- `sessions: Session[]`: listado de sesiones cargadas.
- `loading: boolean`.
- `error: string | null`.
- Métodos: `setSessions()`, `setLoading()`, `setError()`.

## Flujos de usuario

### Agendar sesión

1. Estudiante selecciona tutor en `/search`.
2. Hace clic en "Agendar" → navega a `/sessions?subjectId=...`.
3. `StudentSchedule` carga slots disponibles en SSR vía `getTutorSlotsDetailedSSR()`.
4. Estudiante selecciona slot → se abre `SchedulingWizard`.
5. Paso 1: elige tutor. La tarjeta muestra las modalidades del slot de ese tutor (Presencial, Virtual o ambas). Si es una sola, queda fijada; si son ambas, el estudiante la elige en el paso de modalidad.
6. Paso 2: ingresa título y descripción.
7. Paso 3: selecciona tipo de espacio; si el slot ofrece ambas modalidades, elige la modalidad (paso 4); revisa y envía → `createSession()` POST (la modalidad proviene del slot o de la elección del estudiante, nunca se adivina).
8. Sesión queda en estado `PENDING_TUTOR_CONFIRMATION`.
9. Tutor recibe notificación/email.

### Confirmar/rechazar sesión

1. Tutor recibe email con `action=confirm-session&id={sessionId}`.
2. Abre `/dashboard?action=confirm-session&id=...`.
3. `EmailActionController` abre `ConfirmSessionDialog` (feature `emailScreens`).
4. Tutor confirma → `confirmSession()` POST.
5. Sesión pasa a `SCHEDULED`.

### Proponer cambios

1. Participante abre `SessionDetailModal`.
2. El botón "Proponer modificación" solo aparece si la sesión está `SCHEDULED` y aún no inicia (SCHEDULING-40); se muestra deshabilitado con tooltip si quedan ≤3 días (SCHEDULING-41).
3. En el formulario, modalidad y duración se habilitan solo si la disponibilidad del tutor lo permite; el botón Confirmar exige al menos un cambio (SCHEDULING-42).
4. `modifySession()` POST.
5. La otra parte recibe notificación/email para revisar.
6. Revisa y acepta/rechaza vía `ReviewModificationDialog`.

### Cancelar sesión

1. Participante abre `CancelSessionModal`.
2. Indica motivo.
3. `cancelSession()` DELETE.
4. Sesión pasa a `CANCELLED`.

### Completar sesión y registrar asistencia

1. Sesión en estado `SCHEDULED` alcanza su fecha/hora.
2. Tutor usa `FinishSession` para marcar como completada.
3. `registerCompletedSession()` POST.
4. Se registra asistencia de participantes con `registerAttendance()`.
5. Sesión pasa a `COMPLETED`.
6. Estudiante puede evaluar.

## Relación con otras features

- **availability**: `StudentSchedule` depende de los slots de tutores.
- **auth**: todas las operaciones requieren token válido.
- **search**: inicia el agendamiento enviando `subjectId`.
- **emailScreens**: las acciones por email (confirmar, modificar, evaluar) usan endpoints compartidos.
- **dashboards**: muestra próximas sesiones y permite abrir el detalle.
- **history**: sesiones completadas aparecen en el historial.

## Páginas Astro que la utilizan

- [src/pages/sessions/index.astro](../../../pages/sessions/index.astro): página de agendamiento con `StudentSchedule` y `SchedulingWizard`.

## Notas técnicas

- `StudentSchedule` realiza carga SSR para mostrar slots inmediatamente.
- El wizard maneja estado complejo con `useSchedulingWizard`.
- La máquina de estados de sesión es central: cada operación transita la sesión por estados bien definidos.
- Los DTOs de modificación y edición están separados porque afectan distintos aspectos del backend.
- **Encuadre de las fotos de tutor (paso 1):** el recorte lo decide **solo** Cloudinary, vía el preset `cover` de `src/lib/cloudinary.ts` (`c_fill,g_auto:faces`, cuadrado). La caja CSS usa `aspect-ratio: 1 / 1` con la misma proporción en Desktop y móvil para que el `object-fit: cover` quede neutro y no vuelva a recortar. **No añadir `object-position` por breakpoint**: ese parche era la causa de que el rostro saliera del marco (issue #270); si un encuadre falla, se ajusta el preset.
  - **No usar `g_face` ni `g_auto:face` aquí, ni `c_thumb`/`z_`.** Sobre las fotos reales de tutores la detección devuelve una caja delimitadora inflada (de la cabeza a la cintura, comprobado con `e_pixelate_faces`); como la gravedad de rostro ancla en el centro de esa caja, el recorte se va al pecho y corta la cabeza. `g_auto:faces` pondera el rostro dentro del análisis de saliencia y no hereda ese defecto.
- **Franjas compartidas entre tutores:** el paso 1 del wizard solo ofrece tutores libres en la franja. Al reservar, la actualización optimista marca como ocupada únicamente la entrada del tutor reservado (`(slotId, tutorId)`, no todo el `slotId` compartido) y emite `slot:booked` con `tutorId` para que `Calendar.astro` refresque el bloque sin recargar. La lógica de ocupación por tutor vive en `getSlotsByDayStudent` de la feature `availability` (ver su README).
