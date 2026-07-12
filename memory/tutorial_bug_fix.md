# Corrección: Bug del Tutorial de Inicio

## Problema
El evento `tutorial:start` se disparaba cada vez que un tutor actualizaba su límite de horas desde la vista de disponibilidad (`HoursConfigDialog.astro`). Esto provocaba que el tutorial se abriera incorrectamente en sesiones futuras, a pesar de que el usuario ya había completado su registro inicial. 

Adicionalmente, la lógica original usaba dos llaves en `localStorage` (`page-tutorial-seen` y `profile-completion-flow`), lo cual generaba un bug secundario donde la última etapa del tutorial ("final") nunca se ejecutaba porque la condición de ambas llaves fallaba.

## Solución
Se simplificó la lógica en `TutorialInitializer.tsx` para usar **una única llave** de control:
- `profile-completion-flow:<userId>:<role>`

### Flujo Corregido:
1. **Creación:** Esta llave **solo** se crea en `drawer.tsx` cuando el usuario (nuevo) tiene que completar su perfil de forma obligatoria.
2. **Validación:** Cuando cualquier componente (como el modal de horas) dispara `tutorial:start`, el inicializador verifica si la llave existe.
3. **Ejecución y Limpieza:** Si la llave existe, significa que el usuario acaba de terminar de crear su perfil, por lo que el tutorial arranca y **la llave se elimina**. 
4. **Prevención:** Si el usuario entra a editar sus horas en el futuro, la llave ya no existirá (porque el drawer nunca se abrió). El inicializador bloquea el inicio del tutorial.

## Conclusión
Al depender exclusivamente de la apertura forzosa del Drawer de perfil para crear la llave, garantizamos que el tutorial nunca vuelva a mostrarse de forma inesperada. Además, al usar una sola llave se solucionó el bug que bloqueaba el tour "final".
