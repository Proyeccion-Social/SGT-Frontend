import { useFloating, autoPlacement, offset, shift } from "@floating-ui/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  subjects: string[];
  slotBlockId: string;
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

const HOUR_HEIGHT = 64;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getSubIntervalRect(
  anchorEl: HTMLElement,
  slotStartTime: string,
  selectionStartTime: string,
  selectionEndTime: string
): DOMRect {
  const slotRect = anchorEl.getBoundingClientRect();
  const slotStartMin = timeToMinutes(slotStartTime);
  const selStartMin = timeToMinutes(selectionStartTime);
  const selEndMin = timeToMinutes(selectionEndTime);

  const offsetTop = ((selStartMin - slotStartMin) / 60) * HOUR_HEIGHT;
  const height = ((selEndMin - selStartMin) / 60) * HOUR_HEIGHT;

  return {
    top: slotRect.top + offsetTop,
    bottom: slotRect.top + offsetTop + height,
    left: slotRect.left,
    right: slotRect.right,
    width: slotRect.width,
    height,
    x: slotRect.x,
    y: slotRect.top + offsetTop,
    toJSON: () => {},
  } as DOMRect;
}

export default function SlotPopover({ subjects, slotBlockId, slotData, onSelect }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(`slot-block-${slotBlockId}`);
    setAnchorEl(el);
  }, [slotBlockId]);

  const { refs, floatingStyles, update } = useFloating({
    elements: { reference: anchorEl },
    middleware: [
      offset(10),
      autoPlacement({
        allowedPlacements: ["top", "bottom", "top-start", "bottom-start"],
      }),
      shift({ padding: 12 }),
    ],
  });

  useEffect(() => {
    if (!anchorEl) return;
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [update, anchorEl]);

  useEffect(() => {
    if (!anchorEl) return;
    anchorEl.classList.add("slot-selected");
    return () => anchorEl.classList.remove("slot-selected");
  }, [anchorEl]);

  if (!anchorEl) return null;

  // Rect del subintervalo calculado en tiempo real desde el DOM
  const subRect = getSubIntervalRect(
    anchorEl,
    anchorEl.dataset.start || "00:00",
    slotData.startTime,
    slotData.endTime
  );

  const today = new Date();
  const dateLabel = `${dayLabels[slotData.dayOfWeek]}, ${today.getDate()} de ${today.toLocaleDateString("es-CO", { month: "long" })}`;

  return (
    <>
      <svg
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 90 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="slot-hole-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={subRect.left}
              y={subRect.top}
              width={subRect.width}
              height={subRect.height}
              rx="8"
              ry="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.15)" mask="url(#slot-hole-mask)" />
      </svg>



      <div
        className="slot-popover"
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          padding: "16px",
          zIndex: 99,
          minWidth: "220px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: "14px", color: "#1f2937" }}>Materias disponibles</span>
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