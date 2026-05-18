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
  useEffect(() => {
    const path = window.location.pathname;
    if(user?.role === 'STUDENT'){
      if (path === "/dashboard") {
        const currentTour = localStorage.getItem("current-tour");
        if (currentTour === "final") {
          const timer = setTimeout(() => {
            startFinalTutorial();
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
            startFinalTutorial();
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
        setTimeout(() => startDashboardStudentTutorial(), 500);
      }
    }
    else if(user?.role === 'TUTOR'){
      const currentTour = localStorage.getItem("current-tour");
      if (window.location.pathname === "/dashboard" && currentTour !== "final") {
        setTimeout(() => startDashboardTutorTutorial(), 500);
      }
    }
    };
    window.addEventListener("tutorial:start", handler);
    return () => window.removeEventListener("tutorial:start", handler);
  }, [user?.role]);

  return null;
}
