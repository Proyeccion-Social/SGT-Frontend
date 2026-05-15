import { createTour } from "../../createTour";
import "../../styles/dashStyles.css";

export function startDashboardTutorial() {
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
                popover: {
                    title: "Dashboard - Pantalla Inicial",
                    description: "Aqui podras ver y gestionar de manera rapida y facil tus sesiones.",
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
                    description: "Aquí podras consultar informacion relacionada con tu perfil y preferencias.",
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
                    description: "¡Ahora vamos a lo más importante! Haz clic en el icono del calendario ",
                    showButtons: []
                },
                disableActiveInteraction: false
            }
        ]
    });

    const btn = document.querySelector("#goAgendamientoTUTORIAL");
    if (btn) {
        btn.addEventListener("click", () => {
            localStorage.setItem("current-tour", "agendamiento");
            window.location.href = "/sessions";
        });
    }

    tour.drive();
}