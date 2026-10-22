import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  type VirtualElement,
} from "@floating-ui/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { Drawer } from "vaul";
import "../../assets/styles/SlotPopover.css";
import { useSubjectStore } from "@/store/subjectStore";
import {
  DAY_BORDER_COLORS,
  DAY_TEXT_COLORS,
} from "@/features/availability/utils/calendarConstants";

interface Props {
  subjects: string[];
  slotBlockId: string;
  slotData: any;
  open: boolean;
  onSelect: (subject: string) => void;
  onCloseRequest: () => void;
  onExited: () => void;
  onEndTimeChange?: (newEndTime: string) => void;
  onResizeEnd?: () => void;
}

const EXIT_MS_DESKTOP = 160;
// ≥ animación de salida de vaul (0.5s) para no cortarla antes de desmontar.
const EXIT_MS_MOBILE = 550;

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

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const minutes = timeToMinutes(time);
    const hour = Math.floor(minutes / 60);
    return {
      label: `${hour % 12 || 12}:${String(minutes % 60).padStart(2, "0")}`,
      period: hour < 12 ? "am" : "pm",
    };
  };
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  return start.period === end.period
    ? `${start.label} → ${end.label} ${end.period}`
    : `${start.label} ${start.period} → ${end.label} ${end.period}`;
}

function emptyRect(): DOMRect {
  return {
    top: 0, bottom: 0, left: 0, right: 0,
    width: 0, height: 0, x: 0, y: 0,
    toJSON: () => {},
  } as DOMRect;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

function SlotPopoverContent({
  subjects,
  dateLabel,
  onSelect,
}: {
  subjects: string[];
  dateLabel: string;
  onSelect: (subject: string) => void;
}) {
  const { colorMap } = useSubjectStore();

  return (
    <>
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
    </>
  );
}

export default function SlotPopover({
  subjects,
  slotBlockId,
  slotData,
  open,
  onSelect,
  onCloseRequest,
  onExited,
  onEndTimeChange,
  onResizeEnd,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragEndMinutes, setDragEndMinutes] = useState<number | null>(null);
  const [currentEndTime, setCurrentEndTime] = useState<string>(
    slotData.endTime ?? slotData.startTime,
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Animación de entrada/salida en dos fases (patrón NotificationsRoot):
  // al abrir se monta invisible y tras un frame se anima la entrada; al
  // cerrar se reproduce la salida y solo entonces el padre desmonta.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timer = setTimeout(onExited, isMobile ? EXIT_MS_MOBILE : EXIT_MS_DESKTOP);
    return () => clearTimeout(timer);
  }, [open, onExited, isMobile]);

  useEffect(() => {
    setCurrentEndTime(slotData.endTime ?? slotData.startTime);
    setDragEndMinutes(null);
  }, [slotBlockId, slotData.startTime, slotData.endTime]);

  // Rect del sub-intervalo seleccionado, leído en vivo desde el DOM cada vez
  // que se posiciona o re-renderiza (nunca queda stale).
  const getSubRect = useCallback((): DOMRect => {
    const el = document.getElementById(`slot-block-${slotBlockId}`);
    const slotRect = el?.getBoundingClientRect();
    if (!slotRect) return emptyRect();

    const slotStartMin = timeToMinutes(el?.dataset.start ?? slotData.startTime);
    const selStartMin = timeToMinutes(slotData.startTime);
    const selEndMin =
      dragEndMinutes ?? timeToMinutes(currentEndTime ?? slotData.endTime ?? slotData.startTime);

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
  }, [slotBlockId, slotData.startTime, slotData.endTime, currentEndTime, dragEndMinutes]);

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

  useEffect(() => {
    if (dragEndMinutes !== null) update();
  }, [dragEndMinutes, update]);

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

  useEffect(() => {
    if (!isDragging) return;
    const root = document.documentElement;
    root.classList.add("slot-duration-dragging");
    return () => root.classList.remove("slot-duration-dragging");
  }, [isDragging]);

  const handleHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const selStartMin = timeToMinutes(slotData.startTime);
    const initialEndMin = timeToMinutes(
      currentEndTime ?? slotData.endTime ?? slotData.startTime,
    );
    const maxEndMin = Math.min(19 * 60, selStartMin + 120);
    const startY = e.clientY;
    const pointerId = e.pointerId;
    let latestClampedEnd = initialEndMin;

    setIsDragging(true);
    setDragEndMinutes(initialEndMin);

    const onPointerMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const deltaMinutes = ((ev.clientY - startY) / HOUR_HEIGHT) * 60;
      const roundedDelta = Math.round(deltaMinutes / 30) * 30;
      const rawEnd = initialEndMin + roundedDelta;
      const clampedEnd = Math.min(
        maxEndMin,
        Math.max(selStartMin + 30, rawEnd),
      );

      if (clampedEnd !== latestClampedEnd) {
        latestClampedEnd = clampedEnd;
        setDragEndMinutes(clampedEnd);
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      onResizeEnd?.();

      const finalEndTime = minutesToTime(latestClampedEnd);
      setCurrentEndTime(finalEndTime);
      setDragEndMinutes(null);
      setIsDragging(false);

      if (finalEndTime !== (slotData.endTime ?? slotData.startTime)) {
        onEndTimeChange?.(finalEndTime);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

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

  // ── Mobile: bottom sheet real con vaul (swipe-to-close, handle, spring).
  // Vaul maneja su propia animación de entrada/salida.
  if (isMobile) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={(o) => {
          if (!o) onCloseRequest();
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="slot-popover-drawer__overlay" />
          <Drawer.Content className="slot-popover-drawer">
            <div aria-hidden className="slot-popover-drawer__handle" />
            <div className="slot-popover-drawer__body">
              <SlotPopoverContent
                subjects={subjects}
                dateLabel={dateLabel}
                onSelect={onSelect}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // ── Desktop: popover flotante anclado a la franja seleccionada ──
  const subRect = getSubRect();
  const container = document.querySelector<HTMLElement>(".schedule-container");
  const containerRect = container ? container.getBoundingClientRect() : null;
  const frameWidth = subRect.width + 4;
  const frameHeight = subRect.height + 4;
  const selectedEndTime = minutesToTime(
    dragEndMinutes ?? timeToMinutes(currentEndTime ?? slotData.endTime ?? slotData.startTime),
  );

  const stateClass = visible ? "slot-popover--open" : "slot-popover--closing";
  const borderClass = visible
    ? "slot-selection-border--open"
    : "slot-selection-border--closing";
  const selectionBorderColor = DAY_BORDER_COLORS[slotData.dayOfWeek] ?? "currentColor";
  const selectionTextColor = DAY_TEXT_COLORS[slotData.dayOfWeek] ?? "#3c3c3c";
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
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.08)" mask="url(#slot-hole-mask)" clipPath="url(#backdrop-shape)" />
      </svg>

      {createPortal(
        <div
          className={`slot-selection-border ${borderClass}`}
          style={{
            top: subRect.top - 2,
            left: subRect.left - 2,
            width: frameWidth,
            height: frameHeight,
            "--selection-border-color": selectionBorderColor,
            "--selection-text-color": selectionTextColor,
          } as CSSProperties}
        >
          <svg
            className="slot-selection-border__outline"
            aria-hidden="true"
            viewBox={`0 0 ${frameWidth} ${frameHeight}`}
            preserveAspectRatio="none"
          >
            <rect
              x="1"
              y="1"
              width={Math.max(0, frameWidth - 2)}
              height={Math.max(0, frameHeight - 2)}
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="16 8"
            />
          </svg>
          <span className="slot-selection-border__time">
            {formatTimeRange(slotData.startTime, selectedEndTime)}
          </span>
          <div
            className="slot-selection-border__handle"
            role="button"
            tabIndex={0}
            aria-label="Arrastra para extender la duración de la tutoría"
            aria-pressed={isDragging}
            onPointerDown={handleHandlePointerDown}
          />
        </div>,
        document.body,
      )}

      <div
        className={`slot-popover ${stateClass}`}
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <div className="slot-popover__inner">
          <SlotPopoverContent
            subjects={subjects}
            dateLabel={dateLabel}
            onSelect={onSelect}
          />
        </div>
      </div>
    </>
  );
}
