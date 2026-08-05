# Tutor Availability

## Propósito y objetivo

La feature `tutorAvailability` permite a los tutores gestionar su disponibilidad semanal de forma visual e interactiva. Su objetivo es:

- Crear, actualizar y eliminar franjas horarias (slots) en un calendario drag-and-drop.
- Gestionar slots por rangos de fechas.
- Establecer el límite de horas semanales.
- Proveer retroalimentación visual de horas usadas vs. límite.

Es la contraparte de escritura de la feature `availability`, que se enfoca en lectura.

## Problema que resuelve

Un tutor necesita:

1. Definir en qué momentos está disponible.
2. Indicar si cada franja es presencial, virtual o ambas.
3. Replicar disponibilidad en rangos de fechas.
4. Controlar su carga semanal.

`tutorAvailability` resuelve esto con una interfaz de calendario intuitiva.

## Componentes principales

- [components/TutorCalendarGrid.tsx](../components/TutorCalendarGrid.tsx): calendario visual drag-and-drop para crear/editar slots.
- [components/AvailabilitySideBar.tsx](../components/AvailabilitySideBar.tsx): sidebar con opciones de gestión y leyenda.
- [components/HelpSideBar.tsx](../components/HelpSideBar.tsx): sidebar con ayuda y tutorial.
- [components/HoursCard.tsx](../components/HoursCard.tsx): tarjeta con horas usadas, límite y restantes.

## Servicios y APIs

### [services/getMyAvailability.ts](../services/getMyAvailability.ts)

- `getMyAvailability(token)` → `GET /availability/tutors/me`
  - Obtiene los slots del tutor agrupados por día.

### [services/postSlotsByRange.ts](../services/postSlotsByRange.ts)

- `postSlotsByRange(data, token)` → `POST /availability/tutor/slots/range`
  - Crea slots en un rango de fechas.

### [services/patchSlotsByRange.ts](../services/patchSlotsByRange.ts)

- `patchSlotsByRange(data, token)` → `PATCH /availability/tutor/slots/range`
  - Actualiza slots en un rango.

### [services/deleteSlotsByRange.ts](../services/deleteSlotsByRange.ts)

- `deleteSlotsByRange(data, token)` → `DELETE /availability/tutor/slots/range`
  - Elimina slots en un rango.

### [services/patchMyLimits.ts](../services/patchMyLimits.ts)

- `patchMyLimits(hours: number, token)` → `PATCH /availability/tutors/me/limits`
  - Establece el límite de horas semanales.

## Utilidades

### [utils/calendarUtils.ts](../utils/calendarUtils.ts)

**Tipos de modalidad:**
- `ModalityValue`: unión de valores válidos (`'PRES' | 'VIRT'`).
- `Modality`: tipo amplio que acepta `ModalityValue[]`, string legacy o `null` — para retrocompatibilidad con datos del backend que puedan llegar como string.

**Helpers de modalidad:**
- `normalizeModality(modality)`: convierte cualquier formato de modalidad (`string`, `"BOTH"`, `null`, array) a `ModalityValue[]`. Usado en todos los componentes para comparar y renderizar.
- `isSameModality(a, b)`: compara dos valores de modalidad por contenido (no por referencia), soportando arrays. Usado en `getSlotsByDay` para decidir si fusionar bloques contiguos.

**Funciones de calendario:**
- `getWeekDates(base)`: calcula fechas de lunes a sábado a partir de una fecha base.
- `isSlotInPast(slot, weekDates)`: determina si un slot ya pasó.
- `timeToMinutes(time)`: convierte `"HH:mm"` a minutos.
- `formatDuration(startTime, endTime)`: formatea duración (ej. "1 hora 30 mins").
- `getSlotStyle(slot)`: genera estilos CSS para posicionar un slot en el calendario.
- `getSlotsByDay(slots, dayKey)`: filtra y fusiona slots contiguos del mismo día y misma modalidad. Usa `isSameModality()` para comparar arrays correctamente.
- `getSlotsByDayStudent(slots, dayKey)`: variante para la vista del estudiante.

### [utils/calendarConstants.ts](../utils/calendarConstants.ts)

- `HOUR_START`: hora inicial del calendario.
- `HOUR_HEIGHT`: altura en píxeles de una hora.
- `DAYS`: días de la semana.
- `DAY_COLORS`: colores por día.
- `HOURS_ARRAY`: array de horas para la cuadrícula.

## Flujos de usuario

### Crear slot

1. Tutor navega a `/availability`.
2. `TutorCalendarGrid` carga slots actuales.
3. Tutor hace clic y arrastra en una franja horaria.
4. Se abre popover para definir hora inicio/fin y modalidad.
5. `postSlotsByRange()` crea el slot.
6. El slot aparece visualmente en el calendario.

### Editar/eliminar slot

1. Tutor hace clic en un slot existente.
2. Se abre popover con opciones de editar o eliminar.
3. Editar → `patchSlotsByRange()`.
4. Eliminar → `deleteSlotsByRange()`.

### Establecer límite de horas

1. En `AvailabilitySideBar` o `HoursCard`, el tutor ajusta el límite semanal.
2. `patchMyLimits()` actualiza el backend.
3. `HoursCard` refleja horas usadas vs. límite.

## Relación con otras features

- **availability**: escribe la disponibilidad que `availability` lee. Juntas forman el flujo completo de disponibilidad.
- **sessions**: los slots creados aquí son los que los estudiantes ven en `StudentSchedule`.
- **search**: los tutores con slots aparecen en resultados de búsqueda.
- **dashboards**: el dashboard de tutor muestra resumen de horas y acceso a gestión de disponibilidad.
- **profileSettings**: el límite de horas también se puede configurar desde `profileSettings`, pero `tutorAvailability` es el lugar principal.

## Páginas Astro que la utilizan

- [src/pages/availability/](../../../pages/availability/): páginas de gestión de disponibilidad del tutor.

## Notas técnicas

- El calendario es un componente React complejo con cálculos de posicionamiento basados en minutos.
- Las operaciones por rango permiten replicar disponibilidad semanal en múltiples semanas de una sola vez.
- Los slots en el pasado están deshabilitados visualmente para evitar ediciones inválidas.

## Responsive (móvil ≤768px)

El overlay de configuración se adapta bajo `--bp-md` (768px):

- **Rejilla (`TutorCalendarGrid`)**: muestra **un solo día** a la vez con un selector horizontal
  arriba (`mobileDaySelector`). Abre en el día de hoy; si la semana mostrada no lo contiene, en el
  primero. Replica el patrón de `features/availability/components/Calendar.astro`.
- **Gesto de crear franja**: se mantiene el arrastre. El manejo migró de eventos de ratón a
  **pointer events**, que cubren ratón, táctil y lápiz; con `mousedown`/`mousemove` el gesto no
  llegaba a dispararse en un dispositivo táctil. `.hourCell` lleva `touch-action: none` para que el
  scroll de la página no se quede con el gesto. Un `pointercancel` descarta el arrastre sin crear
  franja.
- **Contenedores modales** (overlay del calendario, drawer de franjas, diálogos de configuración):
  pasan a **pantalla completa**, sin márgenes ni radio de borde, siguiendo el patrón de
  `DashboardLayout.astro`.
- **`AvailabilitySideBar`**: su shell se migró de utilidades de Tailwind a CSS plano en
  `css/AvailabilitySideBar.module.css`, como exige el estándar de estilos para componentes propios.

> Los tokens `--bp-*` no son evaluables dentro de una `@media`; las media queries usan el valor
> literal con un comentario que referencia el token.
