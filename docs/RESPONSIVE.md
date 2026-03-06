# Guía de responsive – SGT Frontend (Astro)

Esta guía define **reglas, breakpoints y buenas prácticas** para implementar responsive en el proyecto.

---

## 1. Reglas de oro

### 1.1 Viewport y meta
- El layout base ya incluye la meta viewport correcta:  
  `width=device-width, initial-scale=1`  
  No la quites ni la cambies.

### 1.2 Breakpoints únicos
- **Usa siempre los breakpoints del sistema de diseño.** Están en `src/styles/variables.css`:

| Nombre | Variable CSS   | Uso típico                |
|--------|----------------|---------------------------|
| sm     | `--bp-sm`      | 640px – móvil grande      |
| md     | `--bp-md`      | 768px – tablet            |
| lg     | `--bp-lg`      | 1024px – laptop           |
| xl     | `--bp-xl`      | 1280px – desktop          |
| 2xl    | `--bp-2xl`     | 1536px – desktop grande   |

- En **media queries** no se pueden usar variables en todos los navegadores, así que escribe el valor en píxeles pero **síempre el mismo** que la variable:
  - `@media (width <= 640px)`  → equivalente a `--bp-sm`
  - `@media (width <= 768px)`  → equivalente a `--bp-md`
  - etc.

- Para **anchos máximos de contenedores** (no en `@media`), sí usa la variable:  
  `max-width: var(--bp-lg);`

### 1.3 Mobile first (recomendado)
- Escribe primero los estilos para **pantalla pequeña** (móvil).
- Luego amplía con `@media (min-width: ...)` para tablet y desktop.  
  Ejemplo:
  ```css
  .headerText { width: 100%; padding: 0 16px; }
  @media (min-width: 768px) {
    .headerText { width: 90%; max-width: 905px; }
  }
  ```
- Si en algún componente ya tienes “desktop first” (`width <= XXXpx`), está bien; lo importante es **unificar breakpoints** (640, 768, 1024, 1280, 1536) y no inventar valores (ej. 692, 810, 1292).

### 1.4 Evitar anchos fijos en elementos clave
- No uses `width: 905px` o `width: 500px` en contenedores de texto sin un `max-width: 100%` y/o media queries para móvil.
- Preferir:
  - `width: 100%` + `max-width: 905px`
  - O media queries que en móvil pongan `width: 100%` o `width: min(100%, 905px)`.

### 1.5 Unidades
- **Espaciado y tamaños de layout:** `px` o variables del design system (`--scale-*`, `--spacing-*`).
- **Tipografía:** puedes usar `rem` para escalar con el usuario (opcional); si usas `px`, en móvil reduce un poco el tamaño (ej. `--fontsize-heading-h1` en desktop, algo menor en `@media (width <= 768px)`).
- **Contenedores:** `%`, `vw`, o `min(100%, XXpx)` para no salirse del viewport.

### 1.6 Touch y legibilidad
- En móvil, botones y enlaces mínimos ~44x44px para área táctil.
- Texto con `line-height` y contraste suficientes; evita fuentes muy pequeñas en móvil.

---

## 2. Cómo aplicar en componentes Astro

### 2.1 Estilos en el mismo `.astro`
- En el bloque `<style>` del componente:
  - Usa los breakpoints anteriores (640, 768, 1024, 1280, 1536).
  - Ejemplo:
  ```css
  .navBar { width: 100%; max-width: 660px; }
  @media (width <= 768px) {
    .navBar { width: 90%; }
  }
  @media (width <= 640px) {
    .navLinks { font-size: 14px; }
  }
  ```

### 2.2 Variables de variables.css
- Si en el layout principal se importa `global.css` (que ya importa `variables.css`), tienes disponibles `--bp-*`, `--spacing-*`, `--fontsize-*`, etc.
- Úsalas para mantener consistencia (por ejemplo `padding: var(--spacing-md)` en lugar de valores sueltos).

### 2.3 Imágenes y medios
- En `global.css` ya hay `img, picture, video, canvas, svg { max-width: 100%; }`.  
  No quites eso; evita imágenes que se salgan del contenedor en móvil.
- Para fondos: `background-size: cover` y `background-position: center` (como en `.principalPage`) están bien; en móvil revisa que no se pierda lo importante.

---

## 3. Checklist por pantalla/componente

Para cada vista o componente:

- [ ] **Móvil (~320–640px):** sin scroll horizontal, textos legibles, botones táctiles.
- [ ] **Tablet (640–1024px):** layout que se adapte (columnas que colapsan, espaciados coherentes).
- [ ] **Desktop (1024px+):** uso de `max-width` en contenedores si el diseño es “caja centrada”.
- [ ] **Breakpoints:** solo 640, 768, 1024, 1280, 1536 (o alineados con `--bp-*`).
- [ ] **Sin anchos fijos** que rompan en móvil (sustituir por `max-width` + `width: 100%` donde corresponda).

---

## 4. Orden sugerido de trabajo

1. **Layout y viewport:** ya corregido en `Layout.astro`.
2. **Variables y breakpoints:** ya definidos en `variables.css`; usar esos valores en todo el proyecto.
3. **Landing:**  
   PrincipalContent → Header → Nav → Cards → InteractComponent → Community → Footer.  
   En cada uno: revisar anchos fijos, añadir/ajustar media queries con los breakpoints estándar y mejorar móvil/tablet.
4. **Auth (login/registro/dialogs):** revisar que los diálogos y formularios no se salgan en móvil (`max-width: 100vw`, padding, márgenes).
5. **Pruebas:** probar en DevTools con resoluciones típicas (375, 414, 768, 1024, 1280) y en dispositivo real si es posible.

---

## 5. Resumen rápido

- **Un solo conjunto de breakpoints:** 640, 768, 1024, 1280, 1536 (variables `--bp-sm` … `--bp-2xl`).
- **Mobile first** cuando puedas; si no, **desktop first** con los mismos números.
- **Sin anchos fijos** que ignoren el viewport; usar `max-width` y `width: 100%`.
- **Viewport** con `initial-scale=1` y **imágenes** con `max-width: 100%`.
- Revisar **touch**, **legibilidad** y **scroll horizontal** en móvil.

Con esto tienes una base clara para implementar y revisar el responsive en todo el frontend de Astro.
