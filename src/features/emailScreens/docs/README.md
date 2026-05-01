# Email Action Screens (emailScreens)

Esta feature centraliza todas las pantallas de acción a las que un usuario accede a través de enlaces en correos electrónicos. Maneja tanto diálogos interactivos dentro del dashboard como páginas públicas independientes.

## Propósito
Aislar la lógica de "acciones rápidas" del resto del dashboard para mejorar el rendimiento, simplificar el mantenimiento y asegurar una experiencia de usuario (UX) consistente y premium.

## Estructura de Archivos
```text
src/features/emailScreens/
├── assets/              # Recursos visuales (iconos, ilustraciones)
├── components/          # Componentes React (Diálogos y Formularios)
├── docs/                # Documentación técnica y de diseño
├── mocks/               # Datos de prueba para el Playground
├── services/            # Lógica de comunicación con el backend/BFF
├── styles/              # CSS modular y específico por componente
└── types/               # Definiciones de TypeScript
```

## Pantallas Implementadas

### Diálogos de Gestión (Requieren Auth)
Orquestados por el `EmailActionController` en el Dashboard:
1. **Confirmación de Sesión**: Aceptar o rechazar solicitudes de tutoría.
2. **Revisión de Modificación**: Comparar cambios propuestos en una sesión.
3. **Reprogramación (Reschedule)**: Selector de nuevos horarios para sesiones existentes.
4. **Evaluación**: Calificación multi-paso de sesiones finalizadas.

### Páginas Públicas (Sin Auth)
Páginas independientes para flujos de seguridad:
1. **Restablecimiento de Contraseña**: `/reset-password?token=...`
2. **Confirmación de Correo**: `/confirm-email?token=...`

## Herramientas de Desarrollo
- **Email Screens Playground**: Una página dedicada (`/email-playground`) para probar todos los diálogos y flujos con datos reales o mocks sin necesidad de disparar correos electrónicos reales.

---
Documentación actualizada por Antigravity.
