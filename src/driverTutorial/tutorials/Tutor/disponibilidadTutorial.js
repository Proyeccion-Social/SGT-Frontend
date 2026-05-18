import { createTour, getInteractiveElement } from "../../createTour";

export function startDisponibilidadTutorTutorial(){
    const tour = createTour({
        steps: [
            {
                element: "#calendarTutorTUTORIAL",
                popover: {
                    title: "Tus franjas como tutor",
                    description:"Aqui podras ver tu calendario semanal de franjas disponibles/libres"
                }
            },
            {
                element: "#weekMonthTutorTUTORIAL",
                popover: {
                    title: "Organizado y Eficáz",
                    description: "Puedes ver  tus franjas tanto como por semana como por mes",
                }
            },
            {
                element: "#goHistorialTutorTUTORIAL",
                popover: {
                    title: "Tu historial",
                    description:  "Aqui podras ver todas tus sesiones. Luego lo podras ver mas detalladamente",
                }
            },
            {
                element: "#goNotificationsTUTORIAL",
                popover: {
                    title: "Al dia en un click",
                    description: "Revisa tus notificaciones de modificacion, propuesta, cancelacion, etc.",
                }
            },
            {
                element: "#godashboardTUTORIAL",

                popover: {
                    title: "Volvamos a la seccion principal",
                    description: "dale click",
                    showButtons: []
                },
                disableActiveInteraction: false

            }
        ]
    }
    );

     const btn = getInteractiveElement("#godashboardTUTORIAL");

     if (btn) {
         btn.addEventListener("click", () => {

            /*
              Guardar progreso
            */

            localStorage.setItem(
                "current-tour",
                "final"
            );

            /*
              Ir a otra pagina
            */

            window.location.href =
                "/dashboard";
        });
    }

    tour.drive();
}