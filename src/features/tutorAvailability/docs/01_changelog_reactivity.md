# Historial de Cambios: Reactividad y UX en Tutor Availability

Este documento resume los cambios realizados en esta sesión para hacer que el calendario de disponibilidad del tutor sea interactivo y mejorar la consistencia UX entre calendario, barra lateral y diálogos.

## 1. Problema Inicial
El componente original `Calendar.astro` dependía estrictamente de **Server-Side Rendering (SSR)**. Esto significaba que los slots de disponibilidad se renderizaban una sola vez en el servidor cuando se mandaba la página al navegador.
- **Falta de reactividad:** Cuando un tutor arrastraba el cursor sobre la cuadrícula para crear una nueva franja horaria, era imposible reflejar visualmente ese nuevo bloque en el DOM sin realizar un _reload_ completo en el navegador.
- **Inconsistencia de estado:** Bloques creados, editados o eliminados no reaccionaban ante el evento global `refresh-slots`, dejando a los usuarios viendo información obsoleta hasta recargar manualmente.

## 2. Primera Iteración: JavaScript Nativo en Astro
Inicialmente, se intentó conservar el archivo `.astro` e inyectarle toda la interactividad usando Vanilla JavaScript (dentro de una etiqueta `<script>`).
- **El Cambio:** Se programó toda la manipulación del DOM manualmente (`document.createElement`, `appendChild`, etc.) para dibujar y destruir franjas.
- **El Bloqueo:** La lógica del servidor (ubicada en `calendarUtils.ts`, concretamente los agrupadores `getSlotsByDay` y formateadores de tiempo) no puede importarse nativamente en el `<script>` de lado-cliente proporcionado por el compilador de Astro sin maniobras complejas. Esto nos obligó a **duplicar una cantidad excesiva de código** dentro de `Calendar.astro`.
- **Conclusión de la Iteración:** Aunque la solución funcionaba y permitía interactuar con el calendario, se generó una deuda técnica inmensa y un script gigante que costaría mucho mantener.

## 3. Solución Final: Migración Total a React (`TutorCalendarGrid.tsx`)
Para resolver la duplicación de lógica y el manejo manual del DOM, se reescribió ese fragmento de interfaz como un componente de React.

### Beneficios y justificación técnica:
- **Consumo directo de Utilidades:** Al estar construyendo un componente `.tsx` de React puro renderizado on-cliente (`client:only="react"`), pudimos importar funciones robustas ya testeadas de `calendarUtils.ts` de forma transparente. El código redundante se esfumó.
- **State Management reactivo:** Implementamos `useState` para gestionar el arreglo de disponibilidades (`slots`) y el overlay que pinta un fantasma al arrastrar el mouse (`dragState`). React detecta por sí solo los cambios de estado tras el fetch API y repinta la interfaz instántaneamente.
- **Modularidad:** Limpiamos ineficiencias extrayendo los estilos CSS a su propio módulo aislado (`TutorCalendarGrid.module.css`).
- **Acoplamiento de Eventos Globales:** Se acopló el mecanismo de refrescamiento configurando un `useEffect` capaz de escuchar la baliza `window.dispatchEvent(new CustomEvent('refresh-slots'))`.

## 4. Limpieza Visual y Correcciones Críticas de UI

- **Coherencia de Contexto Tutor:** 
  Anteriormente, cada cuardrícula dibujaba insignias (`badges`) etiquetando tramos de tiempo como "Disponible" (incluso con iconos de check). Se removió dicho adorno ya que durante el Setup (la acción del tutor seleccionando bajo qué rangos trabajará) no aporta valor distinguir si está disponible o reservado, simplemente se reemplazó imprimiendo el _rango de hora limpio_ (Ej. `10:00 → 11:00`). Textos largos como "minutos" se destilaron a "mins".

- **La Guerra del Scroll vs Borde Redondeado:** 
  - El diseño general dictaba que el contenedor superior del calendario incluyera bordes curvos (`border-radius: 16px`). El scrollbar nativo del SO se renderizaba de forma rectangular superponiéndose torpemente al borde curvado inferior derecho.
  - **La solución:** Implementar la técnica de segregación de *Contenedor Externo* (Clip) y *Contenedor Interno* (Scroll). Asignamos al `div` exterior la regla `overflow: hidden` junto con el radio del borde para que fungiera como máscara, mientras que delegamos el `overflow-y: auto`, y su deslizador morado y transparente custom (`::-webkit-scrollbar`) al `div` interior. Adicionalmente, retiramos las aparatosas flechas default con un contundente selector de botones.

- **Corrección Key React Tracker:** 
  Generaba alertas por colisiones. El array reactivo mapeaba los componentes iterando la propiedad malgastada `slot.groupedIds?.join(',')` la cual para franjas unitarias regresaba strings vacíos idénticos tipo `,,` destruyendo las virtudes del reconciliador React.
  **La solución:** Concatenamos propiedades incuestionables para formular IDs irrepetibles a nivel bucle: ``key={`${dayKey}-${slot.startTime}-${index}`}``.

## 5. Cambios adicionales de la sesión (API/UX)

Además de la reactividad del calendario, durante esta sesión se ajustaron contratos de payload con backend, validaciones y coordinación entre overlays:

- **Contratos PATCH/DELETE de slots:** al editar/eliminar una franja se envía un body mínimo `{ dayOfWeek, startTime, endTime, modality }` para evitar `400 Bad Request` por campos UI extra.
- **Eliminación sin confirmación:** se removió el `confirm(...)` previo al delete desde el diálogo de edición.
- **Validación de “Guardar disponibilidad”:** antes de abrir el diálogo de límite semanal se exige al menos 1 hora total de franjas (toast con `sileo`).
- **Ocultar calendario antes de límites semanales:** al abrir `HoursConfigDialog` se emite `close-tutor-calendar-dialog` para evitar superposición de overlays.
- **Fix de clics en `HoursConfigDialog`:** se restauran `pointer-events` globales al abrir el modal para que input y botón sean interactivos por mouse.
- **Coordinación Drawer (Vaul) + `<dialog>`:** se incorporaron eventos `space-info-dialog-open` / `space-info-dialog-close` y una guarda para que el click afuera cierre el Drawer, pero no lo cierre si el diálogo de detalle está abierto.
- **Fix de interacción (mouse bloqueado):** al abrir `SpaceInfoDialog` desde una tarjeta del sidebar (`HoursCard`), primero se cierra el sidebar (evento `close-availability-sidebar`) y luego se abre el diálogo (evento `open-space-info-dialog` en el siguiente tick). Esto evita el caso donde Vaul deja la página sin clicks (TAB funciona pero mouse no).
- **Manejo de backend sin slots:** `getMyAvailability()` y el sidebar toleran respuestas `404/204` y normalizan `groupedByDay` a `{}`.

## 6. Automatización de Onboarding (Post-Perfil)

Se implementó un flujo obligatorio para que los tutores configuren su disponibilidad inmediatamente después de completar su perfil:

- **Trigger Automático:** El componente `VaulDrawer` (perfil) emite `open-initial-config-dialog` al finalizar con éxito.
- **Contenedor Global:** Se creó `TutorAvailabilityOverlay.astro` para albergar todos los diálogos de disponibilidad, inyectándolo en `DashboardLayout.astro`.
- **Flujo No-Saltable:** Se bloqueó la tecla `Escape` y eventos de `cancel` en `InitialConfigDialog` y `HoursConfigDialog` para forzar al usuario a seguir el proceso de configuración hasta el final.
- **Consistencia de Pointer-Events:** Se aseguró que al abrir los modales de configuración se desbloqueen los `pointer-events` del `body` para permitir la interacción.
- **Feedback de Usuario (Sileo):** Se integraron alertas de `sileo` en todos los puntos de interacción para mejorar la comunicación:
    - `HoursConfigDialog`: Alertas de éxito y error al guardar el límite semanal.
    - `SpaceInfoDialog`: Alertas al guardar cambios o eliminar franjas.
    - `TutorCalendarGrid`: Alerta de éxito concisa ("Franja creada") al arrastrar.
    - `AvailabilitySideBar`: Alerta de éxito al validar la disponibilidad antes de pasar al límite de horas.
    - `tutorCalendar`: Alertas de proceso, éxito y error al eliminar franjas.
- **Corrección de Visibilidad (Top Layer):** Se añadió un retraso de 400ms al transicionar entre el sidebar y el diálogo de límites para permitir que el toast de éxito sea visible antes de ser cubierto por el modal en la "Top Layer".
- **Nueva Lógica de Negocio (Límites):** En `HoursConfigDialog`, se implementó un tope de **8 horas semanales**. Si el tutor crea menos de 8 horas en franjas, su límite es el total creado; si crea más, el límite máximo permitido se bloquea en 8.
