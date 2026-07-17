# Student Profile

## Propósito y objetivo

La feature `studentProfile` agrupa componentes y lógica específica del perfil de estudiante. Su objetivo es:

- Mostrar y gestionar datos adicionales del estudiante.
- Complementar la información básica de `auth` con campos propios del dominio estudiantil.
- Servir como extensión de `profileSettings` para casos específicos de estudiantes.

## Problema que resuelve

Los estudiantes pueden tener información adicional que no está en el usuario base (carrera, semestre, intereses, etc.). `studentProfile` encapsula estos datos y su presentación.

## Componentes principales

- [components/StudentAdditionalData.tsx](../components/StudentAdditionalData.tsx): componente para mostrar o editar datos adicionales del estudiante.

## Servicios y APIs

No define servicios propios; utiliza los servicios de `profileSettings` para actualizar preferencias y datos del estudiante:

- `getStudentPreferences(token)` → `GET /students/me/preferences`
- `updateStudentPreferences(token, data)` → `PATCH /students/me/preferences`

## Tipos

Reutiliza los tipos de `profileSettings` (`StudentPreferences`, `UpdatePreferencesDto`) y de `auth` (`User`).

## Flujos de usuario

### Ver datos adicionales

1. Estudiante accede a configuración de perfil.
2. `StudentAdditionalData` muestra campos complementarios.
3. Si es editable, los cambios se envían vía `profileSettings` services.

## Relación con otras features

- **profileSettings**: `studentProfile` es una extensión específica del perfil de estudiante. Comparte servicios y tipos.
- **auth**: lee el usuario autenticado para personalizar la información.
- **landing / dashboards**: no depende directamente, pero su información puede mostrarse en otros contextos.

## Páginas Astro que la utilizan

- No tiene página propia. Se monta dentro de diálogos o vistas de `profileSettings`.

## Notas técnicas

- Es una feature pequeña y especializada. Si el dominio estudiantil crece, aquí deberían agregarse nuevos componentes y servicios.
- Mantiene separada la lógica de estudiante de la de tutor para evitar acoplamiento.
