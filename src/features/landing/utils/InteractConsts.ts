import InteractDispo from "../assets/imgs/Interact4.png";
import InteractColab from "../assets/imgs/Interact3.png";
import InteractCalif from "../assets/imgs/Interact2.png";
import InteractModal from "../assets/imgs/Interact1.png";

import IconDispo from "../assets/icons/Settings.svg";
import IconColab from "../assets/icons/Layout.svg";
import IconCalif from "../assets/icons/Binocular.svg";
import IconModal from "../assets/icons/Brujula.svg";

export const INTERACT_CONSTS = {
    Modalidades: {
        title: "Aprende donde prefieras",
        description: "Sesiones presenciales en la u o virtuales desde cualquier lugar",
        imgSrcBg: InteractModal,
        iconSrc: IconModal,
    },
    Calificaciones: {
        title: "La comunidad respalda",
        description: "Calificaciones verificadas de estudiantes que ya trabajaron con cada tutor",
        imgSrcBg: InteractCalif,
        iconSrc: IconCalif,
    },
    Colaboracion: {
        title: "Aprendizaje colaborativo",
        description: "Participa en sesiones grupales y resuelve dudas junto a más estudiantes",
        imgSrcBg: InteractColab,
        iconSrc: IconColab,
    },
    Disponibilidad: {
        title: "Calidad sostenible",
        description: "Los tutores gestionan su carga de trabajo para darte siempre su mejor versión",
        imgSrcBg: InteractDispo,
        iconSrc: IconDispo,
    },
}