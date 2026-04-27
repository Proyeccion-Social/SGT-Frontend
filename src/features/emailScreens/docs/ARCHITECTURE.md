# Arquitectura Técnica - emailScreens

## 1. Orquestación: EmailActionController
El componente `EmailActionController` actúa como el "cerebro" de la feature. Está montado globalmente en `DashboardLayout.astro` y escucha los parámetros de la URL:

- **Trigger**: Parámetros de consulta (`?action=X&id=Y`).
- **Acciones soportadas**: `confirm`, `review-modification`, `reschedule`, `evaluate`.
- **Limpieza**: Al cerrar cualquier diálogo, el controlador limpia los parámetros de la URL sin recargar la página utilizando `window.history.replaceState`.

## 2. BFF (Backend For Frontend)
Todas las solicitudes pasan por rutas de API locales para manejar la seguridad y simplificar el mapeo de datos:

- `src/pages/api/emailScreens/sessions/[sessionId].ts`
- `src/pages/api/emailScreens/modification-requests/[requestId].ts`
- `src/pages/api/emailScreens/evaluations/submit.ts`
- `src/pages/api/emailScreens/reset-password.ts`

Estas rutas actúan como proxies hacia el API principal (`PUBLIC_API_URL`), transformando los errores en mensajes legibles para el frontend.

## 3. Flujo de Datos
1. El usuario hace clic en el correo → Lleva al Dashboard con parámetros.
2. `EmailActionController` detecta los parámetros y monta el diálogo correspondiente.
3. El diálogo hace un `fetch` inicial al BFF para obtener los detalles de la sesión/solicitud.
4. Se renderiza la interfaz basada en el diseño SDV.
5. El usuario ejecuta la acción (Aceptar/Rechazar) → POST al BFF.
6. Éxito: Se muestra mensaje de confirmación y se cierra automáticamente tras 1.5s.

## 4. Manejo de Errores
- Los errores de red o lógica del backend se capturan en bloques `try/catch`.
- Se muestran visualmente dentro del diálogo utilizando la clase `.es-card__error` para mantener la consistencia.

## 5. Acciones Públicas (Reset Password)
A diferencia de los diálogos de sesión, el restablecimiento de contraseña es una **página completa independiente** (`/reset-password`):
- **Exclusión de Middleware**: No requiere autenticación.
- **Validación de Token**: El token se extrae de la URL y se valida contra el backend.
- **Seguridad**: El BFF utiliza `new URL()` y `searchParams` para asegurar que el token se reenvíe al backend de forma segura y codificada.
