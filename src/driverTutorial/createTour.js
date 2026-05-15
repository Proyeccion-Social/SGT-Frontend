import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./styles/dashStyles.css";


export function createTour(config) {

  return driver({

    animate: true,
    smoothScroll: true,
    allowClose: false,
    overlayClickAction: 'none',
    disableActiveInteraction: true,
    overlayColor: "#503199ad",
    overlayOpacity: 0.85,
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Terminar',
    
    ...config

  });
}