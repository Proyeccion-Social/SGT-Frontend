import { useState, useEffect, useRef } from "react";
import { useSubjectStore } from "@/store/subjectStore";
import { Drawer } from "vaul";
import AvailabilityStep from "./scheduling/Availability";
import DetailsStep from "./scheduling/Details";
import SessionTypeStep from "./scheduling/SessionType";
import ModalityStep from "./scheduling/Modality";
import SlotPopover from "./scheduling/SlotPopover";
import type { Slot, TutorProfileInfo } from "@features/availability/services/availabilityService";
import { sileo } from "sileo";

import StepOne from "../assets/StepOne.svg";
import StepTwo from "../assets/StepTwo.svg";
import StepThree from "../assets/Stepthree.svg";
import StepFour from "../assets/StepFour.svg";

import "../assets/styles/SchedulingWizard.css";

export interface WizardData {
  slot: Slot | null;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subject: string;
  title: string;
  description: string;
  sessionType: "INDIVIDUAL" | "GRUPAL" | null;
  modality: "VIRT" | "PRES" | null;
}

interface PopoverData {
  subjects: string[];
  slotBlockId: string;
  slotData: any;
}

interface Props {
  slots: Slot[];
  tutorProfiles?: Record<string, TutorProfileInfo>;
}

function normalizeDay(day: unknown): string {
  return String(day ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** True si el slot crudo solapa el rango seleccionado [selStart, selEnd). */
function slotOverlapsRange(
  slot: Slot,
  selStart: string,
  selEnd: string,
): boolean {
  const end = slot.endTime ?? "23:59";
  return slot.startTime < selEnd && end > selStart;
}

/**
 * Slots del wizard que cubren la selección del calendario.
 * El calendario fusiona franjas contiguas en un bloque visual; la selección
 * del usuario (clic = 30 min) puede ser más corta que un slot crudo largo.
 * Por eso se usa solapamiento (no contención) + match por IDs del bloque.
 */
function findSlotsForSelection(
  allSlots: Slot[],
  detail: {
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    slotBlockId?: string;
    slotIds?: string[];
  },
  opts?: { subject?: string; onlyFree?: boolean },
): Slot[] {
  const selStart = detail.startTime ?? "00:00";
  const selEnd = detail.endTime ?? "23:59";
  const day = normalizeDay(detail.dayOfWeek);
  const idSet = new Set(
    (detail.slotIds?.length
      ? detail.slotIds
      : detail.slotBlockId
        ? [detail.slotBlockId]
        : []
    )
      .filter(Boolean)
      .map(String),
  );

  return allSlots.filter((s) => {
    if (normalizeDay(s.dayOfWeek) !== day) return false;
    if (opts?.subject && s.subject !== opts.subject) return false;
    if (opts?.onlyFree && s.isBooked) return false;
    if (!slotOverlapsRange(s, selStart, selEnd)) return false;
    // Si el bloque reportó IDs, priorizar esos (evita falsos positivos de otros bloques).
    // Comparar como string: data-* del DOM siempre es string; s.id puede ser number.
    if (idSet.size > 0 && !idSet.has(String(s.id))) return false;
    return true;
  });
}

export default function SchedulingWizard({ slots: initialSlots, tutorProfiles = {} }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popover, setPopover] = useState<PopoverData | null>(null);
  const [slotContext, setSlotContext] = useState<any>(null);
  const ignoreCloseUntil = useRef(0);
  const { colorMap } = useSubjectStore();
  const [data, setData] = useState<WizardData>({
    slot: null,
    tutorId: "",
    tutorName: "",
    subject: "",
    subjectId: "",
    title: "",
    description: "",
    sessionType: null,
    modality: null,
  });

  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom.detail ?? {};

      const matchingSlots = findSlotsForSelection(slots, detail);

      if (matchingSlots.length === 0) return;

      const subjects = [
        ...new Set(matchingSlots.map((s) => s.subject).filter(Boolean)),
      ] as string[];

      if (subjects.length === 0) return;

      const slotBlockId = (detail.slotBlockId as string) || matchingSlots[0]?.id || "";

      const modalityLabel =
        !detail.modality || detail.modality === "null"
          ? "Presencial o Virtual"
          : String(detail.modality).toUpperCase() === "VIRT"
            ? "Virtual"
            : "Presencial";

      try {
        sileo.action({
          title: "Franja seleccionada",
          description: `${detail.startTime} → ${detail.endTime} · ${modalityLabel}`,
          fill: "#8751ff",
          styles: { badge: "#ffffff" },
        });
      } catch {
        // El toast no debe bloquear la apertura del popover
      }

      // Evitar que el click residual cierre el popover al abrirlo
      ignoreCloseUntil.current = Date.now() + 150;
      setPopover({
        subjects,
        slotBlockId,
        slotData: detail,
      });
    };

    const closePopover = (e: MouseEvent) => {
      if (Date.now() < ignoreCloseUntil.current) return;
      const target = e.target as HTMLElement;
      if (target.closest(".slot-popover") || target.closest(".slot-block")) return;
      setPopover(null);
    };

    document.addEventListener("slot:clicked", handler);
    document.addEventListener("click", closePopover);
    return () => {
      document.removeEventListener("slot:clicked", handler);
      document.removeEventListener("click", closePopover);
    };
  }, [slots]);

  useEffect(() => {
    const shouldLock = open || !!popover;

    if (!shouldLock) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const previousStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = previousStyle.position;
      document.body.style.top = previousStyle.top;
      document.body.style.left = previousStyle.left;
      document.body.style.right = previousStyle.right;
      document.body.style.width = previousStyle.width;
      document.body.style.overflow = previousStyle.overflow;

      window.scrollTo(scrollX, scrollY);
    };
  }, [open, popover]);

  const handleSubjectSelect = (subject: string) => {
    const currentSlotData = popover!.slotData;

    const rangeSlots = findSlotsForSelection(slots, currentSlotData, {
      subject,
      onlyFree: true,
    });

    // Preferir el slot que cubre el inicio de la selección (availabilityId + duration)
    const selStart = currentSlotData.startTime ?? "00:00";
    const baseSlot =
      rangeSlots.find(
        (s) =>
          s.startTime <= selStart && (s.endTime ?? "23:59") > selStart,
      ) ??
      rangeSlots[0] ??
      null;

    setSlotContext({
      ...currentSlotData,
      rangeSlots,
    });

    setData((prev) => ({
      ...prev,
      slot: baseSlot,
      subject,
      subjectId: baseSlot?.subjectId ?? "",
    }));

    setPopover(null);
    setStep(1);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setSlotContext(null);
    setData({
      slot: null,
      tutorId: "",
      subject: "",
      title: "",
      description: "",
      sessionType: null,
      tutorName: "",
      subjectId: "",
      modality: null,
    });
  };

  const handleSubmit = async (currentData: WizardData) => {
    const sessionCheck = await fetch("/api/auth/check-session");
    if (!sessionCheck.ok) {
      window.location.href = "/?session_expired=true";
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
  try {
    const dayMap: Record<string, number> = {
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
      DOMINGO: 7,
    };

    const rawDay = slotContext?.dayOfWeek ?? "LUNES";
    const normalizedDay = rawDay
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const targetDow = dayMap[normalizedDay] ?? 1;
    const weekRef = currentData.slot?.weekReference;
    const scheduledDate = (() => {
      if (weekRef) {
        const [y, m, d] = weekRef.split("-").map(Number);
        const monday = new Date(y, m - 1, d);
        monday.setDate(monday.getDate() + (targetDow - 1));
        return monday;
      }
      const today = new Date();
      const todayDow = today.getDay() === 0 ? 7 : today.getDay();
      const diff = targetDow >= todayDow ? targetDow - todayDow : 7 - todayDow + targetDow;
      const d = new Date(today);
      d.setDate(today.getDate() + diff);
      return d;
    })();
    const scheduledDateStr = [
      scheduledDate.getFullYear(),
      String(scheduledDate.getMonth() + 1).padStart(2, "0"),
      String(scheduledDate.getDate()).padStart(2, "0"),
    ].join("-");

    const [startH, startM] = (slotContext?.startTime ?? "00:00")
      .split(":")
      .map(Number);
    const [endH, endM] = (slotContext?.endTime ?? "00:00")
      .split(":")
      .map(Number);
    const durationHours =
      Math.round(
        (((endH * 60 + endM) - (startH * 60 + startM)) / 60) * 2
      ) / 2;

    const sessionData = {
      tutorId: currentData.tutorId,
      subjectId: currentData.subjectId,
      availabilityId: Number(currentData.slot?.id),
      scheduledDate: scheduledDateStr,
      modality: currentData.modality ?? currentData.slot?.modality ?? "PRES",
      title: currentData.title,
      durationHours,
      description: currentData.description,
    };
    
    const res = await fetch("/api/sessions/scheduleapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al agendar sesión");
    }

    await res.json();

    // Marcar como reservado solo la entrada del tutor reservado (evita reload).
    // El slotId es compartido entre tutores: marcar por id ocuparía también a
    // los tutores que siguen libres. Se filtra por (slotId, tutorId).
    const bookedSlotId = currentData.slot?.id;
    const bookedTutorId = currentData.tutorId;
    if (bookedSlotId) {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === bookedSlotId && s.tutorIds?.includes(bookedTutorId)
            ? { ...s, isBooked: true }
            : s
        )
      );
      document.dispatchEvent(
        new CustomEvent("slot:booked", {
          detail: { slotId: bookedSlotId, tutorId: bookedTutorId },
          bubbles: true,
        })
      );
    }

    sileo.action({
      title: "Tutoría agendada",
      description: "Tu espacio ha sido reservado exitosamente.",
      fill: "#58d68d",
      styles: { badge: "#ffffff" },
    });

    handleClose();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "No se pudo reservar el espacio.";
    sileo.action({
      title: "Error al agendar",
      description: msg,
      fill: "#f35761",
      styles: { badge: "#ffffff" },
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Solo entradas libres que solapan la selección (misma regla que el popover).
  // NOTA: un tutor libre en al menos una sub-franja se ofrece; exigir libre en
  // TODAS las sub-franjas del rango queda como follow-up.
  const availableSlots =
    slotContext && data.subject
      ? findSlotsForSelection(slots, slotContext, {
          subject: data.subject,
          onlyFree: true,
        })
      : [];

  const tutorIds = [
    ...new Set(availableSlots.flatMap((s) => s.tutorIds || [])),
  ];

  const slotContextModality = slotContext?.modality;
  const isSlotContextAmbiguousModality =
    !slotContextModality || slotContextModality === "null";
  const needsModality = isSlotContextAmbiguousModality || data.slot?.modality == null;
  const totalSteps = needsModality ? 4 : 3;

  const stepImages = [StepOne.src, StepTwo.src, StepThree.src, StepFour.src];
  const stepTitleByStep: Record<number, { highlight: string; rest: string }> = {
    1: { highlight: "Selecciona", rest: "el tutor de tu preferencia" },
    2: { highlight: "Información", rest: "adicional" },
    3: { highlight: "Selecciona", rest: "el tipo de espacio" },
    4: { highlight: "Selecciona", rest: "la modalidad del espacio" },
  };
  const currentTitle = stepTitleByStep[step] ?? stepTitleByStep[1];

  return (
    <>
      {/* ── Popover de materias ── */}
      {popover && (
        <SlotPopover
          subjects={popover.subjects}
          slotBlockId={popover.slotBlockId}
          slotData={popover.slotData}
          onSelect={handleSubjectSelect}
        />
      )}

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>

          {/* ── Overlay ── */}
          <Drawer.Overlay className="wizard-overlay" />

          {/* ── Drawer principal ── */}
          <Drawer.Content className="wizard-drawer">


            {/* ── Handle de arrastre ── */}
            <div className="wizard-drawer__handle" />

            {/* ── Área de contenido scrolleable ── */}

            <article className="wizard-step-header">
              <div className="wizard-header-text">
                <h2 className="wizard-step-title">
                  <span className="wizard-step-title__highlight">{currentTitle.highlight}</span>{" "}
                  {currentTitle.rest}
                </h2>
                <p className="wizard-step-subtitle">Estás agendando un espacio nuevo</p>
              </div>
              <div className="wizard-drawer__step-indicator">
                Paso
                <img
                  src={stepImages[step - 1]}
                  alt={`Paso ${step} de ${totalSteps}`}
                  className="wizard-drawer__step-image"
                />
              </div>
            </article>
            <div className="wizard-drawer__content">

              {/* ── Wrapper del step activo ── */}
              <div className="wizard-drawer__step-wrapper">

                {step === 1 && (
                  <AvailabilityStep
                    tutorIds={tutorIds}
                    subject={data.subject}
                    subjectColor={colorMap[data.subject]}
                    tutorProfiles={tutorProfiles}
                    onSelect={(tutorId) => {
                      const selectedSlot =
                        availableSlots.find((s) => s.tutorIds?.includes(tutorId)) ?? data.slot;
                      setData((prev) => ({
                        ...prev,
                        tutorId,
                        slot: selectedSlot,
                        tutorName: tutorProfiles[tutorId]?.name ?? prev.tutorName,
                      }));
                      setStep(2);
                    }}
                  />
                )}
                {step === 2 && (
                  <DetailsStep
                    initialTitle={data.title}
                    initialDescription={data.description}
                    onNext={(title, description) => {
                      setData((prev) => ({ ...prev, title, description }));
                      setStep(3);
                    }}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <SessionTypeStep
                    initialType={data.sessionType}
                    onNext={(sessionType) => {
                      const updatedData = { ...data, sessionType };
                      setData(updatedData);
                      if (needsModality) setStep(4);
                      else handleSubmit(updatedData);
                    }}
                    onBack={() => setStep(2)}
                    isSubmitting={isSubmitting}
                  />
                )}
                {step === 4 && needsModality && (
                  <ModalityStep
                    initialModality={data.modality}
                    onNext={(modality) => {
                      const updatedData = { ...data, modality };
                      setData(updatedData);
                      handleSubmit(updatedData);
                    }}
                    onBack={() => setStep(3)}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>           

          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}