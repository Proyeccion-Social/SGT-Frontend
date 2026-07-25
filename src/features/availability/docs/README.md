# Availability

## Propósito y objetivo

La feature `availability` gestiona la información de disponibilidad de los tutores. Su objetivo es:

- Obtener los slots (franjas horarias) disponibles de un tutor.
- Exponer la información pública de tutores (materias, modalidades, foto, nombre).
- Proveer a los estudiantes los datos necesarios para agendar una sesión.
- Servir de capa de lectura de disponibilidad que otras features consumen (search, sessions, dashboards).

A diferencia de `tutorAvailability` —que se enfoca en la edición de disponibilidad por parte del tutor—, `availability` se enfoca principalmente en la **lectura** de disponibilidad.

## Problema que resuelve

Los estudiantes necesitan saber:

1. Qué tutores están disponibles.
2. En qué horarios.
3. De forma presencial o virtual.

`availability` encapsula las llamadas al backend que resuelven estas preguntas y transforma los datos crudos en estructuras útiles para la UI.

## Componentes principales

- [components/](../components/): componentes Astro y React relacionados con la visualización de calendarios y slots.
  - La carpeta contiene componentes de calendario reutilizables que muestran disponibilidad semanal.
  - Se usan en `StudentSchedule` (sessions) y en el dashboard de tutor.

## Servicios y APIs

### [services/availabilityService.ts](../services/availabilityService.ts)

- `getMyAvailability(token)` → `GET /availability/tutors/me`
  - Retorna la disponibilidad del tutor autenticado, usualmente agrupada por día.
  - Tipos: `RawSlot[]`, `TutorAvailabilityResponse`.
- `getTutorSlots(query: GetAvailabilityQueryDto, token)` → `GET /availability/tutors/{tutorId}/slots`
  - Slots de un tutor específico en un rango de fechas.
- `getTutorSlotsDetailedSSR(query, token)` → obtiene slots + información de tutor.
  - Usado principalmente en `StudentSchedule` para cargar todo en SSR.
- `getTutorWorkload(token)` → `GET /availability/tutors/me/workload`
  - Retorna la carga de trabajo actual del tutor.
- `setWeeklyLimit(hours, token)` → `POST /availability/tutor/limits`
  - Establece el límite semanal de horas.
- `manageSlot(data: ManageSlotDto, token)` → `POST /availability/tutor/slots`
  - Crear/actualizar/borrar slots individuales.
- `getOwnTutorProfile(token)` → `GET /tutors/profile`
  - Obtiene el perfil del tutor autenticado.

### [services/tutorServices.ts](../services/tutorServices.ts)

- `getTutorInfo(tutorId, authHeader)` → `GET /tutors/{tutorId}`
  - Retorna información pública del tutor: nombre, foto, modalidades, materias.

## Tipos

Interfaces y enums principales (distribuidos en archivos de tipos de la feature):

- `Modality = 'PRES' | 'VIRT'`: modalidad. Un slot puede ofrecer una o ambas, así que en `Slot`/`RawSlot` la modalidad es un arreglo (`Modality[]`): `['PRES']`, `['VIRT']` o `['PRES','VIRT']`.
- `DayOfWeek = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO'`.
- `RawSlot`: slot tal como viene del backend (su `modality` llega como arreglo).
- `TutorAvailabilityResponse`: respuesta con slots agrupados por día.
- `Slot`: estructura procesada y normalizada para la UI (`modality: Modality[]`, normalizada con `toModalityList`).
- `TutorInfo`: información pública del tutor.
- `GetAvailabilityQueryDto`, `ManageSlotDto`: DTOs para queries y mutaciones.

## Utilidades

### [utils/dateUtils.ts](../utils/dateUtils.ts)

- `getWeekRangeFromOffset(offset)`
  - Calcula el rango de fechas de lunes a sábado dado un offset de semanas.
  - Usado en calendarios semanales.

### [utils/calendarUtils.ts](../utils/calendarUtils.ts)

- Utilidades para posicionamiento visual de slots, cálculo de duraciones, y manipulación de horarios.

### [utils/calendarConstants.ts](../utils/calendarConstants.ts)

- Constantes visuales del calendario: horas de inicio, altura por hora, colores por día, etc.

## Store global

Consume [src/store/availabilityStore.ts](../../../store/availabilityStore.ts):

- `profile: TutorProfile`: perfil del tutor.
- `availability: TutorAvailabilityPublic`: disponibilidad pública.
- Métricas del dashboard: `weeklyHoursUsed`, `weeklyHoursLimit`, `weeklyHoursRemaining`, `totalStudentsReached`, `weeklySessionsCount`.

## Flujos de usuario

### Estudiante buscando tutores

1. El estudiante entra a `/search`.
2. `search` llama a `getAllTutors()` y `getTutorProfile()`.
3. Al seleccionar un tutor, `availability` provee los slots para mostrar detalles.

### Estudiante agendando sesión

1. Desde `/search` el estudiante hace clic en "Agendar".
2. Navega a `/sessions` con `subjectId`.
3. `StudentSchedule` carga slots mediante `getTutorSlotsDetailedSSR()`.
4. El estudiante selecciona un slot y continúa en `SchedulingWizard`.

### Dashboard de tutor

1. El dashboard de tutor muestra métricas obtenidas vía `availabilityStore`.
2. `getTutorWorkload()` y `getMyAvailability()` alimentan la barra de horas disponibles (`TutorAvailabilityBar`).

## Relación con otras features

- **search**: consume `availability` para mostrar tutores con slots y detalles de disponibilidad.
- **sessions**: `StudentSchedule` depende directamente de `getTutorSlotsDetailedSSR()`.
- **dashboards**: usa métricas de `availabilityStore` y servicios de workload.
- **tutorAvailability**: escribe la disponibilidad que `availability` lee. Son dos caras de la misma moneda: lectura vs. escritura.
- **profileSettings**: el límite de horas semanales se configura en `profileSettings` pero afecta los datos que `availability` lee.

## Páginas Astro que la utilizan

- [src/pages/availability/](../../../pages/availability/): páginas de gestión de disponibilidad del tutor (visualización y edición).
- [src/pages/sessions/index.astro](../../../pages/sessions/index.astro): carga disponibilidad para agendar.
- [src/pages/search/index.astro](../../../pages/search/index.astro): muestra tutores y sus slots.
- [src/pages/dashboard.astro](../../../pages/dashboard.astro): dashboard con métricas de disponibilidad.

## Notas técnicas

- La feature usa una combinación de SSR (para carga inicial de slots) y cliente (para mutaciones y filtros).
- Los slots se agrupan por día de semana para facilitar la renderización de calendarios verticales.
- `getTutorSlotsDetailedSSR` es clave para reducir el número de requests en el flujo de agendamiento.
