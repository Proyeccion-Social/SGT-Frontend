# History

## Propósito y objetivo

La feature `history` permite a usuarios revisar sus sesiones pasadas. Su objetivo es:

- Listar sesiones completadas, canceladas y/o filtradas por estado.
- Proveer paginación y filtros para navegar grandes volúmenes de sesiones.
- Permitir evaluar sesiones completadas que aún no han sido calificadas.
- Servir como registro histórico tanto para estudiantes como para tutores.

## Problema que resuelve

Una vez que las sesiones se completan (`COMPLETED`) o se cancelan (`CANCELLED_BY_*`), los usuarios necesitan:

1. Consultar detalles de sesiones anteriores.
2. Filtrar por estado o fecha.
3. Dejar evaluaciones dentro del periodo permitido.

`history` encapsula la obtención, presentación y evaluación de estas sesiones.

## Componentes principales

- [components/HistoryView.astro](../components/HistoryView.astro): vista principal del historial. Realiza carga SSR de sesiones según el rol.
- [components/SessionsBlock.astro](../components/SessionsBlock.astro): contenedor de layout que organiza las tarjetas de sesión.
- [components/SessionCardView.tsx](../components/SessionCardView.tsx): tarjeta individual que muestra los detalles de una sesión.
- [components/HistorySessionManager.tsx](../components/HistorySessionManager.tsx): gestor de interacciones del historial (abrir tarjeta, iniciar evaluación, etc.).
- [components/HistoryFilters.tsx](../components/HistoryFilters.tsx): controles de filtro por estado, fecha, etc.
- [components/MultiStepRating.tsx](../components/MultiStepRating.tsx): formulario multi-paso para evaluar una sesión.
- [components/SessionsPagination.tsx](../components/SessionsPagination.tsx): controles de paginación.

## Servicios y APIs

### [services/getHistory.ts](../services/getHistory.ts)

- `getHistory({ token, role, page, limit, status })` → `GET ${API_URL}/scheduling/sessions/my-sessions/{tutor|student}`
  - Retorna `{ sessions: Session[], pagination: { total, page, limit, totalPages } }`.
  - Soporta filtrado por `status`. Las canceladas **no se agrupan**: se filtra por cada estado real por separado
    (`CANCELLED_BY_STUDENT` / `CANCELLED_BY_TUTOR` / `CANCELLED_BY_ADMIN`).
  - Si `USE_MOCK=true`, utiliza mocks locales para desarrollo.

### [services/sendSessionEvaluation.ts](../services/sendSessionEvaluation.ts)

- `sendSessionEvaluation(sessionId, payload, token)` → `POST /session-execution/sessions/{sessionId}/evaluation`
  - Envía la evaluación de una sesión.
  - Misma función compartida con `emailScreens`.

### [services/getSessionEvaluationStatus.ts](../services/getSessionEvaluationStatus.ts)

- Obtiene si una sesión ya fue evaluada.

### [services/getEvaluationQuestions.ts](../services/getEvaluationQuestions.ts)

- Obtiene el cuestionario de evaluación.

## Mocks

- [mocks/mockHistory.ts](../mocks/mockHistory.ts): sesiones de prueba para desarrollo.
- [mocks/evaluationQuestionnaire.ts](../mocks/evaluationQuestionnaire.ts): preguntas de evaluación de prueba.
- [mocks/sendEvaluation.ts](../mocks/sendEvaluation.ts): mock de envío de evaluación.

## Tipos

Reutiliza los tipos de `sessions` (`Session`, `SessionStatus`, etc.) y define extensiones propias para filtros y paginación.

## Flujos de usuario

### Ver historial

1. Usuario navega a `/history`.
2. `HistoryView.astro` carga sesiones vía `getHistory()` en SSR, usando el rol del usuario autenticado.
3. Se renderizan `SessionsBlock` y `SessionCardView`.
4. El usuario puede paginar y filtrar.

### Evaluar sesión

1. Usuario abre una sesión completada no evaluada.
2. Hace clic en "Evaluar".
3. Se abre `MultiStepRating`.
4. Se cargan preguntas con `getEvaluationQuestions()`.
5. Usuario completa ratings y comentarios.
6. `sendSessionEvaluation()` envía la evaluación.

## Relación con otras features

- **sessions**: usa el tipo `Session` y comparte conceptos de estados y participantes.
- **emailScreens**: comparte servicios de evaluación (`sendSessionEvaluation`, `getSessionEvaluationStatus`, `getEvaluationQuestions`).
- **dashboards**: el dashboard puede mostrar un acceso directo al historial.
- **auth**: requiere sesión activa para obtener el historial del usuario.

## Páginas Astro que la utilizan

- [src/pages/history/index.astro](../../../pages/history/index.astro): página principal del historial.

## Notas técnicas

- La carga inicial es SSR para mejorar SEO y tiempo de primera pintura.
- La paginación puede manejarse tanto en servidor como en cliente según la implementación.
- Los mocks permiten desarrollar la UI sin depender de un backend con datos históricos.
- Las etiquetas de estado de `SessionCardView` y `SessionsBlock` provienen del helper compartido
  `sessions/utils/statusLabel.ts` (variante larga en la tabla desktop, corta en las tarjetas mobile). El
  override por ausencia (`ABSENT` → "No asistió" / "Completada - No asistió") es local a cada componente.
