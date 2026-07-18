# Dashboards

## Propósito y objetivo

La feature `dashboards` implementa el panel de control principal de la aplicación, adaptativo al rol del usuario autenticado. Su objetivo es:

- Mostrar un resumen personalizado de la actividad del usuario.
- Presentar próximas sesiones, estadísticas semanales y notificaciones.
- Permitir acciones rápidas (confirmar sesiones, gestionar disponibilidad, ver historial).
- Servir como punto de entrada después del login exitoso.

Es la feature más integradora: reúne datos de `sessions`, `availability`, `notifications` y `emailScreens`.

## Problema que resuelve

Después de iniciar sesión, el usuario necesita una vista unificada donde pueda ver:

1. Qué sesiones tiene próximamente.
2. Métricas relevantes (horas impartidas, estudiantes alcanzados, sesiones completadas).
3. Notificaciones pendientes.
4. Accesos directos a funcionalidades frecuentes.

`dashboards` resuelve esto consolidando datos de múltiples features en una sola pantalla.

## Componentes principales

- [components/DashboardLoader.tsx](../components/DashboardLoader.tsx): orquestador de la carga de datos del dashboard. Decide qué endpoint llamar según el rol del usuario.
- [components/DashboardSessionManager.tsx](../components/DashboardSessionManager.tsx): gestiona el estado y las interacciones de las sesiones mostradas en el dashboard.
- [components/IncomingSessionsCard.tsx](../components/IncomingSessionsCard.tsx): lista las próximas sesiones. Muestra un badge de **estado** con color por estado (Programada/Completada/Pendiente) y **filtra** qué sesiones aparecen según estado y rol (`COMPLETED` solo para tutores; canceladas, rechazada y expirada no se muestran). Añade el badge Cerrada/Abierta (`sessionType`) y el badge de materia coloreado desde `subjectStore.colorMap`.
- [components/WelcomeBanner.tsx](../components/WelcomeBanner.tsx): banner de bienvenida personalizado con el nombre del usuario.
- [components/TutorAvailabilityManager.tsx](../components/TutorAvailabilityManager.tsx): componente para que el tutor gestione su disponibilidad directamente desde el dashboard.
- [components/TutorAvailabilityBar.tsx](../components/TutorAvailabilityBar.tsx): barra visual que muestra horas usadas vs. límite semanal.
- [components/StatCard.tsx](../components/StatCard.tsx): tarjeta genérica para mostrar métricas numéricas.
- [components/RoleBadge.tsx](../components/RoleBadge.tsx): badge que indica el rol actual del usuario.
- [components/notifications/NotificationsPanel.tsx](../components/notifications/NotificationsPanel.tsx): panel lateral o dropdown de notificaciones.

## Servicios y APIs

### [services/dashboardService.ts](../services/dashboardService.ts)

- `getTutorDashboard(token)` → `GET /dashboard/tutor`
  - Retorna `TutorDashboardResponse`: horas semanales, sesiones próximas, estudiantes alcanzados.
- `getStudentDashboard(token)` → `GET /dashboard/student`
  - Retorna `StudentDashboardResponse`: conteo de sesiones, sesiones próximas.
- `fetchTutorDashboardBFF()` → `GET /api/dashboard/tutor`
  - Versión BFF que lee cookies automáticamente, usada en SSR/Astro.
- `fetchStudentDashboardBFF()` → `GET /api/dashboard/student`
  - Versión BFF para estudiantes.
- Hook: `useDashboardData()`
  - Wrapper React que encapsula la lógica de llamar al endpoint correcto según el rol.

### [services/notificationsService.ts](../services/notificationsService.ts)

- `getNotificationsInbox(token, query)` → `GET /notifications/inbox`
  - Retorna `NotificationsResponse` paginado.
- `markNotificationAsRead(token, id)` → `PATCH /notifications/{id}/read`
  - Marca una notificación como leída.
- Tipos:
  - `AppNotification`: entidad de notificación.
  - `AppNotificationType`: enum con tipos como `SESSION_REQUEST_RECEIVED`, `SESSION_CONFIRMED`, `EVALUATION_PENDING`, etc.

## Tipos

### [types/dashboard.types.ts](../types/dashboard.types.ts)

- `DashboardSessionSummary`: resumen de sesión usado exclusivamente en el dashboard.
- `TutorDashboardResponse`: respuesta completa del endpoint de tutor.
- `StudentDashboardResponse`: respuesta completa del endpoint de estudiante.

## Utilidades

### [utils/dashboardMapper.ts](../utils/dashboardMapper.ts)

- `mapDashboardSessionToSession(summary, userRole)`
  - Convierte un `DashboardSessionSummary` en una `Session` completa para reutilizar componentes de `sessions`.
    Propaga `sessionType` (INDIVIDUAL/GROUP) y arma tutor/participantes según el rol.
- `mapDashboardSessions(sessions)`
  - Mapea colecciones enteras.

### [utils/incomingSessionsUtils.ts](../utils/incomingSessionsUtils.ts)

- Utilidades para filtrar, ordenar y formatear las sesiones próximas que se muestran en `IncomingSessionsCard`.

## Stores globales

- [src/store/availabilityStore.ts](../../../store/availabilityStore.ts): métricas de horas y disponibilidad del tutor.
- [src/store/sessionStore.ts](../../../store/sessionStore.ts): lista de sesiones mostradas en el dashboard.
- [src/store/subjectStore.ts](../../../store/subjectStore.ts): `colorMap` de materias (color de fondo/borde del badge de materia en `IncomingSessionsCard`).

## Flujos de usuario

### Login exitoso

1. Usuario inicia sesión.
2. `auth` redirige a `/dashboard`.
3. `DashboardLoader` detecta el rol (`STUDENT` o `TUTOR`).
4. Llama a `fetchTutorDashboardBFF()` o `fetchStudentDashboardBFF()` en SSR.
5. Se renderizan `WelcomeBanner`, `IncomingSessionsCard`, `NotificationsPanel` y métricas.

### Tutor gestionando disponibilidad

1. En el dashboard de tutor se muestra `TutorAvailabilityBar`.
2. El tutor hace clic en gestionar disponibilidad.
3. Se abre `TutorAvailabilityManager` o se redirige a `/availability`.

### Confirmar sesión desde email

1. El tutor recibe un email con enlace a `/dashboard?action=confirm-session&id={sessionId}`.
2. `EmailActionController` (feature `emailScreens`) detecta los query params.
3. Abre `ConfirmSessionDialog` sobre el dashboard.
4. Al confirmar, se actualiza `sessionStore` y se refresca el dashboard.

## Relación con otras features

- **auth**: el dashboard solo es accesible para usuarios autenticados; lee `authStore.user` para personalizar la vista.
- **sessions**: muestra sesiones próximas y usa `mapDashboardSessionToSession` para compatibilidad de tipos.
- **availability**: muestra métricas de disponibilidad y horas semanales.
- **emailScreens**: el dashboard es la página anfitriona de los diálogos de acción por email (`ConfirmSessionDialog`, `EvaluationDialog`, etc.).
- **notifications**: el panel de notificaciones consume `notificationsService`.
- **history**: desde el dashboard se puede navegar al historial de sesiones.

## Páginas Astro que la utilizan

- [src/pages/dashboard.astro](../../../pages/dashboard.astro): página principal del dashboard, rol-agnóstica. Recibe datos del BFF y los hidrata en componentes React.

## Notas técnicas

- El dashboard usa BFF (Backend for Frontend) para obtener datos iniciales en SSR, reduciendo la latencia percibida.
- La separación `DashboardLoader` / `DashboardSessionManager` permite que la página Astro se enfoque en layout mientras los componentes React manejan estado.
- El mapeo entre `DashboardSessionSummary` y `Session` es necesario porque el backend devuelve un resumen más ligero para el dashboard.
