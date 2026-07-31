# Driver Tutorial

## Propósito y objetivo

La feature `driverTutorial` implementa el **tour de onboarding** de la aplicación: un recorrido guiado, paso a paso, que se muestra la primera vez que un usuario completa su perfil. Está construida sobre la librería [`driver.js`](https://driverjs.com/) y se adapta al rol del usuario (estudiante o tutor) y a la ruta actual. Su objetivo es:

- Presentar la plataforma a usuarios nuevos sin necesidad de un manual externo.
- Resaltar los elementos interactivos críticos de cada pantalla (calendario, filtros, botón de horarios, accesos a historial, etc.).
- Garantizar que los pasos críticos del flujo (agendar, gestionar disponibilidad, buscar tutorías) se ejecuten al menos una vez con asistencia visual.

## Problema que resuelve

Sin un tour, los usuarios nuevos deben descubrir por sí solos dónde están las funcionalidades principales, lo que genera fricción y abandono temprano, especialmente en móvil. `driverTutorial` resuelve esto anclando tooltips a selectores HTML específicos y avanzando el recorrido según el rol y la pantalla visitada.

Centraliza tres problemas recurrentes:

1. **Reuso de la configuración del tour** (botones, offset, scroll suave, interacción activa) en una sola fábrica (`createTour`).
2. **Mapeo automático de selectores desktop → mobile** para que el mismo tour funcione en ambos viewports sin duplicar steps.
3. **Persistencia de progreso** entre páginas vía `tutorialState` (key `atlas:tutorial:state` en `localStorage`), de modo que un tour puede terminar navegando a otra ruta y continuar desde allí.

## Componentes principales

- [TutorialInitializer.tsx](../TutorialInitializer.tsx): componente React "invisible" montado globalmente en `DashboardLayout.astro`. Detecta el rol del usuario, consulta el estado vía `tutorialState` y la ruta actual, y reanuda el tour correspondiente **solo si tiene estado `ACTIVE`**. Escucha el evento `tutorial:start` (disparado por el drawer al completar perfil) como único entry point para iniciar el primer tour.
- [tutorialState.js](../tutorialState.js): única fuente de verdad del estado de los tours en `localStorage`. API: `getState`, `setState`, `getTourStatus`, `startTour`, `setTourStep`, `discardAllTours`, `completeTour`, `getResumeStep`. Opera en memoria si `localStorage` no está disponible y tolera JSON corrupto.
- [createTour.js](../createTour.js): fábrica que crea una instancia de `driver()` con la configuración común (`allowClose: false`, `overlayClickAction: 'none'`, mapeo mobile, botón "Saltar tutorial"). Exporta además `isMobileViewport()` y `getInteractiveElement(selector)`.
- [styles/dashStyles.css](../styles/dashStyles.css): estilos del popover, overlay, botón de skip y variantes de posición (`corner-popover`, `bottom-popover`, `celebration-popover`, `welcome-popover`, `final-popover`). Define el comportamiento responsive en breakpoints `≤ 768px` (tablet) y `≤ 480px` (móvil).

### Tours

- [tutorials/Student/dashboardTutorial.js](../tutorials/Student/dashboardTutorial.js): tour inicial del dashboard del estudiante.
- [tutorials/Tutor/dashboardTutorial.js](../tutorials/Tutor/dashboardTutorial.js): tour inicial del dashboard del tutor.
- [tutorials/Tutor/disponibilidadTutorial.js](../tutorials/Tutor/disponibilidadTutorial.js): tour de la pantalla de gestión de disponibilidad del tutor (`/availability/tutor/slots`).
- [tutorials/Student/agendamientoTutorial.js](../tutorials/Student/agendamientoTutorial.js): tour del calendario de agendamiento (`/sessions`). Al finalizar, redirige a `/search`.
- [tutorials/Student/searchTutorial.js](../tutorials/Student/searchTutorial.js): tour del buscador de tutores (`/search`).
- [tutorials/finalTutorial.js](../tutorials/finalTutorial.js): tour final común a ambos roles, renderizado en `/dashboard`. Cierra con una animación de celebración y marca el tour como `completed` automáticamente.

Cada tour declara al inicio del archivo sus constantes `TOUR_ID` y `TOUR_VERSION` y engancha los hooks `onNextClick`, `onPrevClick` y `onDestroyStarted` a `tutorialState` para persistir el paso actual.

## Estado y persistencia

La feature no consume endpoints propios. Su único almacén es el navegador, a través del módulo [`tutorialState.js`](../tutorialState.js):

- Key: `atlas:tutorial:state`
- Valor: JSON con el siguiente esquema:

```json
{
  "version": 1,
  "userRole": "STUDENT",
  "tours": {
    "<tourId>": {
      "version": "1.0.0",
      "status": "active | discarded | completed",
      "currentStep": 2,
      "totalSteps": 6,
      "updatedAt": 1721750000000
    }
  }
}
```

### Reglas de estado

- **`startTour()`** no reactiva un tour que ya fue `discarded` o `completed` (devuelve `false`).
- **`discardAllTours()`** marca todos los tours como `discarded` de golpe (botón "Saltar tutorial").
- **`maybeStartTour()`** (en `TutorialInitializer`) solo inicia un tour si ya existe con estado `ACTIVE`. Si no hay estado en localStorage (dispositivo nuevo), no inicia nada.
- El **único entry point** para iniciar el flujo de tours es el evento `tutorial:start`, disparado por el drawer (estudiante) o el `HoursConfigDialog` (tutor) al completar el perfil.

## Utilidades

### `MOBILE_MAPPING` (createTour.js)

Mapa centralizado de selectores de escritorio a sus equivalentes en móvil:

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

### Variantes de popover (dashStyles.css)

- `.corner-popover` — anclado a la esquina inferior derecha en desktop, sobre el dock en mobile.
- `.bottom-popover` — fijo al fondo en mobile, por encima del dock.
- `.celebration-popover` — centrado, sin bordes, para la animación final.
- `.welcome-popover` — popover de bienvenida centrado.
- `.final-popover` — popover grande centrado para el cierre del tutorial.
- `.atlas-skip-tutorial` — botón flotante "Saltar tutorial" en la parte superior central.

## Flujos de usuario

### Primer inicio (después de completar perfil)

1. Usuario completa su perfil en el drawer (estudiante) o en `HoursConfigDialog` (tutor).
2. Se dispara el evento `tutorial:start`.
3. `TutorialInitializer` escucha el evento, verifica que el tour de dashboard no esté `discarded`/`completed`, e inicia `startDashboardStudentTutorial()` o `startDashboardTutorTutorial()`.
4. El tour del dashboard avanza por los pasos y al final navega a la siguiente sección (agendamiento/disponibilidad), llamando a `startTour()` del siguiente tour antes de redirigir.

### Navegación entre tours

Cuando un tour termina y redirige a otra página, deja el siguiente tour con estado `ACTIVE` en localStorage. Al cargar la nueva página, `TutorialInitializer` detecta el estado `ACTIVE` vía `maybeStartTour()` y lo reanuda.

### Saltar tutorial

El usuario puede hacer click en "Saltar tutorial" (botón flotante superior central) en cualquier momento. Esto:

1. Llama a `discardAllTours()` que marca los 6 tours como `DISCARDED`.
2. Destruye el tour actual.
3. Ningún tour se volverá a mostrar en ninguna página de ese dispositivo.

### Reanudación tras recarga (F5)

Si el usuario recarga la página mientras está en un paso intermedio:

1. `TutorialInitializer` consulta `getTourStatus(tourId)` y ve `ACTIVE`.
2. `startXxxTutorial()` llama a `getResumeStep(TOUR_ID, TOUR_VERSION)` que devuelve el paso guardado.
3. El tour arranca con `tour.drive(resumeFrom)` y muestra el popover en ese paso.

### Dispositivo nuevo

Sin estado en localStorage, `maybeStartTour()` no inicia nada. El tutorial solo se muestra si el usuario vuelve a completar su perfil (lo cual no pasa si ya lo completó).

## Relación con otras features

- **auth**: el initializer depende de `authStore.user.role` y `requiresProfileCompletion` para decidir cuándo arrancar.
- **dashboards**: el tour se monta sobre `/dashboard` y ancla steps a selectores de `dashboards/components/*`.
- **tutorAvailability**: provee `#calendarTutorTUTORIAL`. El `HoursConfigDialog` dispara `tutorial:start` para tutores.
- **sessions / search**: proveen selectores como `#calendarStudentTUTORIAL`, `#weekfilterStudentTUTORIAL`, `#goSearchStudentTUTORIAL`.
- **general**: `Dock.astro` provee los IDs `*MobileTUTORIAL` que `MOBILE_MAPPING` resuelve.
- **tutorProfile**: el drawer (`VaulDrawer`) dispara `tutorial:start` para estudiantes tras completar perfil.

## Notas técnicas

### `allowClose: false` + botón "Saltar tutorial"

El tutorial bloquea toda interacción fuera del elemento resaltado. No hay X para cerrar ni click-to-dismiss en el overlay. La única forma de salir es:
- Completar el flujo (avanzar todos los pasos).
- Hacer click en "Saltar tutorial" (descarta todos los tours permanentemente).

### `setInterval` para disponibilidad

El tour de disponibilidad del tutor usa `setInterval` que reintenta cada 200 ms hasta encontrar `#calendarTutorTUTORIAL` en el DOM, en vez de un `setTimeout` fijo. El calendario depende de datos async y puede tardar en montarse.

### Mapeo mobile centralizado

`createTour` reescribe los `element` de los steps al construir el tour si está en mobile. Evita duplicar steps y centraliza la regla de cuándo se considera "mobile" (`≤ 768 px`).

### Convención de selectores: terminación `TUTORIAL`

Todos los elementos target del tour deben tener un `id` terminado en `TUTORIAL`. Al añadir un nuevo target, añadir el par mobile en `MOBILE_MAPPING` y el `id` correspondiente en el componente mobile.

## Checklist para añadir un nuevo tour

1. Crear el archivo en `tutorials/<Role>/nombreTutorial.js`.
2. Declarar `TOUR_ID`, `TOUR_VERSION`, `TOTAL_STEPS`, `USER_ROLE`.
3. Usar `startTour()` con check de `canStart` al inicio.
4. Usar `getResumeStep()` y `tour.drive(resumeFrom)`.
5. Enganchar `onNextClick`/`onPrevClick` a `setTourStep()`.
6. Enganchar `onDestroyStarted` a `completeTour()` si es el último paso.
7. Añadir el tour ID a `discardAllTours()` en `tutorialState.js`.
8. Si el tour necesita reanudarse desde `TutorialInitializer`, añadir la entrada en `PATH_TOUR_MAP`.
9. Añadir selectores mobile a `MOBILE_MAPPING` si aplica.
