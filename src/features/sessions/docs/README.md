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

- [components/SchedulingWizard.tsx](../components/SchedulingWizard.tsx): wizard de agendamiento.
  - Paso 1: Disponibilidad (selecciona tutor). La modalidad de la sesión queda determinada por el slot del tutor elegido (cada slot ofrece una sola modalidad, `PRES` o `VIRT`).
  - Paso 2: Detalles (título, descripción).
  - Paso 3: Tipo de espacio y revisión/envío.
- [components/scheduling/Availability.tsx](../components/scheduling/Availability.tsx): selección de slot.
- [components/scheduling/SessionType.tsx](../components/scheduling/SessionType.tsx): tipo de sesión.
- [components/scheduling/Modality.tsx](../components/scheduling/Modality.tsx): selección de modalidad (salvaguarda; no se muestra en el flujo normal porque el slot del tutor ya define la modalidad).
- [components/scheduling/Details.tsx](../components/scheduling/Details.tsx): formulario de detalles.
- [components/scheduling/SlotPopover.tsx](../components/scheduling/SlotPopover.tsx): popover de slot.

### Calendario y vistas de sesiones

- [components/StudentSchedule.astro](../components/StudentSchedule.astro): vista del calendario de slots disponibles (SSR).
- [components/SessionDetailModal.tsx](../components/SessionDetailModal.tsx): modal con detalles completos de una sesión.
- [components/SessionDetaiView.tsx](../components/SessionDetaiView.tsx): vista detallada dentro del modal.
- [components/EditSessionView.tsx](../components/EditSessionView.tsx): edición de detalles básicos (título, descripción, enlace, ubicación).
- [components/ProposeModificationView.tsx](../components/ProposeModificationView.tsx): proponer cambios de modalidad, duración o fecha.
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
- `SessionStatus`: estados (`PENDING_TUTOR_CONFIRMATION`, `SCHEDULED`, `COMPLETED`, `CANCELLED`, etc.).
- `ParticipantStatus`: estados de participantes (`CONFIRMED`, `PENDING`, `CANCELLED`, `ATTENDED`, `ABSENT`, `LATE`, `NO_SHOW`).
- `SessionTutor`, `SessionSubject`, `SessionParticipant`: entidades relacionadas.
- `CreateSessionDTO`: payload de creación.
- `ModifySessionBody`: payload de modificación.
- `EditSessionBody`: payload de edición de detalles.
- `RegisterAttendanceDTO`: payload de asistencia.
- `CompleteSessionBody`: payload de completar sesión.

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
5. Paso 1: elige tutor. La tarjeta muestra la modalidad real del slot de ese tutor (Presencial o Virtual) y con ella queda fijada la modalidad de la sesión.
6. Paso 2: ingresa título y descripción.
7. Paso 3: selecciona tipo de espacio, revisa y envía → `createSession()` POST (se valida que la modalidad provenga del slot).
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
2. Hace clic en editar/proponer cambio.
3. Selecciona nueva modalidad, duración o fecha.
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
