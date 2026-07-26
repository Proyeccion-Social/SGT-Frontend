import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./styles/dashStyles.css";
import { discardAllTours } from "./tutorialState";

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

/** Inyecta el boton flotante "Saltar tutorial" y devuelve una funcion de limpieza. */
function injectSkipButton(tourInstance) {
  const btn = document.createElement("button");
  btn.id = "atlas-skip-tutorial-btn";
  btn.textContent = "Saltar tutorial";
  btn.className = "atlas-skip-tutorial";
  btn.addEventListener("click", () => {
    discardAllTours();
    tourInstance.destroy();
  });
  document.body.appendChild(btn);
  return () => {
    btn.remove();
  };
}

/**
 * Crea un tour de driver.js con los defaults del proyecto.
 *
 * Comportamiento (issue #251):
 * - allowClose: false       → no hay X para cerrar.
 * - overlayClickAction: 'none' → click en el overlay no cierra.
 * - disableActiveInteraction: true → el usuario no puede interactuar con el
 *   elemento resaltado salvo que un step lo habilite explicitamente.
 * - Se inyecta un boton flotante "Saltar tutorial" en la esquina que descarta
 *   el tour y lo destruye.
 */
export function createTour(config = {}) {
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

  // Guardar referencia al cleanup del skip button.
  let removeSkipBtn = null;

  // Si el caller declaro onDestroyStarted, lo envolvemos.
  // Tambien usamos este hook para limpiar el skip button.
  const callerOnDestroyStarted = config.onDestroyStarted;
  const wrappedOnDestroyStarted = (element, step, driverObj) => {
    if (typeof callerOnDestroyStarted === "function") {
      callerOnDestroyStarted(element, step, driverObj);
    }
    // Limpiar el boton de skip al destruir el tour.
    if (removeSkipBtn) {
      removeSkipBtn();
      removeSkipBtn = null;
    }
  };

  const tour = driver({
    animate: true,
    smoothScroll: true,
    allowClose: false,
    overlayClickAction: 'none',
    disableActiveInteraction: true,
    overlayColor: "#000000",
    overlayOpacity: 0.5,
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Terminar',
    popoverOffset: 10,
    stagePadding: 5,

    ...config,
    // Forzar estos valores sin importar lo que pase el caller:
    allowClose: false,
    overlayClickAction: 'none',
    onDestroyStarted: wrappedOnDestroyStarted,
  });

  // Monkey-patch tour.drive para inyectar el skip button al iniciar.
  const originalDrive = tour.drive.bind(tour);
  tour.drive = (stepIndex) => {
    // Inyectar el boton de skip si no existe ya.
    if (!removeSkipBtn) {
      removeSkipBtn = injectSkipButton(tour);
    }
    return originalDrive(stepIndex);
  };

  // Monkey-patch tour.destroy para limpiar el skip button.
  const originalDestroy = tour.destroy.bind(tour);
  tour.destroy = () => {
    if (removeSkipBtn) {
      removeSkipBtn();
      removeSkipBtn = null;
    }
    return originalDestroy();
  };

  return tour;
}
