# Search

## Propósito y objetivo

La feature `search` permite a los estudiantes descubrir y filtrar tutores disponibles. Su objetivo es:

- Listar todos los tutores que tienen slots disponibles.
- Filtrar por materia, modalidad, calificación y disponibilidad.
- Mostrar el detalle de un tutor seleccionado, incluyendo su disponibilidad semanal.
- Servir como punto de entrada al flujo de agendamiento de sesiones.

## Problema que resuelve

Un estudiante necesita encontrar rápidamente un tutor que:

1. Imparta la materia que necesita.
2. Tenga disponibilidad en el horario deseado.
3. Ofrezca la modalidad preferida (presencial/virtual).

`search` resuelve esto combinando filtros, listado y detalle en una sola interfaz.

## Componentes principales

- [components/Search.astro](../components/Search.astro): componente principal que organiza la página de búsqueda.
- [components/SearchBar.astro](../components/SearchBar.astro): barra de búsqueda y filtros principales.
- [components/TutorList.astro](../components/TutorList.astro): lista de tarjetas de tutores.
- [components/TutorDetail.astro](../components/TutorDetail.astro): panel de detalle del tutor seleccionado.
- [components/Filters.tsx](../components/Filters.tsx): componente React con filtros avanzados.
- [components/TutorFilters.tsx](../components/TutorFilters.tsx): filtros específicos para tutores.
- [components/DialogFilter.astro](../components/DialogFilter.astro): diálogo de filtros optimizado para móvil.

## Servicios y APIs

### [services/getAllTutors.ts](../services/getAllTutors.ts)

- `getAllTutors(token?)` → `GET /availability/tutors/slots`
  - Retorna todos los tutores con sus slots disponibles.

### [services/getAllSubjects.ts](../services/getAllSubjects.ts)

- `getAllSubjects(token)` → `GET /availability/subjects`
  - Lista de materias disponibles para filtrar.

### [services/getTutorProfile.ts](../services/getTutorProfile.ts)

- `getTutorProfile(tutorId, token)` → `GET /tutors/{tutorId}`
  - Perfil completo de un tutor.

### [services/getTutorAvailability.ts](../services/getTutorAvailability.ts)

- `getTutorAvailability(tutorId)` → `GET /availability/tutors/{tutorId}/slots`
  - Slots específicos de un tutor. No recibe token ni query en la firma actual.

## Tipos

- Tipos reutilizados de `availability` (`TutorInfo`, `Slot`, `Modality`).
- Tipos propios para el estado de filtros y resultados de búsqueda.

## Flujos de usuario

### Buscar tutores

1. Estudiante navega a `/search`.
2. `Search.astro` carga la lista inicial de tutores en SSR.
3. El estudiante aplica filtros (materia, modalidad, rating).
4. `Filters` / `TutorFilters` actualizan el estado de búsqueda.
5. `TutorList` se actualiza mostrando los tutores que coinciden.

### Ver detalle de tutor

1. El estudiante hace clic en un tutor de la lista.
2. Se abre `TutorDetail`.
3. Se cargan el perfil completo y la disponibilidad semanal.
4. El estudiante ve foto, bio, materias, modalidades y slots.

### Agendar desde búsqueda

1. En `TutorDetail`, el estudiante hace clic en "Agendar".
2. Navega a `/sessions` con `subjectId` como query param.
3. El flujo continúa en `sessions` / `StudentSchedule`.

## Relación con otras features

- **availability**: consume slots y datos de tutores. Depende directamente de los servicios de `availability`.
- **sessions**: la acción principal de `search` es iniciar el agendamiento; navega a `sessions`.
- **auth**: requiere sesión activa para acceder a `/search`.
- **dashboards**: desde el dashboard el estudiante puede navegar a búsqueda.

## Páginas Astro que la utilizan

- [src/pages/search/index.astro](../../../pages/search/index.astro): página de búsqueda de tutores.

## Notas técnicas

- La carga inicial de tutores es SSR para mejorar el tiempo de primera pintura.
- Los filtros avanzados se manejan en el cliente usando React islands.
- `TutorDetail` puede cargar disponibilidad bajo demanda para no sobrecargar la carga inicial.
- Las fotos de tutores (Cloudinary) se optimizan en runtime con `cloudinaryImage()` / `CloudinaryImage` (`src/lib/cloudinary.ts`): `f_auto`, `q_auto`, tamaño por contexto (`list` en accordion, `profile` en detalle), `loading="lazy"` en listado y fallback `/default-avatar.svg`. Ver `docs/specs/issue-#242.md` y `docs/specs/adr-cloudinary-transforms.md`.
