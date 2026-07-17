# Auth

## Propósito y objetivo

La feature `auth` centraliza todo el flujo de identidad y acceso de la aplicación Atlas/SGT-Frontend. Su objetivo es:

- Permitir el registro e inicio de sesión de usuarios (estudiantes y tutores).
- Gestionar tokens de sesión (`access_token` y `refresh_token`) mediante cookies.
- Forzar cambio de contraseña en el primer acceso (`requiresPasswordChange`).
- Detectar perfiles incompletos (`requiresProfileCompletion`) para redirigir al onboarding de tutor.
- Recuperar y restablecer contraseña mediante email.
- Proporcionar utilidades de lectura/validación de sesión tanto en servidor (SSR/Astro) como en cliente (React).

Esta feature es la base de la seguridad de la aplicación: cualquier otra feature que acceda a recursos protegidos depende del estado de autenticación establecido aquí.

## Problema que resuelve

Antes de que un usuario pueda buscar tutores, agendar sesiones o gestionar disponibilidad, el sistema debe:

1. Verificar quién es.
2. Validar credenciales contra el backend.
3. Mantener la sesión activa de forma segura.
4. Forzar políticas de seguridad (cambio de contraseña inicial).

`auth` encapsula estas responsabilidades y expone componentes reutilizables para los formularios de autenticación.

## Componentes principales

### Astro components

- [components/LoginForm.astro](../components/LoginForm.astro): Formulario de inicio de sesión. Se utiliza dentro de `LoginDialog` en la landing.
- [components/RegistryForm.astro](../components/RegistryForm.astro): Formulario de registro de nuevos usuarios.
- [components/LoginDialog.astro](../components/LoginDialog.astro): Diálogo/modal que envuelve `LoginForm`. Se monta en la landing.
- [components/RegistryDialog.astro](../components/RegistryDialog.astro): Diálogo/modal que envuelve `RegistryForm`.
- [components/ForgotPasswordForm.astro](../components/ForgotPasswordForm.astro): Formulario para solicitar recuperación de contraseña.
- [components/ChangePassword.astro](../components/ChangePassword.astro): Página/vista Astro para forzar el cambio de contraseña. Consumida por `src/pages/change-password.astro`.

### React islands

- [components/islands/ChangePasswordForm.tsx](../components/islands/ChangePasswordForm.tsx): Lógica interactiva del formulario de cambio de contraseña (validación, submit, estado).
- [components/islands/ChangePasswordGreeting.tsx](../components/islands/ChangePasswordGreeting.tsx): Mensaje de bienvenida contextual cuando se fuerza el cambio de contraseña.

## Servicios y APIs

### [services/authService.ts](../services/authService.ts)

Funciones que hablan directamente con el backend de autenticación:

- `login(email, password)` → `POST /auth/login`
  - Retorna `LoginResult`: `accessToken`, `refreshToken`, `user`, `requiresPasswordChange`, `requiresProfileCompletion`.
- `register(data: RegisterDto)` → `POST /auth/register`
  - Crea una cuenta nueva de estudiante o tutor.
- `validateEmail(email)` → `POST /auth/check-email`
  - Verifica si un correo ya está registrado (usado en landing/registro).
- `fetchMe(accessToken)` → `GET /auth/me`
  - Obtiene la información del usuario autenticado.
- `logout(data: LogoutDto, accessToken)` → `POST /auth/logout`
  - Invalida el refresh token en el backend y limpia cookies.
- `changePassword(...)` → `POST /auth/change-password` (a través del BFF)
  - Cambia la contraseña del usuario autenticado.

### [services/recoverPassword.ts](../services/recoverPassword.ts)

- `recoverPassword(email)` → `POST /auth/password/recover`
  - Envía un correo con enlace para restablecer contraseña.

## Utilidades

### [utils/authUtils.ts](../utils/authUtils.ts)

- `getUserIdFromCookie(cookies)`
  - Extrae el `access_token` de las cookies, decodifica el JWT y retorna el identificador de usuario.
  - Soporta múltiples claims posibles: `sub`, `idUser`, `id`, `userId`.
  - Uso principal: SSR, middleware y endpoints de API que necesitan el `userId` sin llamar al backend.
- `validateSession(cookies)`
  - Retorna `true` si existe un `access_token` válido en las cookies.
  - Uso: guards de rutas protegidas y layouts.

## Tipos

### [types.ts](../types.ts)

Definiciones centrales:

- `LoginResult`: respuesta del login incluyendo tokens, usuario y flags de onboarding.
- `RegisterDto`: payload para registro (nombre, email, contraseña, rol, etc.).
- `LogoutDto`: payload para logout (id de usuario y refresh token).
- Tipos auxiliares para manejo de errores de autenticación.

## Stores globales

La feature consume y actualiza [src/store/authStore.ts](../../../store/authStore.ts):

- `user: User | null`: datos del usuario logueado.
- `requiresPasswordChange: boolean`: indica si debe cambiar contraseña.
- `requiresProfileCompletion: boolean`: indica si debe completar perfil de tutor.
- Métodos: `setUser()`, `setRequiresPasswordChange()`, `setRequiresProfileCompletion()`, `clearUser()`.

`AuthHydrator.tsx` ([src/store/AuthHydrator.tsx](../../../store/AuthHydrator.tsx)) se encarga de sincronizar el estado de Zustand con los datos inyectados por Astro durante la hidratación.

## Flujos de usuario

### Login normal

1. Usuario accede a `src/pages/index.astro`.
2. Abre `LoginDialog` → `LoginForm` → envía credenciales.
3. `authService.login()` retorna tokens y flags.
4. El BFF/backend establece cookies `access_token` y `refresh_token`.
5. `authStore.setUser(user)` y se evalúan flags.
6. Si `requiresPasswordChange` → redirige a `/change-password.astro`.
7. Si `requiresProfileCompletion` (tutor) → redirige al flujo de `tutorProfile`.
8. Si todo está OK → redirige a `/dashboard.astro`.

### Registro

1. Usuario abre `RegistryDialog` → `RegistryForm`.
2. `validateEmail()` previene emails duplicados.
3. `register()` crea la cuenta.
4. Dependiendo del rol, se redirige al login o al onboarding.

### Recuperación de contraseña

1. En la landing, usuario abre `ForgotPasswordForm`.
2. `recoverPassword()` envía email con token.
3. Usuario hace clic en el enlace → `/reset-password.astro`.
4. En `reset-password.astro` se monta `ResetPasswordForm` (desde `emailScreens`).

### Cierre de sesión

1. `UserMenuDropdown` (feature `general`) invoca logout.
2. Se llama a `/api/auth/logout` (BFF) o directamente a `authService.logout()`.
3. Se limpian cookies y `authStore.clearUser()`.
4. Redirección a `/`.

## Relación con otras features

- **general**: `UserMenuDropdown` usa `auth` para logout y para mostrar datos del usuario.
- **dashboards**: el dashboard se renderiza solo cuando `authStore.user` existe; usa el rol para mostrar vista de tutor o estudiante.
- **tutorProfile**: cuando `requiresProfileCompletion` es `true`, el usuario es redirigido al wizard de completar perfil.
- **emailScreens**: `ResetPasswordForm` y `ConfirmEmailForm` manejan acciones de email relacionadas con autenticación.
- **sessions / search / history / availability**: todas estas features requieren un token válido; no manejan autenticación, pero dependen de que `auth` haya establecido la sesión.

## Páginas Astro que la utilizan

- [src/pages/index.astro](../../../pages/index.astro): landing con `LoginDialog`, `RegistryDialog` y `ForgotPasswordForm`.
- [src/pages/change-password.astro](../../../pages/change-password.astro): pantalla forzada de cambio de contraseña.
- [src/pages/confirm-email.astro](../../../pages/confirm-email.astro): confirmación de correo electrónico.
- [src/pages/reset-password.astro](../../../pages/reset-password.astro): restablecimiento de contraseña mediante token.

## Notas técnicas

- El token se almacena en cookies `httpOnly` gestionadas por el BFF/astro endpoints; el cliente no accede directamente al JWT en JS.
- `getUserIdFromCookie` se usa en endpoints de API propios (`src/pages/api/*`) para identificar al usuario sin costo adicional.
- Los formularios Astro delegan la lógica de estado y submit a React islands para tener interactividad sin perder SSR.
