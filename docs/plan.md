## Plan: Dialogs 1:1 desde docs + redirects de correo

Estado: aprobado para implementación (MVP sin evaluate)

Objetivo: mostrar los mismos dialogs de docs con paridad visual y de interacción (estructura, clases CSS, estados, cierre, copy base), y conectarlos al flujo de links de correo en dashboard sin romper el patrón BFF.

TL;DR: primero se porta el stack de dialogs exacto desde docs (tsx + css + assets + dependencias), luego se añade el orquestador de email actions y el flujo de redirect/login retorno.

**Decisiones confirmadas**
- Se requiere paridad 1:1 con dialogs de docs.
- Se porta primero UI/UX exacta, luego wiring de correo.
- Se recibió docs/estilos.txt con estilos de sesiones/modales; se tomará como source of truth para paridad visual base.
- Se recibieron assets en docs (calendar-day.svg, CloseIcon.svg, compu.svg, Pin.svg, PurpleCheckIcon.svg, timer.svg, WhiteCheckIcon.svg).
- Evaluación (MultiStepRating) se difiere a la fase final y no bloquea el primer entregable de email redirects.

## Fase 0: Ingesta de artefactos base (bloqueante)

1. Consolidar estilos recibidos de docs/estilos.txt en archivos CSS reales del proyecto, respetando paridad 1:1 y eliminando duplicados/bloques repetidos sin alterar el resultado visual.
   - Cubierto por estilos recibidos: IncomingSessionsCard, CancelSessionModal, SessionDetailModal, SessionDetailView, ProposeModificationView/PMF.
2. Integrar assets recibidos en docs (íconos SVG) y ajustar rutas/imports en componentes portados.
3. Verificar imports/resolución de paths y alias.
4. Registrar inventario final de archivos portados para auditoría de paridad.

Criterio de salida:
- El proyecto compila con los dialogs portados y sin romper imports.

## Fase 1: Port exacto de dialogs base (paridad visual/UX)

1. Portar componentes de sesiones desde docs con cambios mínimos de compatibilidad:
   - CancelSessionModal
   - SessionDetailModal
   - SessionDetailView
   - ProposeModificationView
   - EditSessionView
2. Mantener estructura de markup, classNames y flujo de interacción igual a docs:
   - modal-overlay
   - modal-card
   - modal-card__close
   - estados loading/error/success donde aplique
3. Confirmar paridad de comportamiento:
   - cierre por botón X
   - cierre por backdrop
   - cierre por Escape (cuando aplique)
   - transiciones y mensajes equivalentes
4. Dejar evaluación fuera del primer entregable (se integra en fase final).

Criterio de salida:
- Paridad funcional/visual con docs validada en una revisión manual comparativa.

## Fase 2: Redirect/login para links de correo

1. Ajustar middleware para preservar retorno:
   - si no hay sesión en ruta protegida, redirigir a /?session=expired&redirect=<path+search>
   - en refresh fallido, preservar el mismo redirect
2. Login auto-open en home:
   - si existe redirect en query, abrir login automáticamente
3. Post-login seguro:
   - navegar a redirect sólo si cumple whitelist (destinos /dashboard)
   - fallback a /dashboard

Criterio de salida:
- Flujo completo: link de correo -> login -> regreso exacto a /dashboard?action=...&id=...

## Fase 3: EmailActionController (orquestador)

1. Montar controlador una sola vez en DashboardLayout.
2. Leer action y resource id de query (alcance inicial):
   - confirm-session (sessionId)
   - review-modification (requestId)
   - reschedule (sessionId)
3. Ignorar `evaluate` en MVP (o mostrar no disponible) hasta fase final.
4. Resolver estado remoto vía BFF:
   - loading, ok, forbidden, expired, error
5. Redirigir a login si 401 preservando redirect.
6. Al cerrar dialog, limpiar query params sin recargar.

Criterio de salida:
- Cada action del MVP abre su dialog correspondiente desde la URL.

## Fase 4: Mapeo action -> dialog 1:1

1. confirm-session -> dialog de confirm/reject con layout y clases base portadas.
2. review-modification -> dialog de propuesta/aceptación con layout base portado.
3. reschedule -> dialog informativo con CTA a búsqueda prefiltrada.
4. evaluate queda diferido a fase final.

Regla:
- Reutilizar el mismo lenguaje visual de docs; no introducir shell alternativo.

## Fase 5: BFF routes para email actions

1. Crear/ajustar rutas Astro API para sesiones/modification-requests:
   - GET session by id
   - POST confirm session
   - POST reject session
   - GET modification-request by id
   - POST accept modification-request
   - POST reject modification-request
2. Patrón BFF obligatorio:
   - leer access_token cookie
   - forward con Bearer token
   - propagar status/cuerpo JSON

Criterio de salida:
- Controller/dialogs no llaman Nest directo; sólo /api/*.

## Fase 6: Verificación de paridad + regresión

1. Visual parity checklist contra docs:
   - estructura modal
   - spacing/typography/colors/botones
   - estados y textos
2. Flujos funcionales:
   - link sin sesión -> login -> retorno -> dialog
   - manejo 403/410/404/500
   - cierre limpia query params
3. Smoke de regresión:
   - dashboard base sigue estable
   - login/change-password sin regresión


## Fase 7: Evaluación (fase final, posterior al MVP)

1. Portar SessionDialogManager y MultiStepRating desde docs/codigoActualEvaluacion.txt.
2. Consolidar estilos específicos de evaluación (container-dialog, sdm-backdrop, sdm-content, etc.) y assets asociados.
3. Conectar action `evaluate` en EmailActionController al wrapper de evaluación.
4. Validar integración con BFF de history/evaluation y estados de ya-calificado.

Criterio de salida:
- Action `evaluate` habilitada con el mismo comportamiento y estilo de la referencia de docs.

## Checklist operativa MVP (orden de ejecución)

1. Preparación de base visual y assets
   - Consolidar estilos de docs/estilos.txt en CSS por componente dentro de src/features/sessions/styles.
   - Copiar assets SVG de docs hacia las carpetas de assets de sessions respetando nombres.
   - Resolver y validar imports en componentes con rutas de alias del proyecto.

2. Port de dialogs 1:1 desde docs
   - Portar componentes de modal de sesiones/modificación en src/features/sessions/components manteniendo classNames y estructura original.
   - Mantener comportamiento de cierre por X, backdrop y Escape donde aplique.
   - Validar estados loading y error con copy equivalente al de la referencia.

3. Redirect y login retorno
   - Ajustar middleware para redirigir con parámetro redirect preservando path+query original.
   - Auto-abrir login en home cuando exista redirect.
   - Post-login con whitelist de destinos dashboard y fallback seguro.

4. Orquestación de acciones de correo
   - Montar EmailActionController en layout de dashboard para todos los roles.
   - Habilitar en MVP solo confirm-session, review-modification y reschedule.
   - Limpiar query params al cerrar dialog sin recarga de página.

5. Capa BFF para acciones
   - Crear endpoints Astro API para obtener sesión/request y para confirmar/rechazar/aceptar.
   - Forzar patrón BFF: cookie access_token, Bearer al backend, propagación de status y body.

6. Verificación de MVP
   - Paridad visual contra docs para los dialogs portados.
   - Flujo completo link correo sin sesión -> login -> retorno -> dialog correcto.
   - Validar 403, 410 y errores genéricos por action.

7. Fase final (no bloqueante)
   - Integrar evaluate con SessionDialogManager y MultiStepRating de docs/codigoActualEvaluacion.txt.
   - Consolidar estilos y assets de evaluación al final.

## Matriz exacta Fase 0-1 (archivo por archivo)

### A. Archivos a crear (paridad 1:1 desde docs)
1. src/features/sessions/components/DashboardSessionManager.tsx — Orquestador de modales de sesiones (base docs/codigoActual.txt).
2. src/features/sessions/components/IncomingSessionsCard.tsx — Card/listado y evento open-detail.
3. src/features/sessions/components/SessionDetailModal.tsx — Shell modal principal con estados loading/error.
4. src/features/sessions/components/SessionDetailView.tsx — Vista detalle con acciones Proponer/Editar/Cancelar.
5. src/features/sessions/components/CancelSessionModal.tsx — Modal de cancelación con motivo.
6. src/features/sessions/components/ProposeModificationView.tsx — Form de propuesta de modificación.
7. src/features/sessions/components/EditSessionView.tsx — Form de edición de sesión.
8. src/features/sessions/styles/IncomingSessionsCard.css — Estilos desde docs/estilos.txt.
9. src/features/sessions/styles/SessionDetailModal.css — Estilos desde docs/estilos.txt.
10. src/features/sessions/styles/SessionDetailView.css — Estilos desde docs/estilos.txt.
11. src/features/sessions/styles/CancelSessionModal.css — Estilos desde docs/estilos.txt.
12. src/features/sessions/styles/ProposeModificationView.css — Estilos desde docs/estilos.txt.
13. src/features/sessions/assets/icons/calendar-day.svg — Asset portado desde docs.
14. src/features/sessions/assets/icons/CloseIcon.svg — Asset portado desde docs.
15. src/features/sessions/assets/icons/compu.svg — Asset portado desde docs.
16. src/features/sessions/assets/icons/Pin.svg — Asset portado desde docs.
17. src/features/sessions/assets/icons/timer.svg — Asset portado desde docs.
18. src/features/sessions/assets/icons/PurpleCheckIcon.svg — Asset portado desde docs.
19. src/features/sessions/assets/icons/WhiteCheckIcon.svg — Asset portado desde docs.

### B. Archivos a modificar (compatibilidad de dominio y wiring)
1. src/features/sessions/types/session.types.ts — Añadir/ajustar tipos usados por modales (ModifySessionBody, EditSessionBody, campos de SessionDetail).
2. src/features/sessions/hooks/useSession.ts — Exponer operaciones usadas por DashboardSessionManager (cancelar, modificar, editar, fetch por rol).
3. src/features/sessions/hooks/useAvailability.ts — Ajustar mapping a estructura AvailabilitySlot esperada por ProposeModificationView.
4. src/features/sessions/services/sessionService.ts — Migrar llamadas a rutas BFF /api/* (no consumo directo de backend desde React).
5. src/layouts/dashboards/DashboardLayout.astro — Montar DashboardSessionManager/EmailActionController en punto único.

### C. Archivos a modificar (redirect/login)
1. src/middleware/index.ts — Preservar redirect (path+query) cuando no hay sesión o falla refresh.
2. src/features/auth/components/LoginDialog.astro — Auto-open cuando existe query redirect.
3. src/features/auth/components/LoginForm.astro — Post-login con redirect y whitelist segura.

### D. Archivos a crear (MVP email actions, sin evaluate)
1. src/features/sessions/components/EmailActionController.tsx — Resolver action por query (confirm-session, review-modification, reschedule).
2. src/features/sessions/components/ConfirmSessionDialog.tsx — Reutilizar estilo modal portado.
3. src/features/sessions/components/ReviewModificationDialog.tsx — Reutilizar estilo modal portado.
4. src/features/sessions/components/RescheduleDialog.tsx — Reutilizar estilo modal portado.
5. src/pages/api/sessions/[sessionId].ts — GET detalle sesión.
6. src/pages/api/sessions/confirm-session.ts — POST confirmar sesión.
7. src/pages/api/sessions/reject-session.ts — POST rechazar sesión.
8. src/pages/api/modification-requests/[requestId].ts — GET detalle request.
9. src/pages/api/modification-requests/accept.ts — POST aceptar request.
10. src/pages/api/modification-requests/reject.ts — POST rechazar request.

### E. Archivos explícitamente diferidos a fase final
1. Integración evaluate: SessionDialogManager + MultiStepRating + estilos de evaluación de docs/codigoActualEvaluacion.txt.
2. Cualquier ruta BFF adicional de history/evaluation necesaria para evaluate en EmailActionController.

### Dependencias de ejecución
1. A depende de disponibilidad de estilos/assets de docs (ya recibidos para sesiones/modales).
2. B depende de A para compilar componentes portados.
3. C puede ejecutarse en paralelo con A/B.
4. D depende de C (para retorno post-login) y de B (base de modales/estado).
5. E depende de estabilización completa del MVP.
## Sprint 1 (listo para ejecución)

1. Ticket S1-01: Port base visual de sesiones
Objetivo: consolidar CSS desde docs/estilos.txt en styles de sessions con paridad visual.
Archivos base: src/features/sessions (styles), docs/estilos.txt.
Done: pantallas de sesiones renderizan classes modal/card sin conflictos de estilos.

2. Ticket S1-02: Port componentes modales 1:1
Objetivo: portar modales de sessions/modificación desde docs/codigoActual.txt.
Archivos base: src/features/sessions/components, src/features/sessions/hooks, src/features/sessions/types.
Done: cierre por X/backdrop/Escape y estados loading/error equivalentes a referencia.

3. Ticket S1-03: Integración de assets
Objetivo: mover SVG de docs a assets de sessions y corregir imports.
Archivos base: docs (assets SVG), src/features/sessions/assets.
Done: build sin errores de assets faltantes y UI con íconos correctos.

4. Ticket S1-04: Redirect/login retorno
Objetivo: preservar redirect desde dashboard y volver post-login de forma segura.
Archivos base: src/middleware/index.ts, src/features/auth/components/LoginDialog.astro, src/features/auth/components/LoginForm.astro.
Done: flujo link correo sin sesión -> login -> retorno exacto al dashboard con query.

5. Ticket S1-05: Email actions MVP (sin evaluate)
Objetivo: montar orquestador y dialogs para confirm-session, review-modification y reschedule.
Archivos base: src/layouts/dashboards/DashboardLayout.astro, src/features/sessions/components, src/pages/api/sessions, src/pages/api/modification-requests.
Done: cada action del MVP abre su dialog y consume BFF /api.

6. Ticket S1-06: Verificación de sprint
Objetivo: validar paridad visual y flujos funcionales del MVP.
Comandos: pnpm build.
Pruebas manuales: redirect/login, apertura por action, manejo 403/410/error, limpieza de query al cerrar.
Done: build ok y checklist MVP completa.

## Archivos fuente de referencia (paridad)
- docs/codigoActual.txt
- docs/codigoActualEvaluacion.txt

## Riesgos y mitigaciones
- Riesgo: docs/estilos.txt trae bloques repetidos y variantes; puede haber conflictos de especificidad si se pega literal.
- Mitigación: consolidar CSS en archivos por componente y validar paridad visual contra screenshots/referencia antes de wiring.
- Riesgo: evaluación (MultiStepRating) no entra en MVP y puede requerir ajustes extra al final.
- Mitigación: tratar evaluación como fase 7 aislada, sin bloquear el release inicial de email redirects.
- Riesgo: diferencias de tipos/hooks entre ramas.
- Mitigación: adaptar typing/imports sin alterar markup/classes ni comportamiento UI.

## Alcance explícitamente excluido
- No rediseñar dialogs ni migrarlos a Drawer.
- No cambiar reglas de autorización backend.
- No reescribir flujos no relacionados con email actions.
- Evaluación no se entrega en el MVP inicial; se implementa en Fase 7.
