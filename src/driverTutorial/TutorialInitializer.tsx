import { useEffect } from "react";
import { useAuthStore } from '@/store/authStore';
import { startDashboardStudentTutorial } from "./tutorials/Student/dashboardTutorial";
import { startAgendamientoStudentTutorial } from "./tutorials/Student/agendamientoTutorial";
import { startSearchStudentTutorial } from "./tutorials/Student/searchTutorial";
import { startFinalTutorial } from "./tutorials/finalTutorial";
import { startDashboardTutorTutorial } from "./tutorials/Tutor/dashboardTutorial"
import { startDisponibilidadTutorTutorial } from "./tutorials/Tutor/disponibilidadTutorial";
import {
  getTourStatus,
  TUTORIAL_STATUS,
} from "./tutorialState";

/** Tabla path → { tourId, startFn } para retomar tours al cambiar de pagina.
 *  Todos requieren un estado ACTIVE previo: solo se reanudan si fueron
 *  explicitamente iniciados por el flujo del tutorial (no auto-inician en dispositivos nuevos). */
const PATH_TOUR_MAP = {
  STUDENT: {
    "/dashboard": { tourId: "final", start: startFinalTutorial },
    "/sessions": { tourId: "agendamiento-student", start: startAgendamientoStudentTutorial },
    "/search": { tourId: "search-student", start: startSearchStudentTutorial },
  },
  TUTOR: {
    "/dashboard": { tourId: "final", start: startFinalTutorial },
    "/availability/tutor/slots": {
      tourId: "disponibilidad-tutor",
      start: startDisponibilidadTutorTutorial,
    },
  },
};

/** Inicia un tour solo si ya tiene estado ACTIVE en localStorage.
 *  Esto asegura que los tours no se auto-inicien en dispositivos nuevos. */
function maybeStartTour(tourId, startFn) {
  const status = getTourStatus(tourId);
  if (!status || status.status !== TUTORIAL_STATUS.ACTIVE) {
    return false;
  }
  setTimeout(() => startFn(), 500);
  return true;
}

export default function TutorialInitializer() {
  const { user, requiresProfileCompletion } = useAuthStore();

  const getTutorialKeys = () => {
    if (!user?.id || !user?.role) return null;

    return {
      flowKey: `profile-completion-flow:${user.id}:${user.role}`,
    };
  };

  const canStartPageTutorial = () => {
    const keys = getTutorialKeys();
    if (!keys) return false;

    return localStorage.getItem(keys.flowKey) === '1';
  };

  const clearCompletionFlow = () => {
    const keys = getTutorialKeys();
    if (!keys) return;

    localStorage.removeItem(keys.flowKey);
  };

  const startPageTutorial = (startTutorial: () => void) => {
    if (!canStartPageTutorial()) return;

    clearCompletionFlow();
    setTimeout(() => {
      startTutorial();
    }, 500);
  };


  // Reanudar el tour correspondiente segun el path actual.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // No iniciar tours si el usuario aun esta completando su perfil.
    if (requiresProfileCompletion) return;
    const path = window.location.pathname;
    const role = user?.role === "TUTOR" ? "TUTOR" : user?.role === "STUDENT" ? "STUDENT" : null;
    if (!role) return;

    const mapping = PATH_TOUR_MAP[role]?.[path];
    if (!mapping) return;

    const { tourId, start } = mapping;

    // Caso especial: el tour de disponibilidad necesita esperar al calendario.
    if (tourId === "disponibilidad-tutor") {
      const status = getTourStatus(tourId);
      if (!status || status.status !== TUTORIAL_STATUS.ACTIVE) {
        return;
      }
      const checkExist = setInterval(() => {
        if (document.querySelector('#calendarTutorTUTORIAL')) {
          clearInterval(checkExist);
          start();
        }
      }, 200);
      return () => clearInterval(checkExist);
    }

    maybeStartTour(tourId, start);
  }, [user?.role, requiresProfileCompletion]);

  // Escuchar el evento explicito tutorial:start (disparado por el drawer al completar perfil).
  useEffect(() => {
    const handler = () => {
      // Leer el state actual del store (no de la closure) para evitar stale values.
      const currentState = useAuthStore.getState();
      const role = currentState.user?.role === "TUTOR" ? "TUTOR" : currentState.user?.role === "STUDENT" ? "STUDENT" : null;
      if (!role) return;
      if (window.location.pathname !== "/dashboard") return;
      // Solo iniciar el tour de dashboard si no esta descartado/completado.
      const tourId = role === "TUTOR" ? "dashboard-tutor" : "dashboard-student";
      const status = getTourStatus(tourId);
      if (status && (status.status === TUTORIAL_STATUS.DISCARDED || status.status === TUTORIAL_STATUS.COMPLETED)) {
        return;
      }
      setTimeout(() => {
        if (role === "TUTOR") startDashboardTutorTutorial();
        else startDashboardStudentTutorial();
      }, 500);
    };
    window.addEventListener("tutorial:start", handler);
    return () => window.removeEventListener("tutorial:start", handler);
  }, []);

  return null;
}
