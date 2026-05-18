import { createTour, getInteractiveElement } from "../../createTour";
import "../../styles/dashStyles.css";

export function startSearchStudentTutorial() {

    const tour = createTour({



        steps: [
            {
                element: "#searchStudentTUTORIAL",
                popover: {
                    title: "Busca Mejor, busca en Atlas",
                    description: "Busca por lo que prefieras: materias, modalidad, disponibilidad, tutor, etc.",
                }
            },
            {
                element: "#searchinfoStudentTUTORIAL",
                popover: {
                    title: "El mejor para ti <3",
                    description:
                        "Mira los tutores que mas se adecuan con los filtros que seleccionaste",

                }
            },
            {
                element: "#goHistorialStudentTUTORIAL",

                popover: {
                    title: "Tu historial",
                    description: "En este apartado podras ver todas tus sesiones (futuras, actuales, pasadas, etc). Despues podras verlo con mas detalle",
                },

            },
            {
                element: "#goNotificationsTUTORIAL",

                popover: {
                    title: "Tus notificaciones",
                    description: "Mantente al dia con tus sesiones! Luego veras lo util que es.",
                },

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

    });

    /*
    Detectar click del boton
  */

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