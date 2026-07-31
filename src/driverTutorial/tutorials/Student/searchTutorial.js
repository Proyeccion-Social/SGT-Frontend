import { createTour, getInteractiveElement } from "../../createTour";
import {
  startTour,
  setTourStep,
  completeTour,
  getResumeStep,
} from "../../tutorialState";
import "../../styles/dashStyles.css";

const TOUR_ID = "search-student";
const TOUR_VERSION = "1.0.0";
const TOTAL_STEPS = 5;
const USER_ROLE = "STUDENT";

export function startSearchStudentTutorial() {
    const canStart = startTour(TOUR_ID, TOUR_VERSION, TOTAL_STEPS, USER_ROLE);
    if (!canStart) return;
    const resumeFrom = getResumeStep(TOUR_ID, TOUR_VERSION);

    const tour = createTour({
        tourId: TOUR_ID,
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

    const btn = getInteractiveElement("#godashboardTUTORIAL");

    if (btn) {
        btn.addEventListener("click", () => {
            startTour("final", "1.0.0", 2, USER_ROLE);
            window.location.href = "/dashboard";
        });
    }

    if (resumeFrom > 0) {
        tour.drive(resumeFrom);
    } else {
        tour.drive();
    }
}
