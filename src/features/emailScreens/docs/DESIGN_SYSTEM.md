# Sistema de Diseño - emailScreens

La feature utiliza un sistema de diseño estrictamente coherente con el componente **Session Detail View (SDV)** del dashboard principal, pero con prefijos específicos para evitar colisiones.

## 1. Tokens de Diseño (CSS Variables)
Localizados en `EmailScreensShared.css`, definen la paleta de colores y radios:
- `--es-violet`: Color principal para acentos.
- `--es-lime`: Para acciones positivas (Aceptar/Confirmar).
- `--es-coral`: Para acciones negativas o críticas (Rechazar/Cancelar).
- `--es-radius-modal`: 24px para el contenedor principal.

## 2. Componentes de UI Reutilizables

### El Contenedor Base (`.es-card`)
Estructura fija para todos los diálogos:
1. **Overlay (`.es-overlay`)**: Fondo con desenfoque (backdrop-filter: blur).
2. **Header (`.es-header`)**: Avatar del tutor + Título de la sesión + Descripción.
3. **Tags (`.es-tags`)**: Materia, Nombre del Tutor y Estado de la sesión.
4. **Info Grid (`.es-grid`)**: Cuatro tarjetas (`.es-info-card`) con iconos Lucide-React para Modalidad, Duración, Fecha/Hora y Estado.
5. **Footer (`.es-footer`)**: Botones de acción (`.es-btn`) "colgantes".

### Variaciones de Tarjetas
- **Info Card (`.es-info-card`)**: Con bordes punteados (dashed) y fondo pastel.
- **Modification Card (`.es-info-card--mod`)**: Usadas en la comparación de propuestas.

## 3. Animaciones
- **es-fade-in**: Suaviza la aparición del overlay.
- **sdv-slide-up**: Animación de entrada con rebote sutil para el diálogo (cubic-bezier).

## 4. Iconografía
Se utilizan iconos SVG inline para evitar dependencias de archivos externos y asegurar carga instantánea:
- `IconCompu`: Monitor para modalidad.
- `IconTimer`: Reloj para duración.
- `IconCalendar`: Calendario para fecha.
- `IconPin`: Pin de ubicación para estado/lugar.
