# Email Screens

## Propósito y objetivo

La feature `emailScreens` agrupa todos los flujos de usuario que son iniciados desde un enlace enviado por correo electrónico. Su objetivo es:

- Permitir que usuarios realicen acciones críticas sin navegar manualmente por la app.
- Centralizar el control de diálogos modales que se abren a partir de query params (`?action=...&id=...`).
- Reutilizar formularios de autenticación (`confirm-email`, `reset-password`) y de sesiones (`confirm-session`, `evaluate`, `reschedule`, `review-modification`).

Esta feature actúa como controlador de entrada profunda (deep-linking) desde emails.

## Problema que resuelve

Los emails transaccionales necesitan llevar al usuario directamente a la acción:

1. Confirmar una sesión recién agendada.
2. Aceptar o rechazar una modificación propuesta.
3. Evaluar una sesión completada.
4. Reprogramar una sesión.
5. Confirmar el registro de correo.
6. Restablecer la contraseña.

`emailScreens` resuelve esto leyendo la URL, abriendo el diálogo correcto y ejecutando la llamada al API correspondiente.

## Componentes principales

- [components/EmailActionController.tsx](../components/EmailActionController.tsx): controlador central. Lee `action` e `id` de la URL y monta el diálogo adecuado. Se usa tipicamente dentro del dashboard.
- [components/ConfirmSessionDialog.tsx](../components/ConfirmSessionDialog.tsx): diálogo para que el tutor confirme una sesión pendiente.
- [components/ReviewModificationDialog.tsx](../components/ReviewModificationDialog.tsx): diálogo para aceptar/rechazar una modificación de sesión propuesta.
- [components/RescheduleDialog.tsx](../components/RescheduleDialog.tsx): diálogo para reprogramar una sesión.
- [components/EvaluationDialog.tsx](../components/EvaluationDialog.tsx): diálogo para evaluar una sesión completada.
- [components/MultiStepDialog.tsx](../components/MultiStepDialog.tsx): base reutilizable para diálogos de varios pasos.
- [components/ConfirmEmailForm.tsx](../components/ConfirmEmailForm.tsx): formulario para confirmar el correo electrónico. Usado en `/confirm-email`.
- [components/ResetPasswordForm.tsx](../components/ResetPasswordForm.tsx): formulario para restablecer contraseña. Usado en `/reset-password`.

## Servicios y APIs

### [services/sessionService.ts](../services/sessionService.ts)

- `getSessionDetail(sessionId, token)` → `GET /scheduling/sessions/{sessionId}`
- `confirmSession(sessionId, token)` → `POST /scheduling/sessions/{sessionId}/confirm`
- `rejectSession(sessionId, token)` → `POST /scheduling/sessions/{sessionId}/reject`
- `modifySession(sessionId, body, token)` → `POST /scheduling/sessions/{sessionId}/propose-modification`
- `editSession(sessionId, body, token)` → `PATCH /scheduling/sessions/{sessionId}/details`
- `getModificationRequest(requestId, token)` → `GET /scheduling/modification-requests/{requestId}`
- `acceptModificationRequest(requestId, token)` → `POST /scheduling/modification-requests/{requestId}/accept`
- `rejectModificationRequest(requestId, token)` → `POST /scheduling/modification-requests/{requestId}/reject`

### [services/sendSessionEvaluation.ts](../services/sendSessionEvaluation.ts)

- `sendSessionEvaluation(sessionId, payload: EvaluationPayload, token)` → `POST /session-execution/sessions/{sessionId}/evaluation`
- Payload incluye ratings (`clarity`, `patience`, `punctuality`, `knowledge`), `overallRating` y `comments`.

### [services/getSessionEvaluationStatus.ts](../services/getSessionEvaluationStatus.ts)

- Obtiene el estado de evaluación de una sesión (si ya fue evaluada o no).

### [services/getEvaluationQuestions.ts](../services/getEvaluationQuestions.ts)

- Obtiene las preguntas estándar del cuestionario de evaluación.

## Tipos

### [types/session.types.ts](../types/session.types.ts)

- `Session`: entidad de sesión.
- `ModifySessionBody`: datos para proponer cambios de modalidad, duración o fecha.
- `EditSessionBody`: datos para editar detalles básicos (título, descripción, enlace, ubicación).
- `CancelSessionResponse`: respuesta al cancelar sesión.

## Flujos de usuario

### Confirmar sesión desde email

1. Estudiante agenda sesión → tutor recibe email.
2. Email contiene enlace `/dashboard?action=confirm-session&id={sessionId}`.
3. Tutor hace clic → `EmailActionController` detecta `action=confirm-session`.
4. Se abre `ConfirmSessionDialog`.
5. `confirmSession()` → `POST /scheduling/sessions/{sessionId}/confirm`.
6. La sesión pasa a estado `SCHEDULED`.
7. Se cierra el diálogo y se refrescan los datos del dashboard.

### Revisar modificación desde email

1. Un participante propone una modificación.
2. La otra parte recibe email con `action=review-modification&id={requestId}`.
3. `EmailActionController` abre `ReviewModificationDialog`.
4. Se obtiene el detalle con `getModificationRequest()`.
5. Usuario acepta o rechaza con `acceptModificationRequest()` / `rejectModificationRequest()`.

### Evaluar sesión desde email

1. Sesión completada → estudiante recibe email con `action=evaluate&id={sessionId}`.
2. Se abre `EvaluationDialog`.
3. Se cargan preguntas con `getEvaluationQuestions()`.
4. Usuario completa ratings y comentarios.
5. `sendSessionEvaluation()` envía la evaluación.

### Reprogramar sesión desde email

1. Email con `action=reschedule&id={sessionId}`.
2. Se abre `RescheduleDialog`.
3. Usuario selecciona nueva fecha/hora.
4. `modifySession()` propone la modificación.

### Confirmar correo

1. Nuevo usuario recibe email de confirmación.
2. Enlace a `/confirm-email?token={token}`.
3. `ConfirmEmailForm` valida el token y confirma la cuenta.

### Restablecer contraseña

1. Usuario solicita recuperación en `ForgotPasswordForm` (feature `auth`).
2. Email con enlace a `/reset-password?token={token}`.
3. `ResetPasswordForm` valida token y permite ingresar nueva contraseña.

## Relación con otras features

- **auth**: `ConfirmEmailForm` y `ResetPasswordForm` forman parte del flujo de autenticación.
- **sessions**: comparte conceptos de sesión, estados y DTOs. Muchos endpoints de `sessionService` también se usan en `sessions`.
- **history**: comparte los servicios de evaluación (`sendSessionEvaluation`, `getSessionEvaluationStatus`, `getEvaluationQuestions`).
- **dashboards**: el dashboard es la página anfitriona de `EmailActionController`; los diálogos se montan sobre el dashboard.
- **notifications**: muchas notificaciones generan emails que aterrizan en esta feature.

## Páginas Astro que la utilizan

- [src/pages/dashboard.astro](../../../pages/dashboard.astro): monta `EmailActionController` para acciones de sesión.
- [src/pages/confirm-email.astro](../../../pages/confirm-email.astro): renderiza `ConfirmEmailForm`.
- [src/pages/reset-password.astro](../../../pages/reset-password.astro): renderiza `ResetPasswordForm`.

## Notas técnicas

- `EmailActionController` es un componente cliente (React) que inspecciona `window.location.search`.
- La misma acción puede ser iniciada tanto por email (deep link) como por la UI interna (botón en dashboard/historial). `emailScreens` se encarga del primer caso.
- Los formularios `ConfirmEmailForm` y `ResetPasswordForm` son independientes porque sus páginas Astro no tienen layout de dashboard.

