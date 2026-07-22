import { createTour, getInteractiveElement } from "../../createTour";

export function startDisponibilidadTutorTutorial(){
    const tour = createTour({
        onDestroyStarted: () => {
            if (localStorage.getItem("current-tour") === "disponibilidad") {
                localStorage.removeItem("current-tour");
            }
            tour.destroy();
        },
        steps: [
            {
                element: "#calendarTutorTUTORIAL",
                popover: {
                    title: "Tus franjas como tutor",
                    description:"Aquí podrás ver tu calendario semanal de franjas disponibles/libres.",
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
                    description:  "Aquí podrás ver todas tus sesiones. Luego podrás verlas con más detalle.",
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
        ]
    }
    );

     const btn = getInteractiveElement("#godashboardTUTORIAL");

     if (btn) {
         btn.addEventListener("click", () => {
            localStorage.setItem("current-tour", "final");
            window.location.href = "/dashboard";
        });
    }

    tour.drive();
}