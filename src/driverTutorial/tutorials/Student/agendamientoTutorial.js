import { createTour, getInteractiveElement } from "../../createTour";
import "../../styles/dashStyles.css"

export function startAgendamientoStudentTutorial() {
    const tour = createTour({
        steps: [
            {
                element: "#calendarStudentTUTORIAL",
                popover: {
                    title: "Calendario Semanal",
                    description: "Mira todos los horarios disponibles para agendar una tutoría. Solo selecciona el espacio y elige la materia.",
                    popoverClass: "corner-popover"
                }
            },
            {
                element: "#weekfilterStudentTUTORIAL",
                popover: {
                    title: "Planea y Filtra",
                    description: "Avanza a la siguiente semana y agenda tu tutoría con anticipación, y filtra por la materia que quieras.",
                    popoverClass: "bottom-popover"
                }
            },
            {
                element: "#goSearchStudentTUTORIAL",
                popover: {
                    title: "Zona de búsqueda",
                    description: "¿Quieres buscar y filtrar tutorías más fácil? Este es el lugar. Dale clic.",
                    showButtons: []
                },
                disableActiveInteraction: false
            }
        ]
    });

    const btn = getInteractiveElement("#goSearchStudentTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            localStorage.setItem("current-tour", "search");
            window.location.href = "/search";
        });
    }

    tour.drive();
}