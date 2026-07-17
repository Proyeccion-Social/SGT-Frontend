# Under Construction

## Propósito y objetivo

La feature `underConstruction` provee una pantalla placeholder para funcionalidades que aún no han sido implementadas. Su objetivo es:

- Mostrar una página amigable cuando el usuario navega a una ruta en desarrollo.
- Mantener la navegación y el branding consistentes.
- Evitar errores 404 en rutas planificadas pero no terminadas.

## Problema que resuelve

Durante el desarrollo iterativo, algunas páginas están planificadas pero no listas. En lugar de dejar un error o una página vacía, `underConstruction` muestra un mensaje claro de "en construcción".

## Componentes principales

- [components/](../components/): contiene assets y componentes visuales de la página de construcción (ilustraciones, animaciones, etc.).

## Assets

- [assets/](../assets/): imágenes e ilustraciones usadas en la pantalla.
- [styles/](../styles/): estilos específicos de la página.

## Flujos de usuario

1. Usuario navega a una ruta no implementada.
2. Se renderiza `UnderConstructionLayout` o `UnderConstruction.astro`.
3. Se muestra mensaje e ilustración indicando que la funcionalidad está en construcción.
4. Usuario puede volver al dashboard o a la página anterior.

## Relación con otras features

- No tiene dependencias de negocio.
- Es transversal a cualquier feature cuya página aún no esté lista.

## Páginas Astro que la utilizan

- [src/pages/under-construction.astro](../../../pages/under-construction.astro): página de en construcción.
- [src/layouts/UnderConstruction.astro](../../../layouts/UnderConstruction.astro): layout para páginas en construcción.

## Notas técnicas

- Útil para desplegar funcionalidades por etapas sin romper la navegación.
- Generalmente es una página estática con mínima lógica.
