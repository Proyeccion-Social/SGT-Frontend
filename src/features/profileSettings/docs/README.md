# Profile Settings

## Propósito y objetivo

La feature `profileSettings` permite a los usuarios gestionar la configuración de su perfil. Su objetivo es:

- Actualizar información personal (nombre, email, carrera).
- Configurar preferencias de modalidad (presencial/virtual).
- Gestionar las materias asociadas (estudiante/tutor).
- Establecer el límite de horas semanales para tutores.
- Proveer una experiencia de edición en diálogos modales accesibles desde cualquier pantalla.

## Problema que resuelve

Una vez autenticado, el usuario necesita:

1. Mantener sus datos actualizados.
2. Indicar en qué materias puede recibir o dar tutoría.
3. Definir su disponibilidad máxima semanal (tutores).
4. Elegir su modalidad preferida.

`profileSettings` encapsula estos formularios y sus respectivas llamadas al API.

## Componentes principales

- [components/islands/ProfileSettingsDialog.tsx](../components/islands/ProfileSettingsDialog.tsx): diálogo principal de configuración para estudiantes.
- [components/islands/GeneralSettingsView.tsx](../components/islands/GeneralSettingsView.tsx): tab de información general.
- [components/islands/FormGeneral.tsx](../components/islands/FormGeneral.tsx): formulario de información general (nombre, email, carrera).
- [components/islands/BasicInformation.tsx](../components/islands/BasicInformation.tsx): visualización de información básica.
- [components/islands/PreferencesView.tsx](../components/islands/PreferencesView.tsx): tab de preferencias (modalidad, carrera).
- [components/islands/ProfileChooseSubjects.tsx](../components/islands/ProfileChooseSubjects.tsx): selector de materias para tutores.
- [components/islands/TutorSubjectsView.tsx](../components/islands/TutorSubjectsView.tsx): vista de materias del tutor.
- [components/islands/TutorProfileDialog.tsx](../components/islands/TutorProfileDialog.tsx): diálogo de configuración específico para tutores.
- [components/islands/HoursLimit.tsx](../components/islands/HoursLimit.tsx): control para establecer el límite de horas semanales.
- [components/islands/TestDialogPage.tsx](../components/islands/TestDialogPage.tsx): página de prueba de diálogos.

## Servicios y APIs

### [services/settingsServices.ts](../services/settingsServices.ts)

- `getStudentPreferences(token)` → `GET /students/me/preferences`
  - Retorna `StudentPreferences` (carrera, modalidad preferida).
- `updateStudentPreferences(token, data: UpdatePreferencesDto)` → `PATCH /students/me/preferences`
  - Actualiza preferencias del estudiante.
- `getStudentSubjects(token)` → `GET /students/me/subjects`
  - Lista las materias del estudiante.
- `getTutorSubjects(token)` → `GET /tutors/me/subjects`
  - Lista las materias del tutor.
- `updateTutorSubjects(token, subjectIds)` → `PUT /tutors/me/subjects`
  - Reemplaza la lista de materias del tutor.
- `getTutorProfile(token)` → `GET /tutors/me/profile`
  - Obtiene el perfil del tutor.
- `updateTutorProfile(token, data: UpdateTutorProfileDto)` → `PUT /tutors/me/profile`
  - Actualiza datos generales del perfil de tutor.
- `getTutorHoursStatus(token)` → `GET /tutors/me/hours-status`
  - Estado de horas semanales.
- `toggleTutorActive(token, active: boolean)` → `POST /tutors/me/active`
  - Activa/desactiva la disponibilidad pública del tutor.

## Tipos

- `StudentPreferences`: carrera y modalidad preferida.
- `UpdatePreferencesDto`: payload para actualizar preferencias.
- `UpdateTutorProfileDto`: payload para actualizar perfil de tutor.
- `Subject`: materia con `id` y `name`.

## Flujos de usuario

### Estudiante abre configuración

1. Usuario hace clic en menú de usuario → "Configuración".
2. Se abre `ProfileSettingsDialog`.
3. Pestaña "General": edita nombre, email, carrera.
4. Pestaña "Preferencias": selecciona modalidad preferida.
5. Los cambios se guardan con `updateStudentPreferences()`.

### Tutor abre configuración

1. Se abre `TutorProfileDialog`.
2. Pestañas específicas para tutor:
   - Información general (`FormGeneral`, `BasicInformation`).
   - Materias (`ProfileChooseSubjects`, `TutorSubjectsView`).
   - Límite de horas (`HoursLimit`).
3. Los cambios se guardan con `updateTutorProfile()` y `updateTutorSubjects()`.

### Activar/desactivar perfil de tutor

1. En la configuración, el tutor puede activar o pausar su visibilidad.
2. `toggleTutorActive()` actualiza el estado en el backend.

## Relación con otras features

- **general**: `UserMenuDropdown` abre `ProfileSettingsDialog` / `TutorProfileDialog`.
- **auth**: lee `authStore.user` para conocer el rol y datos básicos.
- **availability / tutorAvailability**: el límite de horas y las materias configuradas aquí afectan directamente la disponibilidad mostrada a los estudiantes.
- **search**: las materias del tutor determinan en qué búsquedas aparece.

## Páginas Astro que la utilizan

- No tiene página propia; se monta como diálogo dentro de layouts principales (`Layout.astro`, layouts de dashboard).

## Notas técnicas

- La separación entre `ProfileSettingsDialog` (estudiante) y `TutorProfileDialog` (tutor) permite flujos de UI distintos sin mezclar lógica.
- Los formularios usan validación cliente antes de enviar al API.
- El toggle de activación de tutor es importante para controlar si el tutor aparece en resultados de búsqueda.
