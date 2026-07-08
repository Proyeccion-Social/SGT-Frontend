_Para las preguntas que requieren de respuesta, añadirla en la descripción de la PR. Por ejemplo, "Evidencia visual", "¿Qué cambia?", etc._
## Contexto
<!-- Link al issue y/o spec/diseño de Figma con criterios de aceptación. -->
Issue/Spec: #___
Diseño (Figma):

## ¿Qué cambia?
<!-- Pantalla(s) o componente(s) afectados. -->

## Evidencia visual
<!-- Screenshots o video corto. Idealmente lado a lado: diseño vs. implementación, para verificar fidelidad. -->
| Diseño | Implementación |
|---|---|
| (captura) | (captura) |

## Responsive
- [ ] Verificado en Desktop
- [ ] Verificado en Mobile
- [ ] N/A (cambio no visual / no aplica)

## Decisión técnica relevante (si aplica)
<!-- Solo si esto involucra una decisión técnica no trivial (ej. patrón de estado, estrategia de estilos, librería nueva). Si aplica, agregar un ADR corto en /docs/adr y enlazarlo aquí. -->
ADR relacionado: (enlace o "N/A")

## Estados del componente (si aplica)
- [ ] Hover / Focus
- [ ] Disabled
- [ ] Loading
- [ ] Error
- [ ] Éxito / vacío (empty state)
- [ ] N/A

## Checklist de estándares (Design System)
- [ ] Usa los tokens del Design System (colores, tipografía, espaciados) — sin valores hardcodeados
- [ ] No hay estilos inline sin justificación
- [ ] Se revisó si ya existía un componente reutilizable antes de crear uno nuevo
- [ ] Sigue las convenciones de nomenclatura y estructura de carpetas del proyecto

## Pruebas realizadas
- [ ] Flujo principal probado manualmente
- [ ] Al menos un caso borde probado (ej. texto muy largo, lista vacía, sin conexión/error de API)
- [ ] Probado con datos reales de la API (no solo mocks), si aplica

## ¿Esto coincide con la spec/diseño original?
- [ ] Sí, se verificó explícitamente contra el diseño de Figma y los criterios de aceptación
- [ ] Hubo cambios respecto a la spec/diseño original → se actualizó el documento o se avisó a diseño

## Reviewer
- [ ] Persona distinta a quien implementó revisó este PR (incluyendo fidelidad visual)
