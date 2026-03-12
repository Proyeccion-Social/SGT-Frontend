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
    LUNES: "#F7DF94",
    MARTES: "#ABEBC6",
    MIERCOLES: "#DAFFAA",
    JUEVES: "#A5D8FF",
    VIERNES: "#CFB9FF",
    SABADO: "#FFD2A1",
};

export const HOURS_ARRAY = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);
