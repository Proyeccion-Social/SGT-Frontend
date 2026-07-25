# ADR: Transformaciones de Cloudinary en runtime (frontend)

## Contexto

Las fotos de tutores se almacenan en Cloudinary y el backend devuelve la URL base sin transformaciones. Servir el original en listados (varios MB) degrada el LCP y el peso de red (issue #242).

## Opciones consideradas

1. **Eager transformations al subir** (backend) — óptimo para assets fijos de alto tráfico; no cubre tamaños distintos por vista sin generar N variantes.
2. **Transformaciones en runtime en el frontend** — un helper arma `f_auto,q_auto,w_,h_,c_fill,g_face,dpr_auto` según el contexto de UI.
3. **Proxy/CDN propio** — fuera de alcance; cambia infraestructura.

## Decisión

Opción **2**: helper `src/lib/cloudinary.ts` + componente `CloudinaryImage` (React) y uso del helper en scripts de search.

- La URL en DB no se modifica.
- Presets por contexto: `avatarSm` … `avatarXl`, `list`, `profile`, `cover`.
- Fallback: `/default-avatar.svg` si no hay URL o falla la carga (`onError`).
- `loading="lazy"` por defecto fuera del viewport inicial; `width`/`height` explícitos para CLS.

## Consecuencias

- Cualquier `<img>` con foto de Cloudinary debe pasar por `cloudinaryImage()` / `CloudinaryImage`.
- Si se añaden banners u otros assets pesados, reutilizar el helper (y valorar eager en backend solo si el tráfico lo justifica).
