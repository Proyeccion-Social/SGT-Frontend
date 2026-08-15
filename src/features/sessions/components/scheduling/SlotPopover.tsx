import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  type VirtualElement,
} from "@floating-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/styles/SlotPopover.css";
import { useSubjectStore } from "@/store/subjectStore";

interface Props {
  subjects: string[];
  slotBlockId: string;
  slotData: any;
  open: boolean;
  onSelect: (subject: string) => void;
  onExited: () => void;
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

function emptyRect(): DOMRect {
  return {
    top: 0, bottom: 0, left: 0, right: 0,
    width: 0, height: 0, x: 0, y: 0,
    toJSON: () => {},
  } as DOMRect;
}

export default function SlotPopover({ subjects, slotBlockId, slotData, open, onSelect, onExited }: Props) {
  const { colorMap } = useSubjectStore();
  const [visible, setVisible] = useState(false);

  // Animación de entrada/salida en dos fases (patrón NotificationsRoot):
  // al abrir se monta invisible y tras un frame se anima la entrada; al
  // cerrar se reproduce la salida y solo entonces el padre desmonta.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timer = setTimeout(onExited, 160);
    return () => clearTimeout(timer);
  }, [open, onExited]);

  // Rect del sub-intervalo seleccionado, leído en vivo desde el DOM cada vez
  // que se posiciona o re-renderiza (nunca queda stale).
  const getSubRect = useCallback((): DOMRect => {
    const el = document.getElementById(`slot-block-${slotBlockId}`);
    const slotRect = el?.getBoundingClientRect();
    if (!slotRect) return emptyRect();

    const slotStartMin = timeToMinutes(el?.dataset.start ?? slotData.startTime);
    const selStartMin = timeToMinutes(slotData.startTime);
    const selEndMin = timeToMinutes(slotData.endTime ?? slotData.startTime);

    const top = slotRect.top + ((selStartMin - slotStartMin) / 60) * HOUR_HEIGHT;
    const height = Math.max(1, ((selEndMin - selStartMin) / 60) * HOUR_HEIGHT);

    return {
      top,
      bottom: top + height,
      left: slotRect.left,
      right: slotRect.right,
      width: slotRect.width,
      height,
      x: slotRect.x,
      y: top,
      toJSON: () => {},
    } as DOMRect;
  }, [slotBlockId, slotData.startTime, slotData.endTime]);

  // Ancla virtual: el popover se posiciona contra la franja seleccionada, no
  // contra el bloque completo → flip/offset/shift operan sobre la selección.
  const virtualEl = useMemo<VirtualElement>(
    () => ({ getBoundingClientRect: getSubRect }),
    [getSubRect],
  );

  const { refs, floatingStyles, update } = useFloating({
    placement: "right-start",
    strategy: "fixed",
    middleware: [
      offset(10),
      flip({
        fallbackPlacements: ["right", "left-start", "bottom-start", "top-start"],
      }),
      shift({ padding: 12 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    refs.setReference(virtualEl);
    update();
  }, [virtualEl, refs, update]);

  // Respaldo manual: con ancla virtual autoUpdate no observa scrolls/resizes
  // del bloque del slot (solo de los ancestros del flotante).
  useEffect(() => {
    if (!refs.floating.current) return;
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [update, refs.floating]);

  useEffect(() => {
    const el = document.getElementById(`slot-block-${slotBlockId}`);
    if (!el) return;
    el.classList.add("slot-selected");
    return () => el.classList.remove("slot-selected");
  }, [slotBlockId]);

  const subRect = getSubRect();
  const container = document.querySelector(".schedule-container");
  const containerRect = container ? container.getBoundingClientRect() : null;

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

  const stateClass = visible ? "slot-popover--open" : "slot-popover--closing";
  const borderClass = visible
    ? "slot-selection-border--open"
    : "slot-selection-border--closing";
  const backdropClass = visible
    ? "slot-popover__backdrop--open"
    : "slot-popover__backdrop--closing";

  return (
    <>
      <svg
        className={`slot-popover__backdrop ${backdropClass}`}
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
        className={`slot-selection-border ${borderClass}`}
        style={{
          top: subRect.top - 2,
          left: subRect.left - 2,
          width: subRect.width + 4,
          height: subRect.height + 4,
        }}
      />

      <div
        className={`slot-popover ${stateClass}`}
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <div className="slot-popover__inner">
          <div className="slot-popover__header">
            <div className={`slot-popover__dot${subjects.length === 0 ? " slot-popover__dot--empty" : ""}`} />
            <span className="slot-popover__title">
              {subjects.length === 0 ? "Sin disponibilidad" : "Materias disponibles"}
            </span>
          </div>

          <p className="slot-popover__date">
            {dateLabel}
          </p>

          {subjects.length === 0 ? (
            <p className="slot-popover__empty">
              No hay tutores disponibles para esta franja horaria.
            </p>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
}
