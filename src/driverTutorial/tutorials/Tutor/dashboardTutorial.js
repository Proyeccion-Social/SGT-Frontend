import { createTour, getInteractiveElement } from "../../createTour";
import "../../styles/dashStyles.css";

export function startDashboardTutorTutorial() {
    const tour = createTour({
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
                onHighlighted: (element, step, { driver }) => {

                        const btn = document.querySelector("#profileIconTUTORIAL");

                        if (!btn) return;

                        const handleClick = () => {

                            // Esperar que el modal aparezca
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
                onHighlighted: (element, step, { driver }) => {

                        const btn = document.querySelector("#goIntoProfileTutorTUTORIAL");

                        if (!btn) return;

                        const handleClick = () => {

                            // Esperar que el modal aparezca
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
                element: "#disponibilidadTutorTUTORIAL",
                popover: {
                    title: "Actualiza tus horarios",
                    description: "Aquí puedes modificar tus franjas de disponibilidad semanales.",
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
                    onNextClick: (element, step, { driver }) => {
                        document.querySelector('.ps-close-btn')?.click();
                        setTimeout(() => driver.moveNext(), 600); // 600ms para permitir que la animación de cierre termine y el dock se muestre
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
        ]   
    });

    const btn = getInteractiveElement("#goDisponibilidadTutorTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            localStorage.setItem("current-tour", "disponibilidad");
            window.location.href = "/availability/tutor/slots";
        });
    }

    tour.drive();
}