import { useEffect } from "react";
import { startDashboardTutorial } from "./tutorials/dashboardTutorial";
import { startAgendamientoTutorial } from "./tutorials/agendamientoTutorial";
import { startSearchTutorial } from "./tutorials/searchTutorial";
import { startFinalTutorial } from "./tutorials/finalTutorial";

export default function TutorialInitializer() {
  useEffect(() => {
    const path = window.location.pathname;

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
          startAgendamientoTutorial();
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    if (path === "/search") {
      const currentTour = localStorage.getItem("current-tour");
      if (currentTour === "search") {
        const timer = setTimeout(() => {
          startSearchTutorial();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const currentTour = localStorage.getItem("current-tour");
      if (window.location.pathname === "/dashboard" && currentTour !== "final") {
        setTimeout(() => startDashboardTutorial(), 500);
      }
    };
    window.addEventListener("tutorial:start", handler);
    return () => window.removeEventListener("tutorial:start", handler);
  }, []);

  return null;
}
