# Incongruencia de card de información. Web Vs Correo

## Contexto / Problema
Cuando una persona es redirigida a la información de una tutoría desde el correo (https://atlas.proysocial.org/dashboard?action=confirm-session&sessionId=7f4a78b0-75ac-4306-8ba2-b053633fda5f) la card que muestra la información de la tutoría, es la card sin el diseño definido en el figma, es decir, es diferente a la card que se muestra cuando se ingresa a la información desde la web. Así mismo, hay un problema con los correos, yo como estudiante que propongo la tutoría, si accedo desde el correo, con la card vieja se muestran los botones de _Aceptar_ y _Rechazar_, como si tuviera el rol de Tutor, por otro lado, siempre que ingreso desde el correo me pide iniciar sesión de nuevo, a pesar de haber iniciado sesión hace menos de 1 minuto.

Por otro lado, cuando una tutoría es confirmada por el tutor, al estudiante le llega un correo de confirmación en donde puede acceder con un **CTA** a la información de la tutoría (https://atlas.proysocial.org/sessions/4663337f-8183-4024-9495-eec07183e7d8), ese link no existe en el front, puede que sea un error de back, revisar cuál debería ser el link correcto.

**¿Qué pasa si una sesión no se encuentra?** - El dialog de error actual es básico y feo, debería ser similar a los dialogs de éxito definidos, solo que este es para indicar que no existe o no se encontró la tutoría.

Se debería revisar el funcionamiento completo de los correos desde el front, revisar si se está haciendo de la mejor manera la implementación, en caso de no ser así, corregir y diagnosticar que se debería hacer en el backend, que es desde donde se envían los correos.


## Objetivo / Resultado esperado
- La card de información es única, sin importar el contexto
- Los correos redirigen de una manera correcta, sin tener que iniciar sesión cada que se accede desde el correo
- Los correos funcionan bien sin importar el caso de uso



## Alcance
Front, Back, Correos


**Incluye:**
- Diagnóstico del back y del front sobre los correos
- Corrección a card de información incorrecta



## Estados a contemplar


- [ ] Hover / Focus

- [ ] Disabled

- [ ] Loading

- [ ] Error

- [ ] Vacío (Empty State)

- [ ] Éxito

- [ ] N/A (justificar por qué)



## Criterios de aceptación

1. Dado que un usuario accede a la información de una tutoría desde el enlace de un correo, cuando la card se renderiza, entonces debe usar el mismo componente/diseño de card definido en Figma que se usa al acceder desde la web.
2. Dado que un estudiante (rol Estudiante) accede desde el correo a la información de una tutoría que él propuso, cuando visualiza la card, entonces NO deben mostrarse los botones de "Aceptar" y "Rechazar" (exclusivos del rol Tutor).
3. Dado que un usuario tiene una sesión activa vigente (dentro del tiempo de expiración definido, RF06), cuando ingresa a un link de correo (confirm-session o sessions/{id}), entonces debe acceder directamente sin que se le solicite iniciar sesión nuevamente.
4. Dado que un usuario NO tiene sesión activa, cuando ingresa a un link de correo, entonces debe redirigirse a login y, tras autenticarse, continuar automáticamente hacia la tutoría solicitada (no perder el destino original).
5. Dado que un tutor confirma una tutoría, cuando se genera el correo de confirmación para el estudiante, entonces el CTA debe apuntar a una ruta válida y existente en el front (no a `/sessions/{id}` si esa ruta no existe).
6. Dado un link de correo con un `sessionId` inexistente o inválido, cuando el usuario accede, entonces el sistema debe mostrar un mensaje de error claro en lugar de una card vacía o rota.
7. Dado un usuario autenticado con un rol distinto al dueño/participante de la tutoría, cuando intenta acceder al link de correo de esa tutoría, entonces el sistema debe denegar el acceso o mostrar solo la información permitida según su rol.
8. Dado que se revisan todos los tipos de correo del sistema (agendamiento, confirmación, recordatorio, cancelación, calificación pendiente), cuando se generan sus links, entonces todos deben apuntar a rutas existentes y consistentes en el front.

## Casos borde a considerar

- Link de correo con `sessionId` inválido, inexistente o de una tutoría ya eliminada/cancelada.
- Usuario que hace click en el link del correo estando en un dispositivo/navegador distinto al que usó para iniciar sesión originalmente.
- Sesión que expira justo entre el envío del correo y el click del usuario en el link.
- Usuario que abre el mismo link de correo varias veces (doble click, recarga).
- Usuario con rol distinto al esperado (ej. otro estudiante) que obtiene o reenvía el link de correo de un tercero.
- Correos antiguos con formato de link previo (retrocompatibilidad si se cambia la estructura de URL).
- Tutoría colaborativa (varios estudiantes) accediendo desde el correo: verificar que la card y permisos sean correctos para cada participante.
- Falta de conexión o error del servidor al resolver el `sessionId` desde el link.


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
 
# Incongruencia de card de información. Web Vs Correo

## Contexto / Problema
Cuando una persona es redirigida a la información de una tutoría desde el correo (https://atlas.proysocial.org/dashboard?action=confirm-session&sessionId=7f4a78b0-75ac-4306-8ba2-b053633fda5f) la card que muestra la información de la tutoría, es la card sin el diseño definido en el figma, es decir, es diferente a la card que se muestra cuando se ingresa a la información desde la web. Así mismo, hay un problema con los correos, yo como estudiante que propongo la tutoría, si accedo desde el correo, con la card vieja se muestran los botones de _Aceptar_ y _Rechazar_, como si tuviera el rol de Tutor, por otro lado, siempre que ingreso desde el correo me pide iniciar sesión de nuevo, a pesar de haber iniciado sesión hace menos de 1 minuto.

Por otro lado, cuando una tutoría es confirmada por el tutor, al estudiante le llega un correo de confirmación en donde puede acceder con un **CTA** a la información de la tutoría (https://atlas.proysocial.org/sessions/4663337f-8183-4024-9495-eec07183e7d8), ese link no existe en el front, puede que sea un error de back, revisar cuál debería ser el link correcto.

**¿Qué pasa si una sesión no se encuentra?** - El dialog de error actual es básico y feo, debería ser similar a los dialogs de éxito definidos, solo que este es para indicar que no existe o no se encontró la tutoría.

Se debería revisar el funcionamiento completo de los correos desde el front, revisar si se está haciendo de la mejor manera la implementación, en caso de no ser así, corregir y diagnosticar que se debería hacer en el backend, que es desde donde se envían los correos.


## Objetivo / Resultado esperado
- La card de información es única, sin importar el contexto
- Los correos redirigen de una manera correcta, sin tener que iniciar sesión cada que se accede desde el correo
- Los correos funcionan bien sin importar el caso de uso



## Alcance
Front, Back, Correos


**Incluye:**
- Diagnóstico del back y del front sobre los correos
- Corrección a card de información incorrecta



## Estados a contemplar


- [ ] Hover / Focus

- [ ] Disabled

- [ ] Loading

- [ ] Error

- [ ] Vacío (Empty State)

- [ ] Éxito

- [ ] N/A (justificar por qué)



## Criterios de aceptación

1. Dado que un usuario accede a la información de una tutoría desde el enlace de un correo, cuando la card se renderiza, entonces debe usar el mismo componente/diseño de card definido en Figma que se usa al acceder desde la web.
2. Dado que un estudiante (rol Estudiante) accede desde el correo a la información de una tutoría que él propuso, cuando visualiza la card, entonces NO deben mostrarse los botones de "Aceptar" y "Rechazar" (exclusivos del rol Tutor).
3. Dado que un usuario tiene una sesión activa vigente (dentro del tiempo de expiración definido, RF06), cuando ingresa a un link de correo (confirm-session o sessions/{id}), entonces debe acceder directamente sin que se le solicite iniciar sesión nuevamente.
4. Dado que un usuario NO tiene sesión activa, cuando ingresa a un link de correo, entonces debe redirigirse a login y, tras autenticarse, continuar automáticamente hacia la tutoría solicitada (no perder el destino original).
5. Dado que un tutor confirma una tutoría, cuando se genera el correo de confirmación para el estudiante, entonces el CTA debe apuntar a una ruta válida y existente en el front (no a `/sessions/{id}` si esa ruta no existe).
6. Dado un link de correo con un `sessionId` inexistente o inválido, cuando el usuario accede, entonces el sistema debe mostrar un mensaje de error claro en lugar de una card vacía o rota.
7. Dado un usuario autenticado con un rol distinto al dueño/participante de la tutoría, cuando intenta acceder al link de correo de esa tutoría, entonces el sistema debe denegar el acceso o mostrar solo la información permitida según su rol.
8. Dado que se revisan todos los tipos de correo del sistema (agendamiento, confirmación, recordatorio, cancelación, calificación pendiente), cuando se generan sus links, entonces todos deben apuntar a rutas existentes y consistentes en el front.

## Casos borde a considerar

- Link de correo con `sessionId` inválido, inexistente o de una tutoría ya eliminada/cancelada.
- Usuario que hace click en el link del correo estando en un dispositivo/navegador distinto al que usó para iniciar sesión originalmente.
- Sesión que expira justo entre el envío del correo y el click del usuario en el link.
- Usuario que abre el mismo link de correo varias veces (doble click, recarga).
- Usuario con rol distinto al esperado (ej. otro estudiante) que obtiene o reenvía el link de correo de un tercero.
- Correos antiguos con formato de link previo (retrocompatibilidad si se cambia la estructura de URL).
- Tutoría colaborativa (varios estudiantes) accediendo desde el correo: verificar que la card y permisos sean correctos para cada participante.
- Falta de conexión o error del servidor al resolver el `sessionId` desde el link.


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
 
