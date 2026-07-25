## Título
Proponer **modificación** de tutoría


## Contexto / Problema
Actualmente el flujo de propuesta de modificación no está funcionando correctamente. Hay alguna reglas de negocio que no se validan y errores visuales en el front. Lo primero que toca tener en cuenta es que hay una card de información única para todos los estados de una tutoría, que son los siguientes:

PENDING_TUTOR_CONFIRMATION — Estado inicial al crear la sesión; espera confirmación del tutor (SCHEDULING-14).
SCHEDULED — La sesión fue confirmada por el tutor y está agendada (SCHEDULING-25).
REJECTED_BY_TUTOR — El tutor rechazó la solicitud (SCHEDULING-29), o fue auto-rechazada por competencia con otra sesión confirmada para el mismo slot (SCHEDULING-23).
CANCELLED_BY_STUDENT — Cancelada por el estudiante participante (SCHEDULING-35).
CANCELLED_BY_TUTOR — Cancelada por el tutor asignado (SCHEDULING-35).
CANCELLED_BY_ADMIN — Cancelada por un administrador (SCHEDULING-35).
PENDING_MODIFICATION — La sesión tiene una propuesta de modificación vigente en curso (SCHEDULING-46).
EXPIRED_UNCONFIRMED — El plazo de confirmación venció sin respuesta del tutor (SCHEDULING-56).
COMPLETED — El tutor marcó la sesión como completada tras registrar la asistencia (EXECUTION-14).

Estados de la propuesta de modificación (entidad separada, no de la sesión): PENDING, REJECTED, EXPIRED, y (implícito al aceptar) ACCEPTED.

Estados de asistencia (StudentParticipateSession.status): CONFIRMED (inicial), ATTENDED, ABSENT, LATE.


El objetivo de tener los estados de una tutoría presentes, es que la card debe cambiar de acuerdo al estado de la tutoría. Si la tutoría tiene un estado de Scheduled, y el estudiante puede hacer una propuesta de modificación de acuerdo a las reglas de negocio definidas para esto (adjuntadas en un párrafo posterior), en la card se debería mostrar los botones de cancelar y además el de proponer modificación, porque tiene la capacidad de hacerlo. Pero si una tutoría tiene una estado PENDING_MODIFICATION, COMPLETED, etc, no debería aparecer este boton de propuesta de modificación; así con todos los posibles estados y casos de uso.

Actualmente algunos de los errores que puedo ver son los siguientes:
- (puede ser un error del backend) Si un estudiante agenda una tutoría, por ejemplo, para el 17 de julio, y el tutor no confirma (PENDING_TUTOR_CONFIRMATION), así el tiempo máximo de confirmación sea superado el estado no se modifica a EXPIRED_UNCONFIRMED y por lo tanto en el front se sigue viendo el estado PENDING_TUTOR_CONFIRMATION
- Cuando una tutoría tiene el estado PENDING_TUTOR_CONFIRMATION, deja hacer propuestas de modificación, cuando no debería ser así.
- Actualmente cuando una tutoría es marcada como SCHEDULED y llega el día y la hora de la tutoría, el front se sigue mostrando igual "Programada", se debería cambiar con una validación simple usando la fecha y hora programada a "En curso", y cuando este terminada a "Esperando a que el tutor marque asistencia". Claramente el botón de propuesta de modificación no debería aparecer en ninguno de los 2 casos
- Debido a la siguiente regla de negocio (el front debería validar con la fecha y hora si aún el estudiante puede plantear una propuesta de modificación, en el caso de ser un no, el boton debería aparecer como disabled y con un tooltip del por qué.):
> Una modificación SOLO PUEDE PROPONERSE SI la sesión (en su fecha/hora actual, antes del cambio) es en MÁS de 3 días. Si quedan 3 días o menos, el sistema DEBE RECHAZAR la propuesta, por no dejar tiempo suficiente a la contraparte para responder.

- Cuando una persona intenta hacer una propuesta de modificación es importante revisar que el estudiante si pueda cambiar los campos dispuestos del formulario (modalidad y duración de la tutoría). Por ejemplo, si agendo una tutoría de 1 hora(12-1pm) y quiero hacer una propuesta de modificación cambiando la duración, a 2 horas, el front solo lo debería mostrar si el tutor puede (si tiene la disponibilidad de aumentar la duración de la tutoría, es decir, disponibilidad de 12-2, si no es así no se debería mostrar); lo mismo en el caso de la modalidad, si la persona quiero cambiar la modalidad del espacio, solo debería aparecer la opción de hacerlo si el slot tiene ambos tipos de modalidad. En el caso de que los campos no se pueden modificar, deberían aparecer disabled


## Alcance
- Información de una tutoría, flujos de propuesta de modificación, estados de la card de información

**Incluye:**

- Corrección a errores de estados en la card de información
- Fiabilidad en los inputs de modificación
- Implementación y revisión de las reglas de negocio relacionadas



## Reglas de negocio relevantes
## **6. Expiración automática (cron job)**

> Procesado por `SessionExpiryService`, que se ejecuta cada 15 minutos.
> 

### **SCHEDULING-56 — Auto-expiración de solicitudes sin confirmar**

SI una sesión está en estado `PENDING_TUTOR_CONFIRMATION` Y su `confirmationExpiresAt` ya venció (es menor o igual al momento actual) ENTONCES el sistema DEBE MARCARLA automáticamente como `EXPIRED_UNCONFIRMED`, ELIMINAR su `ScheduledSession` (liberando el slot), Y NOTIFICAR al estudiante.

### **SCHEDULING-57 — Protección contra condición de carrera en expiración**

Antes de expirar una sesión, el proceso DEBE ADQUIRIR un bloqueo pesimista y RE-VERIFICAR que el estado siga siendo `PENDING_TUTOR_CONFIRMATION`, para evitar expirar una sesión que fue confirmada o rechazada manualmente en el mismo instante.

### **SCHEDULING-58 — Auto-expiración de propuestas de modificación**

SI una propuesta de modificación está en estado `PENDING` Y su `expiresAt` ya venció ENTONCES el sistema DEBE MARCARLA como `EXPIRED`.

### **SCHEDULING-59 — Restauración de estado tras expirar la última propuesta pendiente**

CUANDO una propuesta expira automáticamente Y no quedan otras propuestas `PENDING` para la misma sesión, ENTONCES la sesión DEBE VOLVER a estado `SCHEDULED`.

### **SCHEDULING-60 — Frecuencia y alcance del procesamiento por lotes**

El cron job DEBE EJECUTARSE cada 15 minutos y PROCESAR TODAS las sesiones/propuestas vencidas encontradas en cada ejecución, cada una dentro de su propia transacción independiente (un fallo en una no debe afectar el procesamiento de las demás).

## **5. Propuesta y respuesta a modificación de sesión**

### **SCHEDULING-39 — Roles habilitados para proponer modificación**

Una propuesta de modificación SOLO PUEDE SER CREADA SI el usuario autenticado es el estudiante participante o el tutor asignado a la sesión.

### **SCHEDULING-40 — Estado requerido para proponer**

Una modificación SOLO PUEDE PROPONERSE SI la sesión está actualmente en estado `SCHEDULED`.

### **SCHEDULING-41 — Anticipación máxima para proponer modificación**

Una modificación SOLO PUEDE PROPONERSE SI la sesión (en su fecha/hora actual, antes del cambio) es en MÁS de 3 días. SI quedan 3 días o menos ENTONCES el sistema DEBE RECHAZAR la propuesta, por no dejar tiempo suficiente a la contraparte para responder.

### **SCHEDULING-42 — Al menos un cambio debe proponerse**

Una propuesta de modificación DEBE INCLUIR al menos uno de los siguientes campos: nueva fecha, nueva franja de disponibilidad, nueva modalidad o nueva duración.

### **SCHEDULING-43 — Validaciones completas si hay cambio temporal**

SI la propuesta incluye cambio de fecha, franja o duración ENTONCES el sistema DEBE RE-EJECUTAR TODAS las validaciones de agendamiento sobre el nuevo horario propuesto: coherencia día-slot, disponibilidad + duración completa, modalidad (si cambia el slot), no solapamiento de horario, límite semanal y límite diario — todas EXCLUYENDO la sesión que se está modificando de sus propios cálculos.

### **SCHEDULING-44 — Validación de modalidad sin cambio de slot**

SI se propone únicamente un cambio de modalidad (sin cambiar fecha, slot ni duración) ENTONCES el sistema DEBE VALIDAR que el slot ACTUAL de la sesión soporte la nueva modalidad solicitada.

### **SCHEDULING-45 — Vigencia de la propuesta**

Toda propuesta de modificación DEBE TENER un plazo de vigencia de 24 horas desde su creación (`expiresAt = now + 1 día`).

### **SCHEDULING-46 — Estado de sesión durante propuesta pendiente**

Al crearse una propuesta de modificación, la sesión DEBE CAMBIAR a estado `PENDING_MODIFICATION` mientras la propuesta esté vigente.

### **SCHEDULING-47 — Notificación de propuesta**

La contraparte (quien no propuso el cambio) DEBE SER NOTIFICADA de la nueva propuesta de modificación.

### **SCHEDULING-48 — Quién puede responder a una propuesta**

Una propuesta de modificación SOLO PUEDE SER RESPONDIDA (aceptada o rechazada) SI el usuario autenticado es participante (estudiante) o tutor de la sesión.

### **SCHEDULING-49 — El solicitante no puede responder su propia propuesta**

SI el usuario que intenta responder es el mismo que creó la propuesta ENTONCES el sistema DEBE RECHAZAR la respuesta.

### **SCHEDULING-50 — Verificación de expiración al responder**

SI al momento de intentar responder la propuesta ya venció su plazo (`expiresAt` en el pasado) ENTONCES el sistema DEBE MARCAR la propuesta como `EXPIRED`, RESTAURAR la sesión a `SCHEDULED` (si no quedan otras propuestas pendientes) Y RECHAZAR la respuesta con un error indicando expiración.

### **SCHEDULING-51 — Efecto de rechazar una propuesta**

SI la propuesta es rechazada ENTONCES DEBE MARCARSE como `REJECTED`, registrando quién respondió y cuándo. La sesión DEBE VOLVER a estado `SCHEDULED`.

### **SCHEDULING-52 — Re-validación completa al aceptar**

Al aceptar una propuesta, el sistema DEBE RE-VALIDAR (no reutilizar la validación original) la disponibilidad del slot con duración, el no-solapamiento de horario, el límite diario y el límite semanal, porque pueden haber transcurrido hasta 24 horas desde la propuesta original durante las cuales otro agendamiento pudo haber ocupado el mismo horario.

### **SCHEDULING-53 — Aplicación de cambios al aceptar**

CUANDO se acepta una propuesta ENTONCES los campos de la sesión (fecha, hora de inicio/fin, modalidad si aplica) DEBEN ACTUALIZARSE con los valores propuestos, el `ScheduledSession` asociado DEBE ACTUALIZARSE con la nueva fecha y/o franja, Y la sesión DEBE VOLVER a estado `SCHEDULED`.

### **SCHEDULING-54 — Rechazo automático de otras propuestas al aceptar una**

CUANDO se acepta una propuesta de modificación ENTONCES CUALQUIER OTRA propuesta en estado `PENDING` para la misma sesión DEBE MARCARSE automáticamente como `REJECTED`.

### **SCHEDULING-55 — Notificación de respuesta**

La parte que originó la propuesta DEBE SER NOTIFICADA del resultado (aceptación o rechazo).

### **SCHEDULING-15 — Cálculo y persistencia del plazo de confirmación**

Al crear la sesión, el sistema DEBE CALCULAR y PERSISTIR `confirmationExpiresAt` como `scheduledDateTime - 6 horas`. Este valor es el que determina cuándo el cron de expiración auto-cancela la solicitud (ver sección 6).

### **SCHEDULING-20 — No confirmar si otra solicitud ya fue confirmada para el mismo slot+fecha**

SI, al momento de confirmar, ya existe otra sesión `SCHEDULED` para el mismo tutor, slot y fecha ENTONCES el sistema DEBE RECHAZAR la confirmación. Esta comprobación se hace con bloqueo pesimista dentro de la transacción.

### **SCHEDULING-21 — Re-validación del límite diario al confirmar**

Al confirmar, el sistema DEBE RECALCULAR las horas ya `SCHEDULED`/`PENDING_MODIFICATION` del tutor en esa fecha (excluyendo la sesión que se confirma) Y RECHAZAR la confirmación SI sumar la duración de esta sesión supera 4 horas diarias.

### **SCHEDULING-22 — Re-validación del límite semanal al confirmar**

Al confirmar, el sistema DEBE RE-VALIDAR el límite semanal del tutor (excluyendo la sesión que se confirma), dentro de la misma transacción con bloqueo.

### **SCHEDULING-23 — Auto-rechazo de solicitudes competidoras**

CUANDO el tutor confirma una sesión para un slot+fecha determinado, ENTONCES TODAS las demás sesiones en estado `PENDING_TUTOR_CONFIRMATION` para ese mismo slot+fecha DEBEN MARCARSE automáticamente como `REJECTED_BY_TUTOR`, con motivo "El tutor ya confirmó otra sesión para este horario", Y sus registros de `ScheduledSession` DEBEN ELIMINARSE (liberando la reserva del slot para esos estudiantes).

### **SCHEDULING-24 — Notificación de auto-rechazo**

CADA estudiante cuya solicitud fue auto-rechazada por la regla SCHEDULING-23 DEBE SER NOTIFICADO del rechazo.

### **SCHEDULING-25 — Estado tras confirmación**

Al confirmarse exitosamente, la sesión DEBE CAMBIAR a estado `SCHEDULED`, con `tutorConfirmed = true` y `tutorConfirmedAt` registrado con la marca de tiempo de la confirmación.

### **SCHEDULING-26 — Notificación de confirmación**

Al confirmarse la sesión, el sistema DEBE NOTIFICAR tanto al estudiante confirmado como al tutor.

---

## **3. Rechazo de sesión (tutor)**

### **SCHEDULING-27 — Solo el tutor asignado rechaza**

El rechazo de una sesión SOLO PUEDE EJECUTARSE SI el usuario autenticado es el tutor asignado.

### **SCHEDULING-28 — Estado requerido para rechazar**

Una sesión SOLO PUEDE RECHAZARSE SI su estado actual es `PENDING_TUTOR_CONFIRMATION`.

### **SCHEDULING-29 — Efectos del rechazo**

Al rechazar, la sesión DEBE CAMBIAR a estado `REJECTED_BY_TUTOR`, registrando el motivo (`rejectionReason`) y la fecha de rechazo (`rejectedAt`). El registro de `ScheduledSession` asociado DEBE ELIMINARSE, liberando el slot.

### **SCHEDULING-30 — Notificación de rechazo**

El estudiante asociado a la sesión rechazada DEBE SER NOTIFICADO.º

-



## Estados a contemplar



- [ ] Hover / Focus

- [ ] Disabled

- [ ] Loading

- [ ] Error

- [ ] Vacío (Empty State)

- [ ] Éxito

- [ ] N/A (justificar por qué)



## Criterios de aceptación



<!-- Formato Dado/Cuando/Entonces. Todos deben ser verificables por otra persona sin preguntar. -->



1. Dado ___, cuando ___, entonces ___.

2.



## Casos borde a considerar



<!-- Ej: texto muy largo, lista vacía, sin conexión, permisos de rol distinto. -->



-



## Dependencias



<!-- ¿Necesita un endpoint que no existe aún? ¿Depende de otro componente en desarrollo? -->



- N/A



## Prioridad / Severidad



- [ ] 🔴 Bloqueante

- [ ] 🟠 Fricción

- [ ] 🟡 Mejora / idea



## Referencias



<!-- Link al documento de contexto de producto, Design System, issue relacionado, ADR, etc. -->



-



---



# ✅ Definition of Done — Frontend



Una tarea de frontend está **Done** solo si cumple todo lo siguiente:



- [ ] La implementación coincide con el diseño de Figma, verificado visualmente lado a lado (fidelidad), no solo "se ve parecido".

- [ ] Funciona y se ve correctamente en **Desktop y Mobile** (no se aprueba solo con la versión desktop).

- [ ] Todos los estados relevantes del componente están implementados (hover, focus, disabled, loading, error, éxito y vacío), no solo el estado "feliz".

- [ ] Usa los tokens del Design System (colores, tipografía, espaciados); no hay valores hardcodeados ni estilos inline sin justificación.

- [ ] Se verificó que no existía ya un componente o patrón reutilizable antes de crear uno nuevo.

- [ ] Se probó con datos reales de la API (no solo con datos mock), incluyendo al menos un caso borde (lista vacía, texto largo, error de red).

- [ ] Si se descubrió una inconsistencia con lo documentado (por ejemplo, una regla de negocio no reflejada en el diseño), se notificó y se actualizó la fuente correspondiente.

- [ ] Si se tomó una decisión técnica no trivial (patrón de manejo de estado, estrategia de estilos, elección de librería, etc.), quedó registrada como un ADR corto (contexto → opciones consideradas → decisión → por qué) y enlazada directamente desde este issue.

- [ ] El Pull Request fue revisado por una persona distinta a quien implementó, incluyendo la revisión de fidelidad visual.
 
