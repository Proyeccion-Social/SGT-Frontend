import { createTour, getInteractiveElement } from "../../createTour";
import {
  startTour,
  setTourStep,
  completeTour,
  getResumeStep,
} from "../../tutorialState";
import "../../styles/dashStyles.css";

const TOUR_ID = "dashboard-tutor";
const TOUR_VERSION = "1.0.0";
const TOTAL_STEPS = 12;
const USER_ROLE = "TUTOR";

export function startDashboardTutorTutorial() {
    const canStart = startTour(TOUR_ID, TOUR_VERSION, TOTAL_STEPS, USER_ROLE);
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
                    description: "Aquí podrás ver y gestionar de manera rápida y fácil tus tutorías.",
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
                    description: "Miremos qué contiene. Haz clic.",
                    showButtons: []
                },
                disableActiveInteraction: false,
                onHighlighted: (_element, _step, { driver }) => {
                    const btn = document.querySelector("#profileIconTUTORIAL");
                    if (!btn) return;
                    const handleClick = () => {
                        setTimeout(() => {
                            driver.moveNext();
                        }, 300);
                        btn.removeEventListener("click", handleClick);
                    };
                    btn.addEventListener("click", handleClick);
                }
            },
            {
                element: "#sectionsProfileTutorTUTORIAL",
                popover: {
                    title: "Configura y Actualiza",
                    description: "Aquí podrás consultar información relacionada con tu perfil, preferencias, actualización de contraseña, etc.",
                    showButtons: ["next"]
                }
            },
            {
                element: "#goIntoProfileTutorTUTORIAL",
                popover: {
                    description: "Miremos más detalladamente esta sección. Haz clic.",
                    showButtons: []
                },
                disableActiveInteraction: false,
                onHighlighted: (_element, _step, { driver }) => {
                    const btn = document.querySelector("#goIntoProfileTutorTUTORIAL");
                    if (!btn) return;
                    const handleClick = () => {
                        setTimeout(() => {
                            driver.moveNext();
                        }, 300);
                        btn.removeEventListener("click", handleClick);
                    };
                    btn.addEventListener("click", handleClick);
                }
            },
            {
                element: "#profileViewTutorTUTORIAL",
                popover: {
                    description: "Mira tu perfil y ten la posibilidad de cambiar tu número de teléfono y contraseña.",
                    showButtons: ["next"]
                }
            },
            {
                element: "#horasDispTutorTUTORIAL",
                popover: {
                    title: "Ponle un límite a tu carga semanal",
                    description: "Actualiza tus horas máximas de tutorías semanales.",
                }
            },
            {
                element: "#activarCuentaTutorTUTORIAL",
                popover: {
                    title: "Estado de tu cuenta",
                    description: "Podrás activar y desactivar tu cuenta. En caso de desactivarla, ¡comúnicalo!",
                    onNextClick: (_element, _step, { driver }) => {
                        document.querySelector('.ps-close-btn')?.click();
                        setTourStep(TOUR_ID, driver.getActiveIndex() + 1);
                        setTimeout(() => driver.moveNext(), 600);
                    }
                }
            },
            {
                element: "#sidebarTUTORIAL",
                popover: {
                    title: "Navegación Principal",
                    description: "Desde aquí puedes acceder rápidamente a todas las secciones de la plataforma: Dashboard, Sesiones, Búsqueda e Historial.",
                    showButtons: ["next"]
                }
            },
            {
                element: "#goDisponibilidadTutorTUTORIAL",
                popover: {
                    title: "Tu Calendario de disponibilidad",
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

    const btn = getInteractiveElement("#goDisponibilidadTutorTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            startTour("disponibilidad-tutor", "1.0.0", 5, USER_ROLE);
            window.location.href = "/availability/tutor/slots";
        });
    }

    if (resumeFrom > 0) {
        tour.drive(resumeFrom);
    } else {
        tour.drive();
    }
}
