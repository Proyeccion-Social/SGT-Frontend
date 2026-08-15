import { useState, useEffect, useRef } from "react";
import { useSubjectStore } from "@/store/subjectStore";
import { Drawer } from "vaul";
import AvailabilityStep from "./scheduling/Availability";
import DetailsStep from "./scheduling/Details";
import ModalityStep from "./scheduling/Modality";
import SlotPopover from "./scheduling/SlotPopover";
import SchedulingFinish from "./scheduling/SchedulingFinish";
import type { Slot, TutorProfileInfo } from "@features/availability/services/availabilityService";
import { sileo } from "sileo";

import StepOne from "../assets/StepOne.svg";
import StepTwo from "../assets/StepTwo.svg";
import StepThree from "../assets/Stepthree.svg";

import "../assets/styles/SchedulingWizard.css";

export interface WizardData {
  slot: Slot | null;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subject: string;
  title: string;
  description: string;
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

interface CoveringTutor {
  tutorId: string;
  entrySlot: Slot;
  /** Modalidades con las que el tutor cubre de forma continua toda la franja. */
  modalities: ("PRES" | "VIRT")[];
}

function wizardTimeToMin(t?: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * SCHEDULING-07: ¿los slots de un tutor (una materia y día) forman una cadena
 * continua, sin huecos, sin tramos ocupados y de una única modalidad, que cubre
 * por completo [selStart, selEnd]?
 * `modality` es Modality[] — un slot dual (PRES+VIRT) puede participar en ambas cadenas.
 */
function coverageForTutor(
  tutorSlots: Slot[],
  selStart: number,
  selEnd: number,
): { entrySlot: Slot; modalities: ("PRES" | "VIRT")[] } | null {
  if (selEnd <= selStart) return null;

  const freeSlots = tutorSlots.filter((s) => !s.isBooked);
  if (freeSlots.length === 0) return null;

  const modalityKeys = new Set<"PRES" | "VIRT">();
  for (const s of freeSlots) {
    for (const m of s.modality ?? []) {
      const k = String(m).toUpperCase();
      if (k === "PRES" || k === "VIRT") modalityKeys.add(k);
    }
  }
  // Sin modalidad explícita: evaluar una sola cadena con todos los slots libres.
  const keysToTry: (("PRES" | "VIRT") | null)[] =
    modalityKeys.size > 0 ? [...modalityKeys] : [null];

  let entrySlot: Slot | null = null;
  const covered: ("PRES" | "VIRT")[] = [];

  for (const key of keysToTry) {
    const chain = freeSlots
      .filter((s) => {
        if (key === null) return true;
        const mods = (s.modality ?? []).map((m) => String(m).toUpperCase());
        // Slot sin modalidad o que incluye la modalidad de la cadena.
        return mods.length === 0 || mods.includes(key);
      })
      .slice()
      .sort((a, b) => wizardTimeToMin(a.startTime) - wizardTimeToMin(b.startTime));

    let cursor = selStart;
    let chainEntry: Slot | null = null;
    for (const s of chain) {
      const sStart = wizardTimeToMin(s.startTime);
      const sEnd = wizardTimeToMin(s.endTime ?? "23:59");
      if (sStart > cursor) break; // hueco: la cadena no cubre
      if (sEnd > cursor) {
        if (chainEntry === null) chainEntry = s;
        cursor = sEnd;
      }
      if (cursor >= selEnd && chainEntry) {
        if (!entrySlot) entrySlot = chainEntry;
        if (key) covered.push(key);
        break;
      }
    }
  }

  if (!entrySlot) return null;
  return {
    entrySlot,
    modalities:
      covered.length > 0
        ? [...new Set(covered)]
        : ((entrySlot.modality ?? []) as ("PRES" | "VIRT")[]),
  };
}

// Tutores cuya disponibilidad continua cubre toda la franja para una materia dada.
function getCoveringTutors(
  allSlots: Slot[],
  dayOfWeek: string,
  subject: string,
  selStart: number,
  selEnd: number,
): CoveringTutor[] {
  const day = normalizeDay(dayOfWeek);
  const byTutor: Record<string, Slot[]> = {};
  for (const s of allSlots) {
    if (normalizeDay(s.dayOfWeek) !== day || s.subject !== subject) continue;
    for (const t of s.tutorIds ?? []) {
      if (!byTutor[t]) byTutor[t] = [];
      byTutor[t].push(s);
    }
  }

  const result: CoveringTutor[] = [];
  for (const tutorId of Object.keys(byTutor)) {
    const coverage = coverageForTutor(byTutor[tutorId], selStart, selEnd);
    if (coverage) {
      result.push({
        tutorId,
        entrySlot: coverage.entrySlot,
        modalities: coverage.modalities,
      });
    }
  }
  return result;
}

// Materias con al menos un tutor que cubre por completo la franja seleccionada.
function getCoveringSubjects(
  allSlots: Slot[],
  dayOfWeek: string,
  selStart: number,
  selEnd: number,
): string[] {
  const day = normalizeDay(dayOfWeek);
  const subjects = [
    ...new Set(
      allSlots
        .filter((s) => normalizeDay(s.dayOfWeek) === day)
        .map((s) => s.subject)
        .filter(Boolean) as string[],
    ),
  ];
  return subjects.filter(
    (subj) => getCoveringTutors(allSlots, dayOfWeek, subj, selStart, selEnd).length > 0,
  );
}

export default function SchedulingWizard({ slots: initialSlots, tutorProfiles = {} }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    modality: null,
  });

  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

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

      // Evitar que el click residual cierre el popover al abrirlo
      ignoreCloseUntil.current = Date.now() + 150;

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

      // `detail.modality` llega como cadena separada por comas ("PRES", "VIRT" o
      // "PRES,VIRT"); si ofrece ambas o ninguna, se muestra la etiqueta genérica.
      const detailModalities = String(detail.modality ?? "")
        .split(",")
        .map((x: string) => x.trim().toUpperCase())
        .filter(Boolean);
      const modalityLabel =
        detailModalities.length !== 1
          ? "Presencial o Virtual"
          : detailModalities[0] === "VIRT"
            ? "Virtual"
            : "Presencial";

      sileo.action({
        title: "Franja seleccionada",
        description: (
          <span className="wizard-sileo-description">
            {`${detail.startTime} → ${detail.endTime} · ${modalityLabel}`}
          </span>
        ),
        fill: "#8751ff",
        styles: { badge: "#ffffff" },
      });

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
    setSubmitted(false);
    setSlotContext(null);
    setData({
      slot: null,
      tutorId: "",
      subject: "",
      title: "",
      description: "",
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

    // SCHEDULING-05: la modalidad nunca se adivina. Sale de la elección del
    // estudiante (paso de modalidad) o, si el slot ofrece una sola, de esa.
    const slotModalities = currentData.slot?.modality ?? [];
    const resolvedModality =
      currentData.modality ??
      (slotModalities.length === 1 ? slotModalities[0] : undefined);
    if (!resolvedModality) {
      sileo.action({
        title: "Modalidad no disponible",
        description: "No se pudo determinar la modalidad del espacio seleccionado.",
        fill: "#f35761",
        styles: { badge: "#ffffff" },
      });
      return;
    }

    // El tipo de tutoría no viaja en el body: el endpoint /individual ya lo fija.
    // (La implementación de GRUPAL tendrá su propio endpoint.)
    const sessionData = {
      tutorId: currentData.tutorId,
      subjectId: currentData.subjectId,
      availabilityId: Number(currentData.slot?.id),
      scheduledDate: scheduledDateStr,
      modality: resolvedModality,
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

    // Éxito: en lugar de cerrar de inmediato, se muestra la pantalla de confirmación.
    // La sesión queda a la espera de la confirmación del tutor (PENDING_TUTOR_CONFIRMATION).
    setSubmitted(true);
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

  // Modalidades con las que cada tutor cubre de forma continua la franja
  // (SCHEDULING-07 + SCHEDULING-05). Fuente de verdad para tarjeta y paso 4.
  const modalityByTutor: Record<string, string[]> = {};
  for (const c of coveringTutors) {
    modalityByTutor[c.tutorId] =
      c.modalities.length > 0
        ? c.modalities
        : [...(c.entrySlot.modality ?? [])];
  }

  // Siempre se muestra el paso de modalidad (paso 4), aunque solo haya una
  // opción disponible. Preferir las del tutor elegido; si no, las del slot.
  const slotModalities = (
    (data.tutorId ? modalityByTutor[data.tutorId] : null) ??
    data.slot?.modality ??
    []
  ) as ("VIRT" | "PRES")[];

  const stepImages = [StepOne.src, StepTwo.src, StepThree.src];
  const stepTitleByStep: Record<number, { highlight: string; rest: string }> = {
    1: { highlight: "Selecciona", rest: "el tutor de tu preferencia" },
    2: { highlight: "Información", rest: "adicional" },
    3: { highlight: "Selecciona", rest: "la modalidad del espacio" },
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

      <Drawer.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
        <Drawer.Portal>

          {/* ── Overlay ── */}
          <Drawer.Overlay className="wizard-overlay" />

          {/* ── Drawer principal ── */}
          <Drawer.Content className="wizard-drawer">


            {/* ── Handle de arrastre ── */}
            <div className="wizard-drawer__handle" />

            {/* ── Área de contenido scrolleable ── */}

            {submitted ? (
              <SchedulingFinish onNext={handleClose} />
            ) : (
            <>
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
                  alt={`Paso ${step} de 3`}
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
                    modalityByTutor={modalityByTutor}
                    onSelect={(tutorId) => {
                      // El slot de entrada del tutor elegido es el que se reserva
                      // (availabilityId + duración lo resuelve el backend por cadena continua).
                      const covering = coveringTutors.find((c) => c.tutorId === tutorId);
                      const selectedSlot = covering?.entrySlot ?? data.slot;
                      // Preselección si el tutor solo ofrece una modalidad; el
                      // paso 4 siempre se muestra para confirmar/elegir.
                      const tutorModalities = modalityByTutor[tutorId] ?? selectedSlot?.modality ?? [];
                      const singleModality =
                        tutorModalities.length === 1
                          ? (tutorModalities[0] as "VIRT" | "PRES")
                          : null;
                      setData((prev) => ({
                        ...prev,
                        tutorId,
                        slot: selectedSlot,
                        tutorName: tutorProfiles[tutorId]?.name ?? prev.tutorName,
                        modality: singleModality,
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
                  <ModalityStep
                    initialModality={data.modality}
                    availableModalities={slotModalities}
                    onNext={(modality) => {
                      const updatedData = { ...data, modality };
                      setData(updatedData);
                      handleSubmit(updatedData);
                    }}
                    onBack={() => setStep(2)}
                    isSubmitting={isSubmitting}
                  />
                )}
              </div>
            </div>
            </>
            )}

          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}