import { createTour } from "../createTour";

export function startFinalTutorial() {

    const tour = createTour({

        

        steps: [

            {
                popover: {
                    title: "Disfruta tu experiencia en Atlas",
                    description: "Este ha sido todo el tutorial.",
                    popoverClass: "final-popover",
                    showButtons: ["next"],
                },
                showProgress: false,
                
                
            },

            {
                // Paso tipo Modal (sin elemento)
                popover: {
                    title: "",
                    description: `<img src="/favicon.svg" style="width: 200px; margin: auto; display: block;" />`,
                    popoverClass: "celebration-popover",
                    showButtons: [], // Ocultamos botones
                },
                onHighlighted: (e) => {
                    // Auto-cerrar el tutorial después de 3.5 segundos
                    setTimeout(() => {
                        tour.destroy();
                        localStorage.removeItem(
                "current-tour");
                    }, 1600);
                }
            }


        ]

    });


  

    


    tour.drive();
}