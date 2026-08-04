# Tutor Profile

## Propósito y objetivo

La feature `tutorProfile` implementa el flujo de onboarding y gestión del perfil de tutor. Su objetivo es:

- Recolectar datos personales del tutor durante el registro inicial.
- Permitir seleccionar las materias que enseñará.
- Configurar horario disponible y límite de horas semanales.
- Forzar el cambio de contraseña inicial.
- Completar el perfil antes de permitir el acceso al dashboard.

## Problema que resuelve

Cuando un nuevo tutor se registra, el sistema necesita:

1. Información personal completa.
2. Materias de especialización.
3. Disponibilidad inicial.
4. Políticas de seguridad (cambio de contraseña).

`tutorProfile` guía al tutor a través de estos pasos antes de habilitar funcionalidades principales.

## Componentes principales

- [components/PersonalData.tsx](../components/PersonalData.tsx): ingreso de datos personales del tutor.
- [components/ChooseSubjects.tsx](../components/ChooseSubjects.tsx): selección de materias a enseñar.
- [components/SetAvailabilityHours.tsx](../components/SetAvailabilityHours.tsx): configuración inicial de horario disponible.
- [components/SetNewPassword.tsx](../components/SetNewPassword.tsx): cambio de contraseña inicial.
- [components/Finish.tsx](../components/Finish.tsx): pantalla de conclusión del onboarding.

## Servicios y APIs

### [services/tutorService.ts](../services/tutorService.ts)

- `getTutorStatus(accessToken)` → `GET /tutors/me/status`
  - Obtiene el estado del perfil de tutor.
- `getTutorProfile(accessToken)` → `GET /tutors/profile`
  - Obtiene el perfil actual del tutor.
- `completeTutorProfile(data: CompleteTutorProfileDto, accessToken)` → `POST /tutors/profile/complete`
  - Envía el perfil completo al finalizar el onboarding.

### DTO de completado

```ts
CompleteTutorProfileDto {
  phone: string;
  max_weekly_hours: number;
  subject_ids: number[];
  availabilities?: AvailabilitySlot[];
}
```

## Tipos

- `CompleteTutorProfileDto`: payload para completar perfil.
- Tipos auxiliares para slots de disponibilidad, materias seleccionadas, etc.

## Flujos de usuario

### Onboarding de tutor

1. Nuevo tutor completa el registro en la landing.
2. El backend retorna `requiresProfileCompletion=true`.
3. `auth` redirige al wizard de `tutorProfile`.
4. El tutor completa los pasos:
   - Selección de materias.
   - Datos personales.
   - Configuración de horario.
   - Cambio de contraseña.
5. Al finalizar, `completeTutorProfile()` envía todo al backend.
6. On success, redirige al dashboard de tutor.

### Actualizar perfil después del onboarding

1. Tutor accede a "Configuración" desde el menú de usuario.
2. Se abre `TutorProfileDialog` (feature `profileSettings`) para ediciones posteriores.
3. `tutorProfile` se enfoca en el onboarding inicial, mientras que `profileSettings` gestiona actualizaciones.

## Relación con otras features

- **auth**: detecta `requiresProfileCompletion` y redirige al onboarding. `SetNewPassword` extiende el flujo de cambio de contraseña.
- **profileSettings**: comparte conceptos de materias, horas y datos personales. `profileSettings` es la versión de mantenimiento; `tutorProfile` es el wizard inicial.
- **tutorAvailability**: el paso de disponibilidad inicial utiliza conceptos similares a `tutorAvailability`.
- **availability**: el perfil completado afecta cómo el tutor aparece en búsquedas.

## Páginas Astro que la utilizan

- No tiene una página Astro dedicada visible en la estructura; el onboarding se renderiza típicamente dentro de un layout especial o de forma condicional tras el registro.

## Notas técnicas

- El onboarding es un wizard multi-paso. Cada paso puede mantener estado local o global antes del envío final.
- `completeTutorProfile` agrupa múltiples configuraciones en un solo request para atomicidad.
