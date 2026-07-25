import { createTour, getInteractiveElement } from "../../createTour";
import {
  startTour,
  setTourStep,
  completeTour,
  getResumeStep,
} from "../../tutorialState";
import "../../styles/dashStyles.css";

const TOUR_ID = "dashboard-student";
const TOUR_VERSION = "1.0.0";
const TOTAL_STEPS = 6;

export function startDashboardStudentTutorial() {
    const userRole = "STUDENT";
    const canStart = startTour(TOUR_ID, TOUR_VERSION, TOTAL_STEPS, userRole);
    if (!canStart) return;
    const resumeFrom = getResumeStep(TOUR_ID, TOUR_VERSION);

    const tour = createTour({
        tourId: TOUR_ID,
        steps: [
            {
                popover: {
                    title: "Bienvenido a Atlas",
                    description: "Tu plataforma inteligente de gestión de tutorías. Vamos a darte un recorrido rápido.",
                    popoverClass: "welcome-popover",
                    showButtons: ["next"]
                }
            },
            {
                element: "#dashboardMainTUTORIAL",
                onHighlightStarted: () => {
                    const path = document.querySelector('.driver-overlay path');
                    if (path) path.style.opacity = '0';
                },
                onDeselected: () => {
                    const path = document.querySelector('.driver-overlay path');
                    if (path) path.style.opacity = '0.5';
                },
                popover: {
                    title: "Dashboard - Pantalla Inicial",
                    description: "Aquí podrás ver y gestionar de manera rápida y fácil tus sesiones.",
                    popoverClass: "corner-popover"
                }
            },
            {
                element: "#DashboardManagerTUTORIAL",
                popover: {
                    title: "Tus Próximas Sesiones",
                    description: "Aquí aparecerán tus tutorías programadas. Podrás ver el estado de cada una y realizar gestiones rápidas.",
                }
            },
            {
                element: "#profileIconTUTORIAL",
                popover: {
                    title: "Tu perfil",
                    description: "Aquí podrás consultar información relacionada con tu perfil y preferencias.",
                }
            },
            {
                element: "#sidebarTUTORIAL",
                popover: {
                    title: "Navegación Principal",
                    description: "Desde aquí puedes acceder rápidamente a todas las secciones de la plataforma: Dashboard, Sesiones, Búsqueda e Historial.",
                }
            },
            {
                element: "#goAgendamientoTUTORIAL",
                popover: {
                    title: "Calendario de Agendamiento",
                    description: "¡Ahora vamos a lo más importante! Haz clic en el icono del calendario.",
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

    const btn = getInteractiveElement("#goAgendamientoTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            startTour("agendamiento-student", "1.0.0", 3, userRole);
            window.location.href = "/sessions";
        });
    }

    if (resumeFrom > 0) {
        tour.drive(resumeFrom);
    } else {
        tour.drive();
    }
}
