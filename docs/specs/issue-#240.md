# Actualizar disponibilidad general - Actualizar límite de horas semanales

## Contexto / Problema
Actualmente cuando un tutor inicia sesión por primera vez, hay un flujo de completar perfil y configurar disponibilidad. El flujo de configurar disponibilidad se "reutilizó" en la sección de ajustes del tutor, usando un boton para actualizar la disponibilidad. El problema, es que al usar exactamente el mismo componente el funcionamiento de este, una vez el tutor ya completo y configuro su disponibilidad por primera vez, debería ser diferente. Algunas características de este componente:
- Después de terminar de configurar la disponibilidad, se muestra un dialog para configurar el límite de horas semanales
- Cuando el tutor está completando su perfil y configurando su disponibilidad, no puede cerrar los dialogs, es decir no se puede saltar esta parte
- Después de terminar de completar y configurar se muestra el tutorial de inicio

¿Qué debería suceder si el tutor quiere actualizar su disponibilidad después?:
- No se debería mostrar el dialog de configurar el límite de horas semanales
- Debería poder cerrar el apartado cuando quiera(no necesariamente tiene que guardar para poder cerrar)
- No se muestra el tutoríal (ya corregido en #228)

## Objetivo / Resultado esperado
El objetivo es hacer al componente un componente versátil y además quitar ese botón dispuesto en la sección de configuración y moverlo a `availability/tutor/slots`, cambiar el botón de "Mes" por el "Actualizar". Además, el sidebar y todo lo relacionado al botón de "Mes" se debe eliminar.

**Resultados esperados**
- El componente se puede hacer, sin importar el contexto o situación

## Estados a contemplar



- [ ] Hover / Focus

- [ ] Disabled

- [ ] Loading

- [ ] Error

- [ ] Vacío (Empty State)

- [ ] Éxito

- [ ] N/A (justificar por qué)



## Criterios de aceptación
1. Dado un tutor que completa su perfil por primera vez (onboarding), cuando termina de configurar su disponibilidad, entonces se debe mostrar el dialog para configurar el límite de horas semanales de forma obligatoria.
2. Dado un tutor en el flujo de onboarding, cuando intenta cerrar el dialog de disponibilidad o de límite de horas sin completar los datos requeridos, entonces el sistema no debe permitir cerrarlo.
3. Dado un tutor con perfil ya activo que accede a `availability/tutor/slots` para actualizar su disponibilidad, cuando termina de editar, entonces NO debe mostrarse el dialog de configurar límite de horas semanales.
4. Dado un tutor con perfil ya activo editando su disponibilidad, cuando decide cerrar el componente en cualquier momento, entonces debe poder hacerlo sin necesidad de guardar cambios previamente.
5. Dado el botón "Actualizar" en `availability/tutor/slots`, cuando el tutor hace click, entonces debe abrir el mismo componente de gestión de disponibilidad usado en el onboarding, pero en modo "edición" (sin los dialogs obligatorios ni el tutorial).
6. Dado el botón "Mes" y su sidebar asociado en la sección de configuración/ajustes, cuando se revisa la interfaz, entonces ambos deben estar eliminados por completo.
7. Dado que el tutor guarda cambios de disponibilidad desde el modo edición, cuando la petición se completa exitosamente, entonces el sistema debe reflejar los nuevos horarios sin recargar el tutorial de inicio.
## Casos borde a considerar
- Tutor que cierra el componente en modo edición sin haber guardado cambios: verificar que no se pierdan datos ya guardados previamente ni se apliquen cambios a medias.
- Tutor que intenta eliminar todas sus franjas de disponibilidad (validar que se mantenga al menos 1, según RF09/RF15).
- Error de red al guardar cambios en modo edición (mostrar error y permitir reintentar sin cerrar el componente).
- Tutor cuyo perfil está incompleto pero intenta acceder directamente a `availability/tutor/slots` (debe redirigirse al flujo de onboarding obligatorio).
- Tutor que reduce su límite de horas semanales por debajo de las horas ya agendadas (validar consistencia con sesiones existentes).
- Cambios de disponibilidad realizados en modo edición no deben afectar sesiones ya agendadas (según restricción documentada).

## Prioridad / Severidad



- [ ] 🔴 Bloqueante

- [ ] 🟠 Fricción

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
 
