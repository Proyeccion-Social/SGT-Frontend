# Driver Tutorial

## Propósito y objetivo

La feature `driverTutorial` implementa el **tour de onboarding** de la aplicación: un recorrido guiado, paso a paso, que se muestra la primera vez que un usuario accede a las pantallas clave de la plataforma. Está construida sobre la librería [`driver.js`](https://driverjs.com/) y se adapta al rol del usuario (estudiante o tutor) y a la ruta actual. Su objetivo es:

- Presentar la plataforma a usuarios nuevos sin necesidad de un manual externo.
- Resaltar los elementos interactivos críticos de cada pantalla (calendario, filtros, botón de horarios, accesos a historial, etc.).
- Garantizar que los pasos críticos del flujo (agendar, gestionar disponibilidad, buscar tutorías) se ejecuten al menos una vez con asistencia visual.

## Problema que resuelve

Sin un tour, los usuarios nuevos deben descubrir por sí solos dónde están las funcionalidades principales, lo que genera fricción y abandono temprano, especialmente en móvil. `driverTutorial` resuelve esto anclando tooltips a selectores HTML específicos y avanzando el recorrido según el rol y la pantalla visitada.

Adicionalmente, centraliza tres problemas recurrentes que antes vivía en cada pantalla:

1. **Reuso de la configuración del tour** (botones, offset, scroll suave, interacción activa) en una sola fábrica (`createTour`).
2. **Mapeo automático de selectores desktop → mobile** para que el mismo tour funcione en ambos viewports sin duplicar steps.
3. **Persistencia de progreso** entre páginas vía `localStorage("current-tour")`, de modo que un tour puede terminar navegando a otra ruta y continuar desde allí.

## Componentes principales

- [TutorialInitializer.tsx](../TutorialInitializer.tsx): componente React "invisible" montado globalmente. Detecta el rol del usuario, lee `localStorage("current-tour")` y la ruta actual, y lanza el tour correspondiente. Para el tour de disponibilidad del tutor espera al calendario real con un `setInterval` (ver *Notas técnicas*).
- [createTour.js](../createTour.js): fábrica que crea una instancia de `driver()` con la configuración común (animación, offset, `allowClose`, `showCloseButton`, `disableActiveInteraction: false`, mapeo mobile, etc.) y la mezcla con la config de cada tour. Exporta además `isMobileViewport()` y `getInteractiveElement(selector)`.
- [styles/dashStyles.css](../styles/dashStyles.css): estilos del popover, overlay y variantes de posición (`corner-popover`, `bottom-popover`, `celebration-popover`, `welcome-popover`, `final-popover`). Define el comportamiento responsive en breakpoints `≤ 768px` (tablet) y `≤ 480px` (móvil).
- [gifs/cat-cat-licking.gif](../gifs/cat-cat-licking.gif): recurso visual usado en el paso final de celebración.

### Tours

- [tutorials/Student/dashboardTutorial.js](../tutorials/Student/dashboardTutorial.js): tour inicial del dashboard del estudiante.
- [tutorials/Tutor/dashboardTutorial.js](../tutorials/Tutor/dashboardTutorial.js): tour inicial del dashboard del tutor.
- [tutorials/Tutor/disponibilidadTutorial.js](../tutorials/Tutor/disponibilidadTutorial.js): tour de la pantalla de gestión de disponibilidad del tutor (`/availability/tutor/slots`). Almacena `current-tour = "disponibilidad"` y limpia el estado en `onDestroyStarted`.
- [tutorials/Student/agendamientoTutorial.js](../tutorials/Student/agendamientoTutorial.js): tour del calendario de agendamiento (`/sessions`). Al finalizar, redirige a `/search` y guarda `current-tour = "search"`.
- [tutorials/Student/searchTutorial.js](../tutorials/Student/searchTutorial.js): tour del buscador de tutores (`/search`).
- [tutorials/finalTutorial.js](../tutorials/finalTutorial.js): tour final común a ambos roles, renderizado en `/dashboard` cuando `current-tour === "final"`. Cierra con un GIF de celebración y limpia `current-tour` al destruirse.

## Servicios y APIs

La feature no consume endpoints propios. Su único "almacén" de estado es el navegador:

- `localStorage.getItem("current-tour")` — valores posibles: `"disponibilidad"`, `"agendamiento"`, `"search"`, `"final"`. Indica qué tour está activo.
- `localStorage.setItem("current-tour", <valor>)` — escrito por los tours al alcanzar un step de redirección para continuar el flujo en la siguiente página.
- `localStorage.removeItem("current-tour")` — limpieza al cerrar o terminar un tour.

No hay DTOs propios; el tour no intercambia datos con el backend.

## Tipos

No hay definiciones TypeScript propias. Las firmas relevantes viven en el código como JSDoc implícito:

- `createTour(config: DriverConfig): Driver` — devuelve una instancia de driver.js.
- `getInteractiveElement(selector: string): Element | null` — devuelve el selector mobile si el viewport es ≤ 768 px y existe un mapeo, si no el selector original.
- `startXxxTutorial(): void` — funciones `start*` exportadas por cada tour, sin retorno.

## Utilidades

### [createTour.js](../createTour.js) — `MOBILE_MAPPING`

Mapa centralizado de selectores de escritorio a sus equivalentes en móvil. Usado tanto en `createTour` (al transformar steps) como en `getInteractiveElement` (al resolver selectors en runtime):

| Selector desktop | Selector mobile |
|---|---|
| `#sidebarTUTORIAL` | `#mobile-dock` |
| `#goAgendamientoTUTORIAL` | `#goAgendamientoMobileTUTORIAL` |
| `#goDisponibilidadTutorTUTORIAL` | `#goDisponibilidadTutorMobileTUTORIAL` |
| `#goHistorialStudentTUTORIAL` | `#goHistorialStudentMobileTUTORIAL` |
| `#goHistorialTutorTUTORIAL` | `#goHistorialTutorMobileTUTORIAL` |
| `#goSearchStudentTUTORIAL` | `#goSearchStudentMobileTUTORIAL` |
| `#goNotificationsTUTORIAL` | `#goNotificationsMobileTUTORIAL` |
| `#godashboardTUTORIAL` | `#goDashboardMobileTUTORIAL` |

### `isMobileViewport()`

Devuelve `true` cuando `window.innerWidth <= 768`. Usado para activar el `MOBILE_MAPPING` y como punto único de decisión móvil/escritorio para el tour.

### Variantes de popover (`dashStyles.css`)

- `.corner-popover` — popover anclado a la esquina inferior derecha en desktop, y a la parte inferior (sobre el dock móvil) en pantallas ≤ 768 px. Usado por el step del calendario.
- `.bottom-popover` — popover fijo al fondo de la pantalla en mobile, posicionado por encima del dock para que el botón "Siguiente" del tour no quede tapado. Usado por steps de filtros.
- `.celebration-popover` — popover centrado con el GIF de cierre del tour.
- `.welcome-popover` — popover de bienvenida inicial del tour del dashboard.

## Stores globales

No consume ni actualiza stores de Zustand. La única "memoria" entre páginas es `localStorage("current-tour")`.

## Flujos de usuario

### Arranque del tour desde el dashboard

1. Usuario inicia sesión y entra a `/dashboard` por primera vez.
2. `TutorialInitializer` detecta `role` y, como `current-tour` está vacío (o tiene cualquier valor distinto de `"final"`), llama a `startDashboardStudentTutorial()` o `startDashboardTutorTutorial()` tras 500 ms.
3. El tour recorre los elementos clave del dashboard. Al terminar, queda en estado "listo para continuar".

### Tutor: dashboard → disponibilidad → dashboard final

1. El tour del dashboard del tutor termina y deja `current-tour` listo para avanzar (la lógica específica se gestiona dentro de cada tour; ver `disponibilidadTutorial.js`).
2. El usuario navega a `/availability/tutor/slots`.
3. `TutorialInitializer` ve `current-tour === "disponibilidad"` y arranca `startDisponibilidadTutorTutorial()`.
4. El initializer **espera a `#calendarTutorTUTORIAL`** en el DOM con un `setInterval` (en vez de un `setTimeout` fijo) y solo entonces llama a `tour.drive()`. Esto evita que el tour se quede colgado si el calendario tarda en montar.
5. El tour recorre calendario, navegación semana/mes, historial, notificaciones y termina con un step sobre el botón "Volvamos" (`#godashboardTUTORIAL`), que al hacer click navega a `/dashboard` y guarda `current-tour = "final"`.
6. En `onDestroyStarted`, el tour limpia `current-tour` si todavía valía `"disponibilidad"` (caso de cierre manual).

### Estudiante: sesiones → search → dashboard final

1. Desde el dashboard, el usuario llega a `/sessions`.
2. `current-tour === "agendamiento"` dispara `startAgendamientoStudentTutorial()`.
3. El tour recorre el calendario (`#calendarStudentTUTORIAL`, con `corner-popover`), el filtro semanal (`#weekfilterStudentTUTORIAL`, con `bottom-popover`) y termina con un step sobre `#goSearchStudentTUTORIAL`.
4. Al hacer click, el listener añade manualmente un `addEventListener` que guarda `current-tour = "search"` y redirige a `/search`.
5. `TutorialInitializer` lanza `startSearchStudentTutorial()`. Al terminar, la lógica de cada tour guarda el siguiente `current-tour` o lo limpia.

### Cierre del tour (común)

1. El último step del tour del dashboard muestra el GIF de celebración (`celebration-popover`).
2. Tras 1.6 s, `setTimeout` llama a `tour.destroy()` y elimina `current-tour` de `localStorage`.
3. El overlay desaparece y la pantalla queda en estado funcional sin residuos.

## Relación con otras features

- **auth**: el initializer depende de `authStore.user.role` para decidir qué tour arrancar.
- **dashboards**: el tour inicial se monta sobre `/dashboard` y ancla sus steps a selectores de `dashboards/components/*` (por ejemplo `#dashboardMainTUTORIAL`).
- **tutorAvailability**: provee el selector `#calendarTutorTUTORIAL` que consume el tour de disponibilidad.
- **sessions / search**: proveen los selectores `#calendarStudentTUTORIAL`, `#weekfilterStudentTUTORIAL`, `#goSearchStudentTUTORIAL` que consumen los tours de estudiante.
- **general**: el `Dock.astro` provee los IDs `*MobileTUTORIAL` (ej. `#goAgendamientoMobileTUTORIAL`, `#goSearchStudentMobileTUTORIAL`) que el `MOBILE_MAPPING` resuelve como target móvil de los tours.
- **tutorProfile**: si el usuario entra por primera vez sin perfil de tutor completo, el flujo de onboarding lo lleva por `tutorProfile` antes de llegar a `tutorAvailability`.

## Páginas Astro que la utilizan

- [src/pages/dashboard.astro](../../pages/dashboard.astro): monta `TutorialInitializer` y hospeda los tours de dashboard y el tour final.
- [src/pages/sessions.astro](../../pages/sessions.astro): hospeda el tour de agendamiento del estudiante.
- [src/pages/search.astro](../../pages/search.astro): hospeda el tour de búsqueda del estudiante.
- [src/pages/availability/tutor/slots.astro](../../pages/availability/tutor/slots.astro): hospeda el tour de disponibilidad del tutor.

## Notas técnicas

### Decisión: `disableActiveInteraction: false`

Por defecto driver.js bloquea el click sobre el elemento resaltado para evitar acciones accidentales. Esta feature lo desactiva globalmente (`createTour.js`) y lo reactiva selectivamente (`disableActiveInteraction: true` implícito en la mayoría de steps) **salvo** en los steps de redirección (ej. "Volvamos a la sección principal", "Zona de búsqueda"), donde el click debe propagarse al elemento real para que el listener pueda navegar a la siguiente página. En esos steps se usa `showButtons: []` para ocultar los botones de navegación del tour y dejar solo el click sobre el elemento como vía de avance.

> Si en el futuro se introducen nuevos tours con steps interactivos, mantener esta convención: `disableActiveInteraction: false` solo en steps que **deben disparar una acción real** (navegación, toggle, etc.).

### Decisión: `setInterval` en lugar de `setTimeout` para disponibilidad

`TutorialInitializer` usa `setTimeout(..., 500)` para todos los tours **excepto** el de disponibilidad, donde usa `setInterval` que reintenta cada 200 ms hasta encontrar `#calendarTutorTUTORIAL` en el DOM. Esto se debe a que el calendario del tutor depende de la disponibilidad ya cargada, lo que introduce variabilidad en el tiempo de mount. Un `setTimeout` fijo podía dispararse antes de que el calendario existiera, dejando el tour apuntando a `null` y sin avanzar.

### Decisión: mapeo mobile centralizado en `createTour`

En vez de duplicar cada step con su contraparte mobile, `createTour` reescribe los `element` de los steps al construir el tour si está en mobile. Esto evita drift entre versiones desktop y mobile de un mismo step y centraliza la regla de cuándo se considera "mobile" (`≤ 768 px`).

### Convención de selectores: terminación `TUTORIAL`

Todos los elementos HTML que son target de un step del tour deben tener un `id` terminado en `TUTORIAL` (ej. `#calendarTutorTUTORIAL`, `#goSearchStudentMobileTUTORIAL`). Esta convención:

- Hace que un `grep` rápido encuentre todos los targets de tour.
- Permite a `MOBILE_MAPPING` emparejar pares desktop/mobile de forma sistemática.
- Sirve como señal visual en el código HTML de que ese elemento es parte del flujo de onboarding.

Al añadir un nuevo target, **siempre** añadir el par mobile en `MOBILE_MAPPING` y el `id` correspondiente en el componente mobile (típicamente `Dock.astro` o un `*Header.astro`).

### Persistencia de progreso

El estado del tour vive en `localStorage` con la clave `current-tour`. Valores válidos:

| Valor | Disparado en | Tour que lanza |
|---|---|---|
| `"agendamiento"` | `/sessions` | `startAgendamientoStudentTutorial` |
| `"search"` | `/search` | `startSearchStudentTutorial` |
| `"disponibilidad"` | `/availability/tutor/slots` | `startDisponibilidadTutorTutorial` |
| `"final"` | `/dashboard` | `startFinalTutorial` |

Un tour debe **siempre** limpiar su valor de `current-tour` en `onDestroyStarted` para que el initializer no lo relance por accidente en visitas posteriores.

### Estilos del popover

`dashStyles.css` define `.driver-popover` con `max-width: 350px` en desktop y pasa a `width: auto; left: 16px; right: 16px` en mobile. El offset entre el popover y el elemento se controla con `popoverOffset: 24` (definido en `createTour`). Las variantes `corner-popover` y `bottom-popover` reposicionan el popover en mobile para que el botón "Siguiente" no quede tapado por el dock inferior.
