# Resumen Técnico y Arquitectónico: Feature "Tutor Availability"

Este documento tiene como propósito describir el funcionamiento, flujo y ensamblaje general de alto nivel de la característica de disponibilidad de tutor. Ideal para revisiones futuras o traspaso de desarrollo.

---

## 1. Misión Principal
La característica `tutorAvailability` faculta de manera intuitiva y ágil a un tutor para que establezca, de golpe, todo su horario marco de dedicación semanal de la plataforma. La interacción recae en una **cuadrícula de calendario** de tipo 'drag & drop'.

## 2. Flujo Explicado del Usuario
1. El tutor interactúa con un calendario visual fijo, con un rango que habitualmente ampara desde la mañana temprana `7:00` hasta el anochecer `19:00`, distribuido visualmente desde Lunes a Sábado.
2. Buscando establecer disponibilidad un martes entre las diez y las once de la mañana, posiciona su ratón en el bloque del martes correspondiente a la celda "10:00", arrastra hacia abajo soltando el mouse en "11:00". (*Drag-to-Create*)
3. En milisegundos y en segundo plano, la orden impacta contra la base de datos para forjar esa franja. Automáticamente la nueva franja florece a color a lo largo de su bloque correspondiente. Modalidad por defecto asumida: **Presencial**.
4. Si decide **modificar** o se arrepiente, el tutor simplemente hará *un solo clic superficial* sobre la tarjeta de franja ya coloreada. Se interpondrá en su vista un cuadro de dialogo para alterarlo o eliminar el espacio de tajo. 
5. Al presionar **Guardar disponibilidad**, se abre un diálogo para configurar el **límite de horas semanales**; este paso valida que exista al menos **1 hora total** de franjas creadas.

## 3. Topología de Componentes de Frontend

La base de todo el feature consiste en una mezcolanza de Componentes de Archivo nativos de `Astro` actuando de envolturas o *Wrappers*, y Microcomponentes de `React` sirviendo las entrañas interactivas del feature.

### Hub Principal
- **`tutorCalendar.astro`**: Es el cerebro orquestador a nivel *dialog*. Emcapsula al calendario central, a la barra lateral de edición y a una barra estática de ayuda. Alberga los Event Listeners base de supresiones generalizadas y de su display base (Oculto o Modal visible).

### Elemento Vector : Calendario Interactivo
- **`TutorCalendarGrid.tsx` (React, Client-Side)**:
  - Es el alma mater técnica del módulo. Desenvuelve una tabla CSS interactiva mapeada en días/horas.
  - Al renderizarse lanza la solicitud de ingesta (Fetch GET a `api/tutor-availability/get-my-availability`).
  - Capta los eventos del mouse (Mouse Down / Dragging / Mouse Up) para computar matemáticas visuales determinando cuándo se arrastra y entre qué pixeles se suelta. Desencadenando un HTTP POST a `api/v1/tutor-availability/post-slots-by-range` si se valida la solicitud para depositar de inmediato una o más franjas.
  - Dispone de un `useEffect` permanentemente monitoreando por la señal radial llamada `refresh-slots`.

> Nota: el endpoint usado en runtime por el calendario es `POST /api/tutor-availability/post-slots-by-range` (ruta Astro), que proxy a backend.

### Elementos Tangenciales y Paneles
- **`AvailabilitySideBar.tsx`**: Menú lateral replegable apoyado en `Vaul` (Drawer interactivo). Pinta y recopila exactamente las mismas franjas horarias consolidadas del Calendario presentándolas esta vez como un desglose en forma de Tarjetas estáticas (`HoursCard.tsx`).
- **Modales `SpaceInfoDialog.astro` / `HoursConfigDialog.astro`**: Actúan reaccionando desde la sombra al momento en el que el usuario clickea una tarjeta específica en cualquier rincón del DOM de calendarización, interceptando sus horas y parámetros para efectuar un borrado HTTP DELETE o inyección de estado.

> Nota: en el estado actual del código, los inputs de hora en `SpaceInfoDialog.astro` están marcados como `readonly`.

#### Consideraciones UX (Drawer + dialogs)
- El sidebar (Vaul `Drawer`) fue configurado con `modal={false}` para evitar conflictos de foco/click con los `<dialog>` nativos.
- El sidebar se cierra al hacer click afuera, **excepto** cuando `SpaceInfoDialog` está abierto.
- **Importante (interacción desde lista):** al hacer click en una tarjeta del sidebar (`HoursCard`) para editar una franja, el sidebar se **cierra primero** y luego se abre `SpaceInfoDialog`. Esto evita que Vaul deje el resto de la página sin clicks (caso “TAB funciona pero mouse no”).
- **HoursConfigDialog y foco de interacción:** antes de abrir `HoursConfigDialog`, se oculta el overlay del calendario (`close-tutor-calendar-dialog`) y se restauran `pointer-events` globales para asegurar que el input y el botón sean clickeables.

## 4. Fundamentos Aritméticos e Interpolación (`calendarUtils.ts`)
Con frecuencia para efectos de flexibilidad y almacenamiento óptimo, el Backend despacha franjas atómicas y modulares (P. ej: de 30 en 30 minutos). Pintar cada tarjetita de impacto separada fracturaría brutalmente la visual de horas completas.
- **`getSlotsByDay(slots, dayKey)`**: Es una trituradora y fusionadora visual. Caza bloques atomizados en una columna, indaga comparando cronologías relativas entre la hora `End` de bloque previo VS `Start` del bloque siguiente (*¿Están contiguos?*). Adicional evalúa que ambas posean equidad paramétrica (V. gr. Ambas son 'VIRTUAL', o bien ambas comparten un flag idéntico de reserva). Aquellas que convergen, las amalgama creando visualmente un bloque continuo y sin uniones para ser arrojado gráficamente al usuario, simplificándole la interfaz de forma impecable sin corromper el diseño backend.

## 5. Event Drive Arquitecture
Dada la convivencia de Astro vs React, el feature elude dependencias engorrosas unificando la comunicación mediante mensajería pura del API JavaScript estándar: **`CustomEvents`**.
- El calendario React emite `open-space-info-dialog` dotado con la métrica del slot que el Usuario clickeó. Astro lo captura silente, pinta su modal propio y la fiesta avanza.
- Cuando en cualquier módulo alguien altera una franja a punta de POST, PATCH, o DELETE exitoso; es imperativo hacer explotar globalmente un `window.dispatchEvent(new CustomEvent('refresh-slots'))`. Todo micro-bloque de React subscrito resetea su fetch hacia atrás obteniendo una sinergía pasiva espectacular.

### Eventos relevantes (actual)
- `open-tutor-calendar-dialog` / `close-tutor-calendar-dialog`: muestra/oculta el contenedor principal del calendario (`tutorCalendar.astro`).
- `refresh-slots`: obliga a recargar disponibilidad (calendario + sidebar).
- `open-space-info-dialog`: abre `SpaceInfoDialog` con el slot seleccionado.
- `close-availability-sidebar`: cierra el sidebar (Vaul) antes de abrir `SpaceInfoDialog` desde `HoursCard`.
- `delete-slot`: evento "bus" que `tutorCalendar.astro` captura para ejecutar el DELETE.
- `open-hours-config-dialog`: abre `HoursConfigDialog` pasando el total de horas (number) como `detail`.
- `space-info-dialog-open` / `space-info-dialog-close`: coordinación de estado entre `SpaceInfoDialog` y el sidebar para evitar cierre accidental.

### Incidencias de interacción resueltas (2026-04-15)
- **No clic en input/botón de `HoursConfigDialog`:** resuelto ocultando calendario al abrir el modal de horas y restableciendo `pointer-events`.
- **No interacción con `SpaceInfoDialog`:** resuelto cerrando el sidebar antes de abrir el diálogo y coordinando estado con eventos globales.

## 6. Contratos de payload (slots y límites)

### Slots: contrato mínimo esperado
Para evitar errores `400` por enviar campos UI extra, las operaciones de edición/eliminación envían un body mínimo con 4 campos.

#### PATCH (editar franja)
Endpoint: `PATCH /api/tutor-availability/patch-slots-by-range`

```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "10:00",
  "endTime": "11:00",
  "modality": "PRES"
}
```

#### DELETE (eliminar franja)
Endpoint: `DELETE /api/tutor-availability/delete-slots-by-range`

```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "10:00",
  "endTime": "11:00",
  "modality": "PRES"
}
```

> Nota: en el sidebar, `HoursCard.tsx` despacha este payload limpio por `delete-slot` para que `tutorCalendar.astro` lo reenvíe tal cual.

### Límite semanal: PATCH de límites
Endpoint: `PATCH /api/tutor-availability/patch-tutor-limits`

Body (frontend):
```json
{
  "hours": 10
}
```

El servicio proxy transforma este payload a backend en:
```json
{
  "maxWeeklyHours": 10
}
```

## 7. Tratado Lingüístico
La persistencia Backend demanda llaves de enum anglosajonas puras (`MONDAY`, `WEDNESDAY`). 
Las iteraciones gráficas están forzadas a dialectos latinos visuales, usando llaves en castellano puro (`LUNES`, `MIERCOLES`).
A lo largo del código (React y Helpers) descansan objetos diccionarios (`DAY_TO_ENGLISH` / `DAY_FROM_ENGLISH`) con la labor exclusiva de permutar las cargas útiles y de intercepción.

## 8. Manejo de "sin slots"
En algunos entornos el backend puede responder `404` o `204` cuando el tutor aún no tiene franjas. Para evitar errores de UI:
- `getMyAvailability()` normaliza esa respuesta como `{ groupedByDay: {} }`.
- `AvailabilitySideBar.tsx` tolera el caso vacío y muestra un mensaje (`Ningún slot`).
