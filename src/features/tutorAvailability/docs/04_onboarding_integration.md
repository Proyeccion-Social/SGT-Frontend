# Integración con el Flujo de Onboarding (Post-Perfil)

Este documento describe cómo la funcionalidad de `tutorAvailability` se integra en el flujo obligatorio de configuración tras completar el perfil del tutor.

---

## 1. Arquitectura de Integración

La integración se basa en un sistema de **Overlays** y **Eventos Globales** que aseguran que el tutor configure su disponibilidad inmediatamente después de completar sus datos personales, sin permitir que se salte este paso.

### Componentes Clave:
- **`TutorAvailabilityOverlay.astro`**: Actúa como un contenedor pasivo que incluye todos los diálogos necesarios para el flujo de disponibilidad (`InitialConfigDialog`, `tutorCalendar`, `SpaceInfoDialog`, `HoursConfigDialog`).
- **`DashboardLayout.astro`**: Inyecta el `TutorAvailabilityOverlay` de forma global para cualquier usuario con el rol de `tutor`.

## 2. Disparador del Flujo (Trigger)

El flujo comienza en el componente de perfil (**`VaulDrawer.tsx`**). Cuando el tutor completa el último paso del perfil:

1. El componente `Finish` recibe la señal de éxito.
2. Se cierra el Drawer del perfil.
3. Se dispara un evento personalizado: `window.dispatchEvent(new CustomEvent('open-initial-config-dialog'))`.
4. El componente `InitialConfigDialog.astro` captura este evento y muestra el primer modal de bienvenida a la configuración de disponibilidad.

## 3. Flujo Obligatorio (Non-Skippable)

Para garantizar que el tutor complete la configuración, se han implementado las siguientes medidas de seguridad en los diálogos:

- **Bloqueo de tecla Escape**: Se previene el cierre de los diálogos principales (`InitialConfigDialog`, `HoursConfigDialog`) al presionar la tecla `Esc` mediante `event.preventDefault()` en los listeners de `cancel` y `keydown`.
- **Sin cierre por Backdrop**: Los diálogos están configurados para no cerrarse al hacer click fuera del contenedor (en el área sombreada).
- **Navegación controlada**: El usuario solo puede avanzar mediante los botones de acción previstos (ej. "Empezar", "Guardar disponibilidad", "Terminar y guardar").

## 4. Secuencia de Pasos

1. **Paso 1: Bienvenida (`InitialConfigDialog`)**: Explica al tutor qué va a configurar. Al dar click en "Empezar", se cierra este diálogo y se abre el calendario.
2. **Paso 2: Calendario Interactivo (`tutorCalendar`)**: El tutor arrastra sobre la cuadrícula para definir sus franjas.
3. **Paso 3: Límite Semanal (`HoursConfigDialog`)**: Una vez guardada la disponibilidad desde el sidebar del calendario, se solicita definir el límite de horas semanales. Este es el paso final.
4. **Finalización**: Al guardar el límite, se cierra el flujo y el tutor queda con su perfil y disponibilidad configurados.

## 5. Implementación Técnica por Archivo

- **`src/layouts/dashboards/DashboardLayout.astro`**:
  ```astro
  {rol === "tutor" && (
    <>
      <VaulDrawer client:load transition:persist />
      <TutorAvailabilityOverlay />
    </>
  )}
  ```
- **`src/features/tutorAvailability/components/InitialConfigDialog.astro`**: Contiene la lógica para bloquear `Escape` y transicionar hacia `open-tutor-calendar-dialog`.
- **`src/features/tutorAvailability/components/HoursConfigDialog.astro`**: Bloquea `Escape` y realiza el guardado final de límites, cerrando el flujo.
- **`src/components/ui/drawer.tsx` (VaulDrawer)**: Orquestador de la transición entre el fin del perfil y el inicio de disponibilidad.
