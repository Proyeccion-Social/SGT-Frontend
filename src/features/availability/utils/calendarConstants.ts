export const HOUR_START = 7;
export const HOUR_END = 19;
export const HOUR_HEIGHT = 64;
export const TOTAL_HOURS = HOUR_END - HOUR_START;

export const DAYS = [
    { key: "LUNES", label: "Lunes" },
    { key: "MARTES", label: "Martes" },
    { key: "MIERCOLES", label: "Miércoles" },
    { key: "JUEVES", label: "Jueves" },
    { key: "VIERNES", label: "Viernes" },
    { key: "SABADO", label: "Sábado" },
];

export const DAY_COLORS: Record<string, string> = {
    LUNES: "#CFB9FF99",
    MARTES: "#FFD2A199",
    MIERCOLES: "#ABEBC699",
    JUEVES: "#CDFF8E99",
    VIERNES: "#D7D1FF99",
    SABADO: "#A5D8FF99",
};

export const DAY_BORDER_COLORS: Record<string, string> = {
    LUNES: "#9f74ff",
    MARTES: "#ffa76b",
    MIERCOLES: "#58d68d",
    JUEVES: "#9acc5b",
    VIERNES: "#9b8cff",
    SABADO: "#78bef8",
};

export const DAY_TEXT_COLORS: Record<string, string> = {
    LUNES: "#8751ff",
    MARTES: "#9C4221",
    MIERCOLES: "#25A35A",
    JUEVES: "#749944",
    VIERNES: "#7c70cc",
    SABADO: "#2B6CB0",
};

export const HOURS_ARRAY = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);
