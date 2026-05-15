## Plan: Email action flows in NestJS

Objetivo: alinear los correos, los tokens temporales y las acciones del dashboard con la arquitectura actual de NestJS + Astro sin duplicar pantallas ni relajar seguridad. La regla base es: solo confirmación de email y reset de contraseña usan token público de un solo uso; el resto de acciones desde correo abren contexto y luego ejecutan endpoints protegidos por JWT, rol y ownership.

**Phases**

### 1) Cerrar el contrato de autenticación y tokens
1. Mantener `POST /auth/confirm-email` y `POST /auth/password/reset` como flujos públicos. Reutilizan los tokens ya existentes en [email-verification-token.entity.ts](src/modules/auth/entities/email-verification-token.entity.ts#L12) y [password-reset-token.entity.ts](src/modules/auth/entities/password-reset-token.entity.ts#L12).
2. No introducir un token público genérico para confirmación de sesión, rechazo, modificación o evaluación. Esos flujos deben seguir dependiendo de JWT y de validaciones de negocio en backend.
3. **[Resuelto en Frontend]** Astro ya implementa un BFF (Backend For Frontend) en `src/pages/api/emailScreens/*` que lee la cookie `access_token` y la reenvía como `Bearer` token en las peticiones al backend de NestJS. Por lo tanto, el transporte ya está resuelto y el backend debe seguir esperando el `Authorization` header validado con [jwt.strategy.ts](src/modules/auth/strategies/jwt.strategy.ts#L13).

### 2) Corregir la modificación de sesión
4. Ajustar el contrato de [sessions.controller.ts](src/modules/scheduling/controllers/sessions.controller.ts#L146) y [sessions.controller.ts](src/modules/scheduling/controllers/sessions.controller.ts#L165) para que el `requestId` que aparece en la URL realmente se use al resolver la request pendiente.
5. Corregir [sessions.controller.ts](src/modules/scheduling/controllers/sessions.controller.ts#L260) porque hoy declara una ruta sin `:requestId` pero lee `requestId` del param. Debe quedar consistente con la ruta real o eliminarse el endpoint si no aporta valor.
6. En [session.service.ts](src/modules/scheduling/services/session.service.ts#L788), reforzar la validación para que la respuesta a una modificación no dependa solo de “hay una pendiente en esta sesión”, sino de la request específica y de su expiración.

### 3) Definir el flujo desde correo hacia frontend Astro
7. Cambiar los links de correo para que lleven a la ruta principal del dashboard inyectando contexto a través de query params, específicamente usando la estructura que ya espera el frontend: `?action=X&id=Y`. El mapeo de acciones a tipos de ID debe documentarse y respetarse estrictamente para evitar ambigüedades:
   - `action=confirm-session` → `id` = `sessionId`
   - `action=review-modification` → `id` = `requestId`
   - `action=reschedule` → `id` = `sessionId`
   - `action=evaluate` → `id` = `sessionId`
8. El frontend debe usar ese contexto para abrir pantallas o diálogos existentes y, después, cargar datos reales con endpoints autenticados. No debe existir una pantalla duplicada para cada correo si ya hay un componente reusable.
9. **Regla Crítica (No mutaciones on-load):** Nunca ejecutar mutaciones (confirm-session, review-modification, evaluate) automáticamente al cargar una URL. La URL solo debe abrir la UI y hacer un fetch de lectura. La mutación siempre debe requerir una acción explícita del usuario (click/submit) para evitar ejecuciones accidentales provocadas por prefetch de navegadores o scanners de correo.
10. Para rutas públicas de auth, mantener los links con token opaco solo en el frontend: `/confirm-email?token=...` y `/reset-password?token=...`.

### 4) Consolidar notificaciones sin sobrediseñarlas
10. Dejar `settleAll`, el renderizado HBS y la persistencia de notificaciones como están, porque el patrón email + app notification está bien resuelto.
11. Extraer solo la construcción de URLs/contextos si hace falta, para evitar que [notifications.service.ts](src/modules/notifications/services/notifications.service.ts#L77) siga creciendo como módulo de navegación.
12. No mover lógica de autorización ni validación de sesión al servicio de notificaciones; ese servicio debe seguir siendo de entrega, no de decisión de negocio.

### 5) Seguridad y validación transversal
13. Mantener expiración corta y consumo único en los tokens públicos actuales. Confirmar que el backend invalida tokens anteriores al generar uno nuevo.
14. Revalidar ownership, estado de sesión, estado de request y ventanas temporales en cada endpoint protegido: confirmación, rechazo, modificación, evaluación y cambio de datos.
15. **[Aclaración de Seguridad BFF]** Ya que Astro actúa como proxy (BFF) gestionando la cookie `access_token` y transformándola en un `Bearer` token hacia NestJS, el backend **no debe** pasar a aceptar cookies de autenticación de forma directa. Además, el BFF de Astro debe estar configurado como un **proxy con allowlist** (no reenviar cualquier ruta indiscriminadamente) y garantizar que las rutas de `emailScreens` para cargar información inicial sean de **solo lectura**.
16. Tras reset de contraseña, revocar sesiones activas y auditar la acción como ya hace [auth.service.ts](src/modules/auth/services/auth.service.ts#L443).

**Relevant files**
- [src/modules/auth/entities/email-verification-token.entity.ts](src/modules/auth/entities/email-verification-token.entity.ts) y [src/modules/auth/services/email-verification.service.ts](src/modules/auth/services/email-verification.service.ts) — patrón vigente de token público de un solo uso para confirmación de email.
- [src/modules/auth/entities/password-reset-token.entity.ts](src/modules/auth/entities/password-reset-token.entity.ts) y [src/modules/auth/services/password-reset.service.ts](src/modules/auth/services/password-reset.service.ts) — patrón vigente de token público de un solo uso para reset de contraseña.
- [src/modules/auth/controllers/auth.controller.ts](src/modules/auth/controllers/auth.controller.ts) y [src/modules/auth/services/auth.service.ts](src/modules/auth/services/auth.service.ts) — endpoints y lógica que no conviene romper.
- [src/modules/scheduling/controllers/sessions.controller.ts](src/modules/scheduling/controllers/sessions.controller.ts) y [src/modules/scheduling/services/session.service.ts](src/modules/scheduling/services/session.service.ts) — aquí se corrige el uso de `requestId` y se preserva la seguridad de confirm/reject/modification.
- [src/modules/session-execution/controllers/session-execution.controller.ts](src/modules/session-execution/controllers/session-execution.controller.ts) y [src/modules/session-execution/services/evaluation.service.ts](src/modules/session-execution/services/evaluation.service.ts) — evaluación debe seguir como flujo autenticado.
- [src/modules/notifications/services/notifications.service.ts](src/modules/notifications/services/notifications.service.ts) — solo cambiar construcción de links/contexto, no el modelo de envío.
- [src/modules/auth/strategies/jwt.strategy.ts](src/modules/auth/strategies/jwt.strategy.ts) — confirma que el backend espera Bearer en header.

**Verification**
1. Revisar que cada acción tenga un único punto de autoridad: auth público solo para confirm/reset; resto por JWT + rol + ownership.
2. Validar que los links de correo abran el estado correcto en Astro sin necesidad de duplicar vistas ni de ejecutar acciones sin autenticación.
3. **[Ownership en Lectura]** Que cada acción haga un "fetch de datos" primero (vía el BFF) y el backend responda 403/404 si el usuario no tiene ownership (así evitamos que cambiar el `id` en la URL permita ver datos de otras sesiones).
4. **[Prevención de Caché]** Que las rutas del BFF devuelvan la cabecera `Cache-Control: no-store` para asegurar que no queden pantallas con datos sensibles cacheadas en intermediarios.
5. **[Contratos de Tokens de Auth]** Confirmar que el envío de tokens por el frontend respeta los contratos: `confirm-email` manda token en el body y `password/reset` en la query; asegurar que el BFF lo envíe exactamente como NestJS lo espera.
6. Verificar que la ruta de modificación use el `requestId` real y no una request pendiente genérica.
7. Comprobar que el transporte del JWT entre Astro y NestJS esté definido antes de tocar enlaces o guards.

**Decisions**
- Reutilizar endpoints actuales siempre que ya existan y estén protegidos correctamente.
- El mejor encaje para este proyecto es: resolver contexto del link y luego ejecutar endpoints normales autenticados.
- Solo si aparece un caso nuevo que deba ejecutarse sin login, tendría sentido introducir una tabla genérica de tokens de acción; hoy no hace falta.
