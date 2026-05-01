# Arquitectura Técnica - emailScreens

## 1. Orquestación: EmailActionController
El componente `EmailActionController` actúa como el "cerebro" de la feature para acciones autenticadas. Está montado globalmente en `DashboardLayout.astro` y escucha los parámetros de la URL:

- **Trigger**: Parámetros de consulta (`?action=X&id=Y`).
- **Acciones soportadas**: `confirm-session`, `review-modification`, `reschedule`, `evaluate`.
- **Limpieza**: Al cerrar cualquier diálogo, el controlador limpia los parámetros de la URL sin recargar la página utilizando `window.history.replaceState`.

## 2. BFF (Backend For Frontend)
Todas las solicitudes pasan por rutas de API locales (Astro API Routes) para manejar la seguridad, inyectar tokens de sesión y simplificar el mapeo de datos:

### Rutas de Sesión (Protegidas)
- `src/pages/api/emailScreens/sessions/[sessionId].ts`
- `src/pages/api/emailScreens/modification-requests/[requestId].ts`

### Rutas de Evaluación
- `src/pages/api/emailScreens/evaluations/questions.ts`
- `src/pages/api/emailScreens/evaluations/submit.ts`

### Rutas Públicas
- `src/pages/api/auth/validate-email.ts`
- `src/pages/api/emailScreens/confirm-email.ts`
- `src/pages/api/emailScreens/reset-password.ts`

## 3. Flujos de Datos

### Flujo de Diálogos (Auth)
1. El usuario hace clic en el correo → Dashboard con parámetros `?action=...`.
2. `EmailActionController` detecta los parámetros y monta el diálogo.
3. El diálogo hace un `fetch` al BFF para obtener detalles.
4. El usuario ejecuta la acción → POST/PATCH al BFF.
5. Éxito: Feedback visual (Sileo/Alert) y cierre automático.

### Flujo de Páginas Públicas (No Auth)
1. El usuario llega a `/confirm-email` o `/reset-password` con un `token` en la URL.
2. El componente React extrae el token y valida el estado inicial.
3. El usuario interactúa con el formulario (ej: ingresa nueva password).
4. Se envía el token + datos al BFF público.
5. El BFF reenvía la petición al API central codificando correctamente los parámetros.

## 4. Manejo de Errores
- Los errores se capturan en bloques `try/catch`.
- Se utilizan notificaciones de **Sileo** para errores globales y clases CSS como `.es-card__error` para errores específicos dentro de tarjetas.
- El BFF normaliza las respuestas del backend para asegurar que `message` siempre esté disponible.

## 5. Seguridad
- **Tokens de Sesión**: Las rutas protegidas obtienen el `access_token` de las cookies del navegador.
- **Tokens de Correo**: Los tokens recibidos por URL son de un solo uso y validados estrictamente en el backend.
- **Limpieza de URL**: Previene que el usuario re-ejecute acciones al refrescar la página.
