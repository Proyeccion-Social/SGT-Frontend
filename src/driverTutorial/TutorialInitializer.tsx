import { useEffect } from "react";
import { useAuthStore } from '@/store/authStore';
import { startDashboardStudentTutorial } from "./tutorials/Student/dashboardTutorial";
import { startAgendamientoStudentTutorial } from "./tutorials/Student/agendamientoTutorial";
import { startSearchStudentTutorial } from "./tutorials/Student/searchTutorial";
import { startFinalTutorial } from "./tutorials/finalTutorial";
import { startDashboardTutorTutorial } from "./tutorials/Tutor/dashboardTutorial"
import { startDisponibilidadTutorTutorial } from "./tutorials/Tutor/disponibilidadTutorial";

export default function TutorialInitializer() {
  const { user } = useAuthStore();

  const getTutorialKeys = () => {
    if (!user?.id || !user?.role) return null;

    return {
      seenKey: `page-tutorial-seen:${user.id}:${user.role}`,
      flowKey: `profile-completion-flow:${user.id}:${user.role}`,
    };
  };

  const canStartPageTutorial = () => {
    const keys = getTutorialKeys();
    if (!keys) return false;

    const { seenKey, flowKey } = keys;
    return localStorage.getItem(seenKey) !== '1' && localStorage.getItem(flowKey) === '1';
  };

  const markPageTutorialSeen = () => {
    const keys = getTutorialKeys();
    if (!keys) return;

    const { seenKey, flowKey } = keys;
    localStorage.setItem(seenKey, '1');
    localStorage.removeItem(flowKey);
  };

  const startPageTutorial = (startTutorial: () => void) => {
    if (!canStartPageTutorial()) return;

    markPageTutorialSeen();
    setTimeout(() => {
      startTutorial();
    }, 500);
  };

  useEffect(() => {
    const path = window.location.pathname;
    if(user?.role === 'STUDENT'){
      if (path === "/dashboard") {
        const currentTour = localStorage.getItem("current-tour");
        if (currentTour === "final") {
          const timer = setTimeout(() => {
            if (canStartPageTutorial()) {
              markPageTutorialSeen();
              startFinalTutorial();
            }
          }, 500);
          return () => clearTimeout(timer);
        }
      }

      if (path === "/sessions") {
        const currentTour = localStorage.getItem("current-tour");
        if (currentTour === "agendamiento") {
          const timer = setTimeout(() => {
            startAgendamientoStudentTutorial();
          }, 500);
          return () => clearTimeout(timer);
        }
      }

      if (path === "/search") {
        const currentTour = localStorage.getItem("current-tour");
        if (currentTour === "search") {
          const timer = setTimeout(() => {
            startSearchStudentTutorial();
          }, 500);
          return () => clearTimeout(timer);
        }
      }
    }
    else if(user?.role === 'TUTOR'){
      if (path === "/dashboard") {
        const currentTour = localStorage.getItem("current-tour");
        if (currentTour === "final") {
          const timer = setTimeout(() => {
            if (canStartPageTutorial()) {
              markPageTutorialSeen();
              startFinalTutorial();
            }
          }, 500);
          return () => clearTimeout(timer);
        }
      }
      if(path === "/availability/tutor/slots"){
        const currentTour = localStorage.getItem("current-tour");
        if (currentTour === "disponibilidad") {
          const timer = setTimeout(() => {
            startDisponibilidadTutorTutorial();
          }, 500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user?.role]);

  useEffect(() => {
    const handler = () => {
      if(user?.role === 'STUDENT'){
      const currentTour = localStorage.getItem("current-tour");
      if (window.location.pathname === "/dashboard" && currentTour !== "final") {
        startPageTutorial(startDashboardStudentTutorial);
      }
    }
    else if(user?.role === 'TUTOR'){
      const currentTour = localStorage.getItem("current-tour");
      if (window.location.pathname === "/dashboard" && currentTour !== "final") {
        startPageTutorial(startDashboardTutorTutorial);
      }
    }
    };
    window.addEventListener("tutorial:start", handler);
    return () => window.removeEventListener("tutorial:start", handler);
  }, [user?.role]);

  return null;
}
