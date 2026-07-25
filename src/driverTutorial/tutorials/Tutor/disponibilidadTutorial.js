import { createTour, getInteractiveElement } from "../../createTour";
import {
  startTour,
  setTourStep,
  completeTour,
  getResumeStep,
} from "../../tutorialState";

const TOUR_ID = "disponibilidad-tutor";
const TOUR_VERSION = "1.0.0";
const TOTAL_STEPS = 5;
const USER_ROLE = "TUTOR";

export function startDisponibilidadTutorTutorial() {
    const canStart = startTour(TOUR_ID, TOUR_VERSION, TOTAL_STEPS, USER_ROLE);
    if (!canStart) return;
    const resumeFrom = getResumeStep(TOUR_ID, TOUR_VERSION);

    const tour = createTour({
        tourId: TOUR_ID,
        steps: [
            {
                element: "#calendarTutorTUTORIAL",
                popover: {
                    title: "Tus franjas como tutor",
                    description: "Aquí podrás ver tu calendario semanal de franjas disponibles/libres.",
                    popoverClass: "corner-popover"
                }
            },
            {
                element: "#weekMonthTutorTUTORIAL",
                popover: {
                    title: "Organizado y Eficaz",
                    description: "Puedes ver tus franjas tanto por semana como por mes.",
                }
            },
            {
                element: "#goHistorialTutorTUTORIAL",
                popover: {
                    title: "Tu historial",
                    description: "Aquí podrás ver todas tus sesiones. Luego podrás verlas con más detalle.",
                }
            },
            {
                element: "#goNotificationsTUTORIAL",
                popover: {
                    title: "Al día con un clic",
                    description: "Revisa tus notificaciones de modificación, propuesta, cancelación, etc.",
                }
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
