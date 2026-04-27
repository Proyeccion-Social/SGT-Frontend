# Email Action Screens (emailScreens)

Esta feature centraliza todas las pantallas de acción a las que un usuario accede a través de enlaces en correos electrónicos (confirmaciones, modificaciones, reprogramaciones y evaluaciones).

## Propósito
Aislar la lógica de "acciones rápidas" del resto del dashboard para mejorar el rendimiento, simplificar el mantenimiento y asegurar una experiencia de usuario (UX) consistente y premium basada en el diseño de **Session Detail View (SDV)**.

## Estructura de Archivos
```text
src/features/emailScreens/
├── components/          # Diálogos interactivos (Confirm, Review, etc.)
├── docs/                # Documentación técnica y de diseño
├── services/            # Lógica de comunicación con el BFF
├── styles/              # Estilos compartidos y específicos (ResetPasswordForm.css)
└── types/               # Definiciones de TypeScript para la feature
```

## Pantallas Implementadas
1. **Confirmación de Sesión**: Aceptar o rechazar solicitudes de tutoría.
2. **Revisión de Modificación**: Comparar el estado actual vs. la propuesta y decidir.
3. **Reprogramación (Reschedule)**: Seleccionar nuevos horarios.
4. **Evaluación**: Calificar sesiones completadas con métricas y comentarios.
5. **Restablecimiento de Contraseña**: Página pública para cambiar contraseñas mediante tokens de recuperación.

---
Documentación generada por Antigravity.
