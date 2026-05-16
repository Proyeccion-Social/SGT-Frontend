import {createTour} from "../../createTour"

export function startDisponibilidadTutorTutorial(){
    const tour = createTour({
        steps: [
            {
                element: "#calendarTutorTUTORIAL",
                popover: {
                    title: "--------------",
                    description: "------- --------- ---------",
                }
            },
            {
                element: "#weekMonthTutorTUTORIAL",
                popover: {
                    title: "--------------",
                    description: "------- --------- ---------",
                }
            },
            {
                element: "#goHistorialTutorTUTORIAL",
                popover: {
                    title: "--------------",
                    description: "------- --------- ---------",
                }
            },
            {
                element: "#goNotificationsTUTORIAL",
                popover: {
                    title: "--------------",
                    description: "------- --------- ---------",
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

     const btn = document.querySelector("#godashboardTUTORIAL");

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