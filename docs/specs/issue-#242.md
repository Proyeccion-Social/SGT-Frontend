# Rendimiento de las imágenes en Atlas - Revisión de Cloudinary, implementación de transformaciones y lazy loading

## Contexto / Problema
<!-- ¿Qué está mal, o qué falta? Si es un bug, describe el comportamiento actual (idealmente con captura). -->
Actualmente las imágenes servidas desde Cloudinary (por ejemplo, los avatares de tutores) se están consumiendo directamente con la URL original, sin ninguna transformación:

```
https://res.cloudinary.com/dmwpmii4c/image/upload/v1777995563/tutors/e88c1730-b37f-4e95-8554-2858306b55c1/avatar.jpg
```

Esto significa que el navegador descarga el archivo original (potencialmente varios MB, en el formato tal cual fue subido: JPG/PNG sin optimizar), sin importar el tamaño real en el que se muestra en la UI (avatar en lista vs. avatar en perfil). Esto genera tiempos de carga elevados, especialmente notorio en vistas con múltiples avatares simultáneos (ej. listado de tutores).

## Objetivo / Resultado esperado
<!-- Una o dos frases: qué debe pasar cuando esto esté resuelto. -->
Las imágenes de Cloudinary deben servirse optimizadas (formato automático, calidad automática y tamaño ajustado al contexto de uso) y con carga diferida donde aplique, reduciendo significativamente el peso descargado y el tiempo de carga percibido, sin afectar la calidad visual.

## Alcance
**Incluye:**
- Crear un helper reutilizable para construir URLs de Cloudinary con transformaciones (`f_auto`, `q_auto`, `w_`, `h_`, `c_fill`, `g_face` para avatares).
- Aplicar el helper en todos los puntos donde se consumen imágenes de Cloudinary (avatares de tutores en listado y en perfil, y demás imágenes identificadas como pesadas/sin transformar).
- Definir tamaños (`w`/`h`) apropiados según cada contexto de uso (lista, card, perfil, banner, etc.).
- Implementar `loading="lazy"` en imágenes fuera del viewport inicial.
- Definir dimensiones fijas (`width`/`height`) en los `<img>` para evitar layout shift.
- Revisar y documentar el uso actual de Cloudinary (transformaciones al subir, `eager transformations` si aplica para imágenes de alto tráfico como banners).

**No incluye (fuera de alcance):**
- Migración de URLs ya almacenadas en la base de datos (se mantienen como URL base sin transformaciones; la transformación se aplica en runtime).
- Cambios en el flujo de subida de archivos al backend (multer / upload a Cloudinary), salvo que se identifique una limitación bloqueante durante la implementación.
- Cambio de proveedor de CDN/almacenamiento de imágenes.

## Estados a contemplar
- [ ] Hover / Focus
- [ ] Disabled
- [x] Loading
- [x] Error
- [ ] Vacío (Empty State)
- [x] Éxito
- [ ] N/A (justificar por qué)

_Nota: se contempla el estado de "Loading" (placeholder/skeleton mientras la imagen carga, especialmente con lazy loading) y "Error" (imagen rota o URL inválida — mostrar un avatar/imagen por defecto)._

## Criterios de aceptación
<!-- Formato Dado/Cuando/Entonces. Todos deben ser verificables por otra persona sin preguntar. -->
1. Dado un avatar de tutor mostrado en el listado, cuando se inspecciona la URL solicitada en Network, entonces esta debe incluir `f_auto,q_auto` y un `w`/`h` acorde al tamaño real mostrado en esa vista (no la imagen original).
2. Dado un avatar de tutor mostrado en el perfil individual, cuando se inspecciona la URL solicitada, entonces el tamaño (`w`/`h`) debe ser mayor al usado en el listado, reflejando el tamaño real de esa vista.
3. Dado que una imagen está fuera del viewport inicial (por ejemplo, más abajo en un listado largo), cuando la página carga, entonces dicha imagen no debe descargarse hasta que el usuario se aproxime a esa sección (`loading="lazy"`).
4. Dado un `<img>` de avatar, cuando se inspecciona el HTML, entonces debe tener `width` y `height` definidos explícitamente para evitar salto de layout (CLS).
5. Dado que la URL de una imagen no responde o el `src` es inválido, cuando el navegador falla al cargarla, entonces se debe mostrar una imagen/avatar por defecto en su lugar (no un ícono roto).
6. Dado el mismo recurso base almacenado en la DB, cuando se consume desde distintos contextos (lista, perfil), entonces se debe generar la URL con transformaciones en runtime (frontend), sin modificar la URL persistida en base de datos.
7. Dado el listado de tutores con N avatares, cuando se compara el peso total descargado antes y después del cambio, entonces debe existir una reducción medible (documentar el % de reducción en el PR).

## Casos borde a considerar
<!-- Ej: texto muy largo, lista vacía, sin conexión, permisos de rol distinto. -->
- Tutor sin avatar cargado (campo `avatarUrl` nulo o vacío) → debe mostrarse un placeholder/avatar por defecto, sin intentar construir una URL de Cloudinary sobre un valor vacío.
- URL de Cloudinary mal formada o de un recurso eliminado (404 en Cloudinary) → manejar el evento `onError` del `<img>` para caer a un fallback.
- Pantallas de alta densidad (retina) → validar si se necesita `dpr_auto` para mantener nitidez sin sobre-pedir peso en pantallas normales.
- Listados muy largos de tutores (paginación/scroll infinito) → confirmar que el lazy loading realmente evita la descarga masiva simultánea.
- Conexiones lentas / modo offline → validar que el estado de error/loading no deje la UI en un estado ambiguo (spinner infinito).

## Dependencias
<!-- ¿Necesita un endpoint que no existe aún? ¿Depende de otro componente en desarrollo? -->
- N/A (las transformaciones se aplican en runtime sobre URLs ya existentes; no se requiere un endpoint nuevo ni cambios de backend para esta implementación).

## Prioridad / Severidad
- [ ] 🔴 Bloqueante
- [x] 🟠 Fricción
- [ ] 🟡 Mejora / idea

---
# ✅ Definition of Done — Frontend
Una tarea de frontend está **Done** solo si cumple todo lo siguiente:
- [ ] La implementación coincide con el diseño de Figma, verificado visualmente lado a lado (fidelidad), no solo "se ve parecido".
- [ ] Funciona y se ve correctamente en **Desktop y Mobile** (no se aprueba solo con la versión desktop).
- [ ] Todos los estados relevantes del componente están implementados (hover, focus, disabled, loading, error, éxito y vacío), no solo el estado "feliz".
- [ ] Usa los tokens del Design System (colores, tipografía, espaciados); no hay valores hardcodeados ni estilos inline sin justificación.
- [ ] Se verificó que no existía ya un componente o patrón reutilizable antes de crear uno nuevo.
- [ ] Se probó con datos reales de la API (no solo con datos mock), incluyendo al menos un caso borde (lista vacía, texto largo, error de red).
- [ ] Si se descubrió una inconsistencia con lo documentado (por ejemplo, una regla de negocio no reflejada en el diseño), se notificó y se actualizó la fuente correspondiente.
- [ ] Si se tomó una decisión técnica no trivial (patrón de manejo de estado, estrategia de estilos, elección de librería, etc.), quedó registrada como un ADR corto (contexto → opciones consideradas → decisión → por qué) y enlazada directamente desde este issue.
- [ ] El Pull Request fue revisado por una persona distinta a quien implementó, incluyendo la revisión de fidelidad visual.