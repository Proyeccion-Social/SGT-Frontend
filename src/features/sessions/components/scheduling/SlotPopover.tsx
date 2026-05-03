import { useFloating, flip, offset, shift } from "@floating-ui/react";
import { useEffect, useState } from "react";
import "../../assets/styles/SlotPopover.css";
import { useSubjectStore } from "@/store/subjectStore";

interface Props {
  subjects: string[];
  slotBlockId: string;
  slotData: any;
  onSelect: (subject: string) => void;
}

const FALLBACK_COLORS = [
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
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const { colorMap } = useSubjectStore();

  useEffect(() => {
    const el = document.getElementById(`slot-block-${slotBlockId}`);
    setAnchorEl(el);
  }, [slotBlockId]);

  useEffect(() => {
    const container = document.querySelector(".schedule-container");
    if (container) setContainerRect(container.getBoundingClientRect());
  }, []);

  const { refs, floatingStyles, update } = useFloating({
    placement: "right-start",
    elements: { reference: anchorEl },
    middleware: [
      offset(10),
      flip({
        fallbackPlacements: ["right", "left-start", "bottom-start", "top-start"],
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
  const dateLabel = (() => {
    const dayName = dayLabels[slotData.dayOfWeek] ?? slotData.dayOfWeek;
    if (slotData.date) {
      const [y, m, d] = slotData.date.split("-").map(Number);
      const ref = new Date(y, m - 1, d);
      const day = ref.getDate();
      const month = ref.toLocaleDateString("es-CO", { month: "long" });
      return `${dayName}, ${day} de ${month}`;
    }
    return dayName;
  })();

  return (
    <>
      <svg
        className="slot-popover__backdrop"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="backdrop-shape">
            {containerRect ? (
              /* Rectángulo con esquinas izquierdas redondeadas a 32px, coincidiendo con .schedule-container */
              <path d={`
                M ${containerRect.left + 38},${containerRect.top}
                L ${containerRect.right},${containerRect.top}
                L ${containerRect.right},${containerRect.bottom}
                L ${containerRect.left + 38},${containerRect.bottom}
                Q ${containerRect.left},${containerRect.bottom} ${containerRect.left},${containerRect.bottom - 38}
                L ${containerRect.left},${containerRect.top + 38}
                Q ${containerRect.left},${containerRect.top} ${containerRect.left + 38},${containerRect.top}
                Z
              `} />
            ) : (
              <rect width="100%" height="100%" />
            )}
          </clipPath>
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
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.15)" mask="url(#slot-hole-mask)" clipPath="url(#backdrop-shape)" />
      </svg>

      <div
        className="slot-popover"
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <div className="slot-popover__header">
          <div className="slot-popover__dot" />
          <span className="slot-popover__title">Materias disponibles</span>
        </div>

        <p className="slot-popover__date">
          {dateLabel}
        </p>

        <div className="slot-popover__subjects">
          {subjects.map((subject, i) => {
            const mapped = colorMap[subject];
            const bg = mapped?.color && mapped.color !== "transparent" ? mapped.color : FALLBACK_COLORS[i % FALLBACK_COLORS.length].bg;
            const text = mapped ? "#1a1a1a" : FALLBACK_COLORS[i % FALLBACK_COLORS.length].text;
            return (
              <button
                key={subject}
                onClick={() => onSelect(subject)}
                className="slot-popover__subject-btn"
                style={{ background: bg, color: text }}
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