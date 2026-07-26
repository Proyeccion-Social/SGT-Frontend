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
    MARTES: "#ABEBC699",
    MIERCOLES: "#DAFFAA99",
    JUEVES: "#A5D8FF99",
    VIERNES: "#CFB9FF99",
    SABADO: "#FFD2A199",
};

export const DAY_BORDER_COLORS: Record<string, string> = {
    LUNES:     "#7C3AED", // violeta oscuro — contrasta con el lila suave
    MARTES:    "#059669", // verde esmeralda — contrasta con el verde menta
    MIERCOLES: "#65A30D", // verde oliva — contrasta con el verde lima
    JUEVES:    "#1D7FC4", // azul medio — contrasta con el azul cielo
    VIERNES:   "#7C3AED", // violeta oscuro — contrasta con el lila
    SABADO:    "#C2620A", // naranja quemado — contrasta con el durazno
};

export const DAY_TEXT_COLORS: Record<string, string> = {
    LUNES: "#91792E",
    MARTES: "#25A35A",
    MIERCOLES: "#749944",
    JUEVES: "#2B6CB0",
    VIERNES: "#6C41CC",
    SABADO: "#9C4221",
};

export const HOURS_ARRAY = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);