import { createTour } from "../createTour";
import {
  startTour,
  completeTour,
  getResumeStep,
} from "../tutorialState";
import { useAuthStore } from '@/store/authStore';

const TOUR_ID = "final";
const TOUR_VERSION = "1.0.0";
const TOTAL_STEPS = 2;

export function startFinalTutorial() {
    // Obtener el rol actual para persistir correctamente en el state.
    const userRole = useAuthStore.getState()?.user?.role ?? null;
    const canStart = startTour(TOUR_ID, TOUR_VERSION, TOTAL_STEPS, userRole);
    if (!canStart) return;
    const resumeFrom = getResumeStep(TOUR_ID, TOUR_VERSION);

    const tour = createTour({
        tourId: TOUR_ID,
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
                popover: {
                    title: "",
                    description: `<img src="/favicon.svg" style="width: 200px; margin: auto; display: block;" />`,
                    popoverClass: "celebration-popover",
                    showButtons: [],
                },
                onHighlighted: () => {
                    // Auto-cerrar el tutorial despues de unos segundos
                    setTimeout(() => {
                        completeTour(TOUR_ID);
                        tour.destroy();
                    }, 1600);
                }
            }
        ],
    });

    if (resumeFrom > 0) {
        tour.drive(resumeFrom);
    } else {
        tour.drive();
    }
}
