# General

## Propósito y objetivo

La feature `general` alberga componentes y utilidades compartidas que no pertenecen a un dominio de negocio específico, pero que son transversales a la aplicación. Su objetivo es:

- Proveer componentes de UI globales usados en múltiples layouts.
- Centralizar acciones comunes de usuario como cerrar sesión, abrir configuración y ver perfil.
- Servir como punto de integración entre `auth`, `profileSettings`, `dashboards` y otras features.

## Problema que resuelve

Varias pantallas necesitan los mismos controles de usuario (menú de usuario, dropdown de navegación, etc.). En lugar de repetir esta lógica en cada feature, `general` la centraliza.

## Componentes principales

- [components/islands/UserMenuDropdown.tsx](../components/islands/UserMenuDropdown.tsx): dropdown principal del menú de usuario.
  - Muestra nombre, avatar y rol del usuario autenticado.
  - Provee accesos directos a configuración de perfil.
  - Ejecuta logout llamando al endpoint de autenticación.

## Servicios y APIs

La feature no tiene servicios propios, pero realiza llamadas a:

- `/api/auth/check-session` (BFF): valida si la sesión sigue activa antes de mostrar opciones sensibles.
- `/api/auth/logout` (BFF): cierra la sesión.

## Utilidades

- Integra utilidades de `auth` para decodificar el usuario actual.
- Usa helpers de `lib/utils.ts` para formateo y manejo de clases de Tailwind.

## Flujos de usuario

### Abrir menú de usuario

1. Usuario hace clic en avatar o nombre en el header.
2. Se monta `UserMenuDropdown`.
3. Se valida sesión activa vía `/api/auth/check-session`.
4. Se muestran opciones según rol.

### Cerrar sesión

1. Usuario selecciona "Cerrar sesión".
2. `UserMenuDropdown` llama al logout.
3. Se limpian cookies y stores.
4. Redirección a landing.

### Abrir configuración

1. Usuario selecciona "Configuración".
2. `UserMenuDropdown` abre `ProfileSettingsDialog` (feature `profileSettings`) o `TutorProfileDialog` según el rol.

## Relación con otras features

- **auth**: consume el estado de autenticación y ejecuta logout.
- **profileSettings**: abre los diálogos de configuración de estudiante y tutor.
- **dashboards**: se monta dentro del layout del dashboard.
- **tutorProfile**: en algunos flujos el menú permite acceder al perfil de tutor.

## Páginas Astro que la utilizan

- `src/layouts/Layout.astro`: layout principal que incluye el header con `UserMenuDropdown`.
- `src/layouts/dashboards/`: layouts específicos del dashboard donde se renderiza el menú.
- [src/pages/dashboard.astro](../../../pages/dashboard.astro): dashboard con menú de usuario.

## Notas técnicas

- `UserMenuDropdown` es una React island para permitir interactividad dentro de layouts Astro.
- La validación de sesión es defensiva: si la sesión expiró, el dropdown puede redirigir al login.
