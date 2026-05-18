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
                popover: {
                    title: "Dashboard - Pantalla Inicial",
                    description: "Aqui podras ver y gestionar de manera rapida y facil tus tutorias.",
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
                    description: "Miremos que contiene. Haz click",
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
                    description: "Aquí podras consultar informacion relacionada con tu perfil, preferencias, actualizacion de contraseña, etc.",
                    showButtons: ["next"]
                }
            },
            {
                element: "#goIntoProfileTutorTUTORIAL",
                popover: {
                    description: "Miremos mas detalladamente esta seccion. Haz click",
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
                    description: "Mira tu perfil y ten la posibilidad de cambiar tu numero de telefono y contraseña.",
                    showButtons: ["next"]
                }
            },
            {
                element: "#disponibilidadTutorTUTORIAL",
                popover: {
                    title: "Actualiza tus horarios",
                    description: "Aqui puedes modificar tus franjas de disponibilidad semanales",
                }
            },
            {
                element: "#horasDispTutorTUTORIAL",
                popover: {
                    title: "Ponle un limite a tu carga semanal",
                    description: "Actualiza tus horas maximas de tutorias semanales",
                }
            },
            {
                element: "#activarCuentaTutorTUTORIAL",
                popover: {
                    title: "Estado de tu cuenta",
                    description: "Podras activar y desactivar tu cuenta. En caso de desactivarla comunicalo!",
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
                    description: "Dale click",
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