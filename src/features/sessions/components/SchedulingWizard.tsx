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

interface CoveringTutor {
  tutorId: string;
  entrySlot: Slot;
}

function wizardTimeToMin(t?: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// SCHEDULING-07: ¿los slots de un tutor (una materia y día) forman una cadena
// continua, sin huecos, sin tramos ocupados y de una única modalidad, que cubre
// por completo [selStart, selEnd]? Devuelve el slot de entrada (el que contiene el
// inicio de la franja) si la cubre; null en caso contrario.
function coverageEntrySlot(tutorSlots: Slot[], selStart: number, selEnd: number): Slot | null {
  if (selEnd <= selStart) return null;

  // Cada modalidad se evalúa por separado: la cobertura exige una sola modalidad continua.
  const byModality: Record<string, Slot[]> = {};
  for (const s of tutorSlots) {
    if (s.isBooked) continue; // un tramo ocupado rompe la cadena
    const key = s.modality ?? "__NULL__";
    if (!byModality[key]) byModality[key] = [];
    byModality[key].push(s);
  }

  for (const key of Object.keys(byModality)) {
    const chain = byModality[key]
      .slice()
      .sort((a, b) => wizardTimeToMin(a.startTime) - wizardTimeToMin(b.startTime));

    let cursor = selStart;
    let entrySlot: Slot | null = null;
    for (const s of chain) {
      const sStart = wizardTimeToMin(s.startTime);
      const sEnd = wizardTimeToMin(s.endTime);
      if (sStart > cursor) break; // hueco antes del cursor: la cadena no cubre
      if (sEnd > cursor) {
        if (entrySlot === null) entrySlot = s; // primer slot que contiene el inicio de la franja
        cursor = sEnd;
      }
      if (cursor >= selEnd && entrySlot) return entrySlot;
    }
  }
  return null;
}

// Tutores cuya disponibilidad continua cubre toda la franja para una materia dada.
function getCoveringTutors(
  allSlots: Slot[],
  dayOfWeek: string,
  subject: string,
  selStart: number,
  selEnd: number
): CoveringTutor[] {
  const byTutor: Record<string, Slot[]> = {};
  for (const s of allSlots) {
    if (s.dayOfWeek !== dayOfWeek || s.subject !== subject) continue;
    const t = s.tutorIds?.[0];
    if (!t) continue;
    if (!byTutor[t]) byTutor[t] = [];
    byTutor[t].push(s);
  }

  const result: CoveringTutor[] = [];
  for (const tutorId of Object.keys(byTutor)) {
    const entrySlot = coverageEntrySlot(byTutor[tutorId], selStart, selEnd);
    if (entrySlot) result.push({ tutorId, entrySlot });
  }
  return result;
}

// Materias con al menos un tutor que cubre por completo la franja seleccionada.
function getCoveringSubjects(
  allSlots: Slot[],
  dayOfWeek: string,
  selStart: number,
  selEnd: number
): string[] {
  const subjects = [
    ...new Set(
      allSlots
        .filter((s) => s.dayOfWeek === dayOfWeek)
        .map((s) => s.subject)
        .filter(Boolean) as string[]
    ),
  ];
  return subjects.filter(
    (subj) => getCoveringTutors(allSlots, dayOfWeek, subj, selStart, selEnd).length > 0
  );
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
      const detail = custom.detail;
      const slotBlockId = detail.slotBlockId as string;

      const selStart = wizardTimeToMin(detail.startTime);
      const selEnd = wizardTimeToMin(detail.endTime);

      // SCHEDULING-07: solo se ofrecen materias cuyos tutores cubren TODA la franja
      // con disponibilidad continua. Si la selección abarca horarios de varios
      // tutores sin que ninguno la cubra por completo, no hay materias que ofrecer.
      const subjects = getCoveringSubjects(slots, detail.dayOfWeek, selStart, selEnd);

      if (subjects.length === 0) {
        sileo.action({
          title: "Franja sin cobertura",
          description: (
            <span className="wizard-sileo-description">
              Ningún tutor cubre por completo esta franja horaria.
            </span>
          ),
          fill: "#f5a623",
          styles: { badge: "#ffffff" },
        });
        setPopover({ subjects: [], slotBlockId, slotData: detail });
        return;
      }

      sileo.action({
        title: "Franja seleccionada",
        description: (
          <span className="wizard-sileo-description">
            {`${detail.startTime} → ${detail.endTime} · ${
              !detail.modality || detail.modality === "null"
                ? "Presencial o Virtual"
                : detail.modality.toUpperCase() === "VIRT"
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
          slotData: detail,
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

    // Solo se ofrecen materias con cobertura, así que aquí hay ≥1 tutor que cubre.
    // El slot base es el de entrada del primer tutor que cubre; se reemplaza por el
    // del tutor concreto al elegirlo en el paso 1.
    const covering = getCoveringTutors(
      slots,
      currentSlotData.dayOfWeek,
      subject,
      wizardTimeToMin(currentSlotData.startTime),
      wizardTimeToMin(currentSlotData.endTime)
    );

    const baseSlot = covering[0]?.entrySlot ?? null;

    setSlotContext({ ...currentSlotData });

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

    // Marcar el slot como reservado en el estado local (evita reload)
    const bookedSlotId = currentData.slot?.id;
    if (bookedSlotId) {
      setSlots((prev) =>
        prev.map((s) => (s.id === bookedSlotId ? { ...s, isBooked: true } : s))
      );
      document.dispatchEvent(
        new CustomEvent("slot:booked", {
          detail: { slotId: bookedSlotId },
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

  // Tutores que cubren por completo la franja seleccionada para la materia elegida
  // (SCHEDULING-07). Reemplaza la antigua unión "tutor con algún slot en el rango".
  const coveringTutors =
    slotContext && data.subject
      ? getCoveringTutors(
          slots,
          slotContext.dayOfWeek,
          data.subject,
          wizardTimeToMin(slotContext.startTime),
          wizardTimeToMin(slotContext.endTime)
        )
      : [];

  const tutorIds = coveringTutors.map((c) => c.tutorId);

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
                      // El slot de entrada del tutor elegido es el que se reserva
                      // (availabilityId + duración lo resuelve el backend por cadena continua).
                      const covering = coveringTutors.find((c) => c.tutorId === tutorId);
                      const selectedSlot = covering?.entrySlot ?? data.slot;
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