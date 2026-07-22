import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./styles/dashStyles.css";

// Mapeo centralizado de selectores de escritorio a sus equivalentes en móvil
const MOBILE_MAPPING = {
  "#sidebarTUTORIAL": "#mobile-dock",
  "#goAgendamientoTUTORIAL": "#goAgendamientoMobileTUTORIAL",
  "#goDisponibilidadTutorTUTORIAL": "#goDisponibilidadTutorMobileTUTORIAL",
  "#goHistorialStudentTUTORIAL": "#goHistorialStudentMobileTUTORIAL",
  "#goHistorialTutorTUTORIAL": "#goHistorialTutorMobileTUTORIAL",
  "#goSearchStudentTUTORIAL": "#goSearchStudentMobileTUTORIAL",
  "#goNotificationsTUTORIAL": "#goNotificationsMobileTUTORIAL",
  "#godashboardTUTORIAL": "#goDashboardMobileTUTORIAL"
};

export function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
}

// Obtiene el elemento correcto (móvil o desktop) según el viewport actual
export function getInteractiveElement(selector) {
  if (isMobileViewport() && MOBILE_MAPPING[selector]) {
    return document.querySelector(MOBILE_MAPPING[selector]);
  }
  return document.querySelector(selector);
}

export function createTour(config) {
  // Traducir selectores de los pasos de forma transparente si estamos en móvil
  if (config.steps) {
    const isMobile = isMobileViewport();
    config.steps = config.steps.map(step => {
      if (isMobile && typeof step.element === 'string' && MOBILE_MAPPING[step.element]) {
        return {
          ...step,
          element: MOBILE_MAPPING[step.element]
        };
      }
      return step;
    });
  }

  return driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    showCloseButton: true,
    overlayClickAction: 'none',
    disableActiveInteraction: false,
    overlayColor: "#000000",
    overlayOpacity: 0.5,
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Terminar',
    popoverOffset: 24, // Genera un espacio consistente de 24px entre el popover y el elemento para dar holgura con los márgenes de pantalla
    
    ...config
  });
}