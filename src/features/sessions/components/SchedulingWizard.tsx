import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import AvailabilityStep from "./scheduling/Availability";
import DetailsStep from "./scheduling/Details";
import SessionTypeStep from "./scheduling/SessionType";
import ModalityStep from "./scheduling/Modality";
import SlotPopover from "./scheduling/SlotPopover";
import type { Slot } from "../../../features/availability/services/availabilityService";
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
  anchorRect: DOMRect;
  slotData: any;
}

interface Props {
  slots: Slot[];
  token: String;
}

export default function SchedulingWizard({ slots, token }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [popover, setPopover] = useState<PopoverData | null>(null);
  const [slotContext, setSlotContext] = useState<any>(null);
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

      const rect = custom.detail.overlayRect as DOMRect;

      sileo.action({
        title: "Franja seleccionada",
        description: (
          <span style={{ display: "block", textAlign: "center", width: "100%" }}>
            {`${custom.detail.startTime} → ${custom.detail.endTime} · ${
              !custom.detail.modality || custom.detail.modality === "null"
                ? "Presencial o Virtual"
                : custom.detail.modality.toUpperCase() === "VIRT"
                ? "Virtual"
                : "Presencial"
            }`}
          </span>
        ),
        fill: "#7c3aed",
        styles: { badge: "#ffffff" },
      });

      setTimeout(() => {
        setPopover({ subjects, anchorRect: rect, slotData: custom.detail });
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

  const handleSubmit = async () => {
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

      const today = new Date();
      const todayDow = today.getDay() === 0 ? 7 : today.getDay();
      const targetDow = dayMap[normalizedDay] ?? 1;
      const diff =
        targetDow >= todayDow
          ? targetDow - todayDow
          : 7 - todayDow + targetDow;

      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + diff);
      const scheduledDateStr = scheduledDate.toISOString().split("T")[0];

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
        tutorId: data.tutorId,
        subjectId: data.subjectId,
        availabilityId: data.slot?.id,
        scheduledDate: scheduledDateStr,
        modality: data.modality ?? slotContext?.modality ?? "PRES",
        durationHours,
        title: data.title,
        description: data.description,
      };

      const res = await fetch("/api/sessions/scheduleapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al agendar sesión");
      }

      await res.json();

      sileo.action({
        title: "Tutoría agendada",
        description: "Tu espacio ha sido reservado exitosamente.",
        fill: "#58d68d",
        styles: { badge: "#ffffff" },
      });

      handleClose();
    } catch (error) {
      sileo.action({
        title: "Error al agendar",
        description: "No se pudo reservar el espacio. Intenta de nuevo.",
        fill: "#f35761",
        styles: { badge: "#ffffff" },
      });
    }
  };

  const availableSlots =
    slotContext && data.subject
      ? slots.filter(
          (s) =>
            s.dayOfWeek === slotContext.dayOfWeek &&
            s.subject === data.subject &&
            s.startTime >= slotContext.startTime &&
            (s.endTime ?? "23:59") <= slotContext.endTime
        )
      : [];

  const tutorIds = [
    ...new Set(availableSlots.flatMap((s) => s.tutorIds || [])),
  ];

  const needsModality = data.slot?.modality === null;
  const totalSteps = needsModality ? 4 : 3;

  const stepImages = [StepOne.src, StepTwo.src, StepThree.src, StepFour.src];

  return (
    <>
      {/* ── Popover de materias ── */}
      {popover && (
        <SlotPopover
          subjects={popover.subjects}
          anchorRect={popover.anchorRect}
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

            {/* ── Barra de progreso degradado ── */}
            <div className="wizard-drawer__progress-bar" />

            {/* ── Handle de arrastre ── */}
            <div className="wizard-drawer__handle" />

            {/* ── Área de contenido scrolleable ── */}
            <div className="wizard-drawer__content">

              {/* ── Wrapper del step activo ── */}
              <div className="wizard-drawer__step-wrapper">
                {step === 1 && (
                  <AvailabilityStep
                    tutorIds={tutorIds}
                    slot={data.slot}
                    subject={data.subject}
                    token={token}
                    onSelect={(tutorId) => {
                      setData((prev) => ({ ...prev, tutorId }));
                      setStep(2);
                    }}
                  />
                )}
                {step === 2 && (
                  <DetailsStep
                    onNext={(title, description) => {
                      setData((prev) => ({ ...prev, title, description }));
                      setStep(3);
                    }}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <SessionTypeStep
                    onNext={(sessionType) => {
                      setData((prev) => ({ ...prev, sessionType }));
                      if (needsModality) setStep(4);
                      else handleSubmit();
                    }}
                    onBack={() => setStep(2)}
                  />
                )}
                {step === 4 && needsModality && (
                  <ModalityStep
                    onNext={(modality) => {
                      setData((prev) => ({ ...prev, modality }));
                      handleSubmit();
                    }}
                    onBack={() => setStep(3)}
                  />
                )}
              </div>
            </div>

            {/* ── Indicador de paso ── */}
            <div className="wizard-drawer__step-indicator">
              Paso
              <img
                src={stepImages[step - 1]}
                alt={`Paso ${step}`}
                className="wizard-drawer__step-image"
              />
            </div>

          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}