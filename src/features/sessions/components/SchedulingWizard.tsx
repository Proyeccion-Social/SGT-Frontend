import { useState, useEffect } from "react";
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

export default function SchedulingWizard({ slots: initialSlots, tutorProfiles = {} }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popover, setPopover] = useState<PopoverData | null>(null);
  const [slotContext, setSlotContext] = useState<any>(null);
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
    const handler = (e: Event) => {
      const custom = e as CustomEvent;

      const matchingSlots = slots.filter(
        (s) =>
          s.dayOfWeek === custom.detail.dayOfWeek &&
          s.startTime >= custom.detail.startTime &&
          (s.endTime ?? "23:59") <= custom.detail.endTime
      );

      if (matchingSlots.length === 0) return;

      const subjects = [
        ...new Set(matchingSlots.map((s) => s.subject).filter(Boolean)),
      ] as string[];

      if (subjects.length === 0) return;

      const slotBlockId = custom.detail.slotBlockId as string;

      sileo.action({
        title: "Franja seleccionada",
        description: (
          <span className="wizard-sileo-description">
            {`${custom.detail.startTime} → ${custom.detail.endTime} · ${
              !custom.detail.modality || custom.detail.modality === "null"
                ? "Presencial o Virtual"
                : custom.detail.modality.toUpperCase() === "VIRT"
                ? "Virtual"
                : "Presencial"
            }`}
          </span>
        ),
        fill: "#8751ff",
        styles: { badge: "#ffffff" },
      });

      setTimeout(() => {
        setPopover({
          subjects,
          slotBlockId,
          slotData: custom.detail,
        });
      }, 8);
    };

    const closePopover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".slot-popover") && !target.closest(".slot-block")) {
        setPopover(null);
      }
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

    const rangeSlots = slots.filter(
      (s) =>
        s.dayOfWeek === currentSlotData.dayOfWeek &&
        s.subject === subject &&
        s.startTime >= currentSlotData.startTime &&
        (s.endTime ?? "23:59") <= currentSlotData.endTime
    );

    const baseSlot = rangeSlots[0] ?? null;

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

  // Solo las entradas libres (isBooked === false): el paso 1 nunca debe ofrecer
  // un tutor con sesión activa en esta franja, aunque comparta el slotId.
  const availableSlots =
    slotContext && data.subject
      ? slots.filter(
          (s) =>
            s.dayOfWeek === slotContext.dayOfWeek &&
            s.subject === data.subject &&
            s.startTime >= slotContext.startTime &&
            (s.endTime ?? "23:59") <= slotContext.endTime &&
            !s.isBooked
        )
      : [];

  // NOTA (pendiente): para un rango que abarca varias sub-franjas, esto ofrece a
  // cualquier tutor libre en al menos una. Exigir que esté libre en TODAS requiere
  // validar por sub-franja; queda como follow-up (ver PLAN, Fase 3).
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