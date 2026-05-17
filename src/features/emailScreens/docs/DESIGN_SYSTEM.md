# Sistema de Diseño - emailScreens

La feature utiliza un sistema de diseño estrictamente coherente con el componente **Session Detail View (SDV)** del dashboard principal, pero con prefijos específicos para evitar colisiones y asegurar una identidad propia de "Acciones de Email".

## 1. Tokens de Diseño (CSS Variables)
Localizados en `EmailScreensShared.css`, definen la paleta de colores y radios:
- `--es-violet`: Color principal para acentos (#8751ff).
- `--es-lime`: Para acciones positivas (Aceptar/Confirmar).
- `--es-coral`: Para acciones negativas o críticas (Rechazar/Cancelar).
- `--es-radius-modal`: 24px para el contenedor principal.

## 2. Componentes de UI Reutilizables

### El Contenedor Base (`.es-card`)
Estructura fija para todos los diálogos:
1. **Overlay (`.es-overlay`)**: Fondo con desenfoque (`backdrop-filter: blur(8px)`).
2. **Header (`.es-header`)**: Avatar del tutor + Título de la sesión + Descripción.
3. **Tags (`.es-tags`)**: Chips para Materia, Nombre del Tutor y Estado.
4. **Info Grid (`.es-grid`)**: Cuatro tarjetas (`.es-info-card`) con iconos Lucide-React.
5. **Footer (`.es-footer`)**: Botones de acción (`.es-btn`) con efectos de elevación.

### Formularios de Página Completa (`.reset-password-container`)
Utilizados en `/reset-password` y `/confirm-email`:
- **Tipografía**: Uso de `Cabinet Grotesk Variable` para títulos (64px+) y `Inter` para cuerpo.
- **Gradientes**: Fondos con gradientes radiales sutiles para sensación de profundidad.
- **Feedback**: Estados de éxito con iconos animados y botones de acción clara para retornar al login.

## 3. Animaciones y Micro-interacciones
- **es-fade-in**: Suaviza la aparición del overlay.
- **sdv-slide-up**: Animación de entrada con `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Botones**: Efecto `:active` que escala ligeramente hacia abajo (0.98) para feedback táctil.

## 4. Iconografía
Se prefieren iconos SVG inline o componentes de Lucide para carga instantánea:
- `IconCompu`: Modalidad (Online/Presencial).
- `IconTimer`: Duración de la sesión.
- `IconCalendar`: Fecha y hora programada.
- `IconPin`: Ubicación o estado del lugar.

## 5. Diseño Premium
El diseño busca una estética "Apple-like" con:
- Espaciado generoso (whitespace).
- Sombras suaves (`0 20px 40px rgba(0,0,0,0.1)`).
- Bordes redondeados pronunciados.
- Tipografías variables de alto contraste.
