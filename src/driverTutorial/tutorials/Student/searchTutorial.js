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
                        "Mira los tutores que más se adecuan con los filtros que seleccionaste.",

                }
            },
            {
                element: "#goHistorialStudentTUTORIAL",

                popover: {
                    title: "Tu historial",
                    description: "En este apartado podrás ver todas tus sesiones (futuras, actuales, pasadas, etc.). Después podrás verlo con más detalle.",
                },

            },
            {
                element: "#goNotificationsTUTORIAL",

                popover: {
                    title: "Tus notificaciones",
                    description: "¡Mantente al día con tus sesiones! Luego verás lo útil que es.",
                },

            },
            {
                element: "#godashboardTUTORIAL",

                popover: {
                    title: "Volvamos a la sección principal",
                    description: "Dale clic.",
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