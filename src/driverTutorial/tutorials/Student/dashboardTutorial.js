import { createTour, getInteractiveElement } from "../../createTour";
import "../../styles/dashStyles.css";

export function startDashboardStudentTutorial() {
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
                    description: "Aquí podrás ver y gestionar de manera rápida y fácil tus sesiones.",
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
        ]
    });

    const btn = getInteractiveElement("#goAgendamientoTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            localStorage.setItem("current-tour", "agendamiento");
            window.location.href = "/sessions";
        });
    }

    tour.drive();
}