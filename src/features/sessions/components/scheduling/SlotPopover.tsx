interface Props {
  subjects: string[];
  anchorRect: DOMRect;
  slotData: any;
  onSelect: (subject: string) => void;
}

const BADGE_COLORS = [
  { bg: "#c7d2fe", text: "#3730a3" },
  { bg: "#fde68a", text: "#92400e" },
  { bg: "#bbf7d0", text: "#166534" },
  { bg: "#fecaca", text: "#991b1b" },
  { bg: "#e9d5ff", text: "#6b21a8" },
];

const dayLabels: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles",
  JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado",
};

export default function SlotPopover({ subjects, anchorRect, slotData, onSelect }: Props) {
  const top = anchorRect.bottom + 8;
  const left = anchorRect.left;

  const today = new Date();
  const dateLabel = `${dayLabels[slotData.dayOfWeek]}, ${today.getDate()} de ${today.toLocaleDateString("es-CO", { month: "long" })}`;

  return (
    <>
      {/* Overlay difuminado */}
      {/* Overlay — usando clip-path para excluir el slot */}
        <div style={{
        position: "fixed", inset: 0,
        backdropFilter: "blur(3px)",
        background: "rgba(0,0,0,0.15)",
        zIndex: 90,
        clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% 0%,
            ${anchorRect.left}px ${anchorRect.top}px,
            ${anchorRect.left}px ${anchorRect.bottom}px,
            ${anchorRect.right}px ${anchorRect.bottom}px,
            ${anchorRect.right}px ${anchorRect.top}px,
            ${anchorRect.left}px ${anchorRect.top}px
        )`,
        }} />

      {/* Recorte del slot — copia visual encima del blur */}
      <div style={{
        position: "fixed",
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
        zIndex: 92,
        borderRadius: "10px",
        pointerEvents: "none",
        backdropFilter: "none",
        background: "transparent",
      }} />

      {/* Clon visual del slot por encima del blur */}
      <div style={{
        position: "fixed",
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
        zIndex: 91,
        borderRadius: "10px",
        pointerEvents: "none",
        // Esto "rompe" el blur solo en esta zona
        backdropFilter: "blur(0px)",
        background: "inherit",
        isolation: "isolate",
      }} />

      <div style={{
        position: "fixed",
        top: anchorRect.top - 4,
        left: anchorRect.left - 4,
        width: anchorRect.width + 8,
        height: anchorRect.height + 8,
        borderRadius: "14px",
        zIndex: 93,
        pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(
            90deg, #7c3aed 0px, #7c3aed 6px, transparent 6px, transparent 12px
        ), repeating-linear-gradient(
            180deg, #7c3aed 0px, #7c3aed 6px, transparent 6px, transparent 12px
        ), repeating-linear-gradient(
            90deg, #7c3aed 0px, #7c3aed 6px, transparent 6px, transparent 12px
        ), repeating-linear-gradient(
            180deg, #7c3aed 0px, #7c3aed 6px, transparent 6px, transparent 12px
        )`,
        backgroundSize: "12px 2px, 2px 12px, 12px 2px, 2px 12px",
        backgroundPosition: "0 0, 100% 0, 0 100%, 0 0",
        backgroundRepeat: "repeat-x, repeat-y, repeat-x, repeat-y",
        animation: "march 0.8s linear infinite",
        }} />

      {/* Popover */}
      <div
        className="slot-popover"
        style={{
          position: "fixed",
          top, left,
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          padding: "16px",
          zIndex: 99,
          minWidth: "220px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{
            width: "10px", height: "10px",
            borderRadius: "50%", background: "#4ade80", flexShrink: 0
          }} />
          <span style={{ fontWeight: 600, fontSize: "14px", color: "#1f2937" }}>
            Materias disponibles
          </span>
        </div>

        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 12px 18px" }}>
          {dateLabel}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {subjects.map((subject, i) => {
            const color = BADGE_COLORS[i % BADGE_COLORS.length];
            return (
              <button
                key={subject}
                onClick={() => onSelect(subject)}
                style={{
                  background: color.bg, color: color.text,
                  border: "none", borderRadius: "999px",
                  padding: "5px 14px", fontSize: "13px",
                  fontWeight: 500, cursor: "pointer",
                }}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}