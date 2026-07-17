# Landing

## Propósito y objetivo

La feature `landing` implementa la página de inicio pública de la aplicación. Su objetivo es:

- Presentar la propuesta de valor de Atlas/SGT a usuarios no autenticados.
- Proveer información sobre features principales (modalidades, calificaciones, colaboración, disponibilidad).
- Mostrar links a redes sociales y comunidad.
- Facilitar el acceso a los flujos de login, registro y recuperación de contraseña.

## Problema que resuelve

Antes de autenticarse, los visitantes necesitan entender qué hace la plataforma y cómo acceder. `landing` resuelve esto combinando contenido de marketing con los puntos de entrada a la autenticación.

## Componentes principales

- [components/PrincipalContent.astro](../components/PrincipalContent.astro): componente principal que organiza las secciones de la landing.

## Utilidades

### [utils/InteractConsts.ts](../utils/InteractConsts.ts)

- `INTERACT_CONSTS`: objeto de configuración con las features principales.
  - Modalidades.
  - Calificaciones.
  - Colaboración.
  - Disponibilidad.
  - Cada ítem incluye título, descripción, imagen e icono.

### [utils/CommunityConsts.ts](../utils/CommunityConsts.ts)

- `COMMUNITY_CONSTS`: links e información de redes sociales.
  - Instagram, LinkedIn, TikTok, WhatsApp.
  - Cada red incluye URL y asset asociado.

## Assets

- [assets/](../assets/): imágenes, ilustraciones y recursos visuales de la landing.

## Flujos de usuario

### Visitante no autenticado

1. Usuario accede a `/`.
2. Se renderiza `PrincipalContent` con secciones de valor y comunidad.
3. El usuario puede hacer clic en:
   - Iniciar sesión → abre `LoginDialog` (feature `auth`).
   - Registrarse → abre `RegistryDialog` (feature `auth`).
   - Recuperar contraseña → abre `ForgotPasswordForm` (feature `auth`).

## Relación con otras features

- **auth**: `landing` no autentica por sí misma, pero monta los diálogos de login, registro y recuperación de `auth`.
- No tiene dependencias directas con features de negocio (sessions, search, etc.).

## Páginas Astro que la utilizan

- [src/pages/index.astro](../../../pages/index.astro): página de inicio.

## Notas técnicas

- La landing es principalmente estática, lo que permite renderizado SSR ligero.
- Los diálogos de autenticación son islands de React para mantener interactividad sin sacrificar el renderizado inicial.
- Las constantes de contenido facilitan actualizar textos e imágenes sin tocar componentes.
