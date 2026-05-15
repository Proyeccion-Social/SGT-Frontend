import { createTour } from "../../createTour";
import "../../styles/dashStyles.css"

export function startAgendamientoTutorial() {

    const tour = createTour({



        steps: [

            {
                element: "#calendarStudentTUTORIAL",

                popover: {
                    title: "Calendario Semanal",
                    description:
                        "Mira todos los horarios disponibles para agendar una tutoria. \n Solo selecciona el espacio y elije la materia!"
                }
            },
            {
                element: "#weekfilterStudentTUTORIAL",

                popover: {
                    title: "Planea y Filtra",
                    description:
                        "Avanza a la siguiente semana y agenda tu tutoria con anticipacion, y filtra por la materia que quieras!"
                }
            },

            {
                element: "#goSearchStudentTUTORIAL",

                popover: {
                    title: "Zona de busqueda",
                    description: "Quieres buscar y filtrar tutorias mas facil? Este es el lugar. Dale click",
                    showButtons: []
                },
                disableActiveInteraction: false

            }

        ]

    });

    /*
    Detectar click del boton
  */

    const btn = document.querySelector(
        "#goSearchStudentTUTORIAL"
    );

    if (btn) {
        btn.addEventListener("click", () => {

            /*
              Guardar progreso
            */

            localStorage.setItem(
                "current-tour",
                "search"
            );

            /*
              Ir a otra pagina
            */

            window.location.href =
                "/search";
        });
    }


    tour.drive();
}