# SGT-Frontend

Frontend desarrollado en Astro para el sistema de agendamiento de tutorías

## Estrategia Git
- main: estable
- develop: integración
- feature/*: nuevas funcionalidades

## CI/CD y comprobación SDD

El workflow `CI` corre en pushes y PRs a `main` y `develop`. Usa Node.js 24 y
`npm ci`, prueba la política SDD, ejecuta `astro check` y compila el frontend.
Los despliegues siguen a cargo de la integración de Vercel.

En las PRs a `main` o `develop`, el job `SDD PR validation` valida la PR real
con permisos de lectura: comprueba su contrato SDD, el archivo de cierre y las
revisiones de GitHub. No se limita a ejecutar pruebas de la política. Se ejecuta
al abrir o actualizar una PR y cuando cambian sus revisiones. Los eventos de
revisión requieren que el workflow ya esté integrado en la rama predeterminada;
durante la instalación inicial, volver a ejecutar CI tras recibir el Approve.

El workflow `SDD gate`, copiado de Nexo, publica el estado `SDD / Feature gate`
sobre el commit de cada PR. Comprueba el bloque JSON de la plantilla de PR y
`sdd/features/<feature_id>/state.json` en ese mismo commit. Exige que el estado
coincida con el identificador y declare `schema_version: 1`, `status: archived`,
`operation.command: archive`, `operation.phase: complete` y
`verification.status: pass`. Ese archivo debe ser el resultado real del proceso
SDD; no basta con enlazar una spec en Markdown o declarar su cierre en la PR.

También exige una aprobación vigente de otro colaborador con permisos de
escritura sobre el commit actual y rechaza revisiones vigentes que soliciten
cambios. `PR review signal` dispara una reevaluación al cambiar las revisiones;
el gate también reevalúa cambios de descripción, commits y estado de la PR.

Para habilitarlo, los workflows y `scripts/ci/sdd-policy.cjs` deben estar primero
en la rama predeterminada: el gate ejecuta exclusivamente código de esa rama,
sin ejecutar código de la PR con permisos de escritura. Tras integrarlos,
ejecutar `SDD gate` manualmente para evaluar las PRs abiertas. Configurar
`Check and build` y `SDD / Feature gate` como comprobaciones obligatorias
en las reglas de protección de `main` y `develop`; los workflows por sí solos
no impiden un merge. Esta copia no modifica esas reglas en GitHub.

Pruebas locales de la política: `node --test scripts/ci/sdd-policy.test.cjs`.
