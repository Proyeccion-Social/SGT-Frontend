import { createTour, getInteractiveElement } from "../../createTour";
import {
  startTour,
  setTourStep,
  completeTour,
  getResumeStep,
} from "../../tutorialState";
import "../../styles/dashStyles.css";

const TOUR_ID = "agendamiento-student";
const TOUR_VERSION = "1.0.0";
const TOTAL_STEPS = 3;
const USER_ROLE = "STUDENT";

export function startAgendamientoStudentTutorial() {
    const canStart = startTour(TOUR_ID, TOUR_VERSION, TOTAL_STEPS, USER_ROLE);
    if (!canStart) return;
    const resumeFrom = getResumeStep(TOUR_ID, TOUR_VERSION);

    const tour = createTour({
        tourId: TOUR_ID,
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
        ],
        onNextClick: (_el, _step, { driver }) => {
            setTourStep(TOUR_ID, driver.getActiveIndex() + 1);
            driver.moveNext();
        },
        onPrevClick: (_el, _step, { driver }) => {
            setTourStep(TOUR_ID, driver.getActiveIndex() - 1);
            driver.movePrevious();
        },
        onDestroyStarted: (_el, _step, { driver }) => {
            if (driver.isLastStep() || !driver.hasNextStep()) {
                completeTour(TOUR_ID);
            }
            tour.destroy();
        },
    });

    const btn = getInteractiveElement("#goSearchStudentTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            startTour("search-student", "1.0.0", 5, USER_ROLE);
            window.location.href = "/search";
        });
    }

    if (resumeFrom > 0) {
        tour.drive(resumeFrom);
    } else {
        tour.drive();
    }
}
