import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import AvailabilityStep from "./scheduling/Availability";
import DetailsStep from "./scheduling/Details";
import SessionTypeStep from "./scheduling/SessionType";
import ModalityStep from "./scheduling/Modality";
import SlotPopover from "./scheduling/SlotPopover";
import type { Slot } from "../../../features/availability/services/availabilityService";
import { sileo } from "sileo";

export interface WizardData {
  slot: Slot | null;
  tutorId: string;
  tutorName:string;
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
  token : String;
}

export default function SchedulingWizard({ slots, token }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [popover, setPopover] = useState<PopoverData | null>(null); // control visual
  const [slotContext, setSlotContext] = useState<any>(null); // datos persistentes durante todo el wizard
  const [data, setData] = useState<WizardData>({
    slot: null,
    tutorId: "",
    tutorName: "",
    subject: "",
    subjectId:"",
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

    // Usar el rect del overlay seleccionado, no del slot completo
    const rect = custom.detail.overlayRect as DOMRect;

    

  // Mostrar sileo primero
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

// Pequeño delay antes de mostrar el popover
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

  // Todos los slots de ese día, materia y dentro del rango seleccionado
  const rangeSlots = slots.filter(
    (s) =>
      s.dayOfWeek === currentSlotData.dayOfWeek &&
      s.subject === subject &&
      s.startTime >= currentSlotData.startTime &&
      (s.endTime ?? "23:59") <= currentSlotData.endTime
  );

  const baseSlot = rangeSlots[0] ?? null;

  // Guardas todo el contexto del rango (por si luego quieres usar rangeSlots)
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

// Y en handleClose también limpia slotContext
const handleClose = () => {
  setOpen(false);
  setStep(1);
  setSlotContext(null); // limpiar al finalizar o cancelar
  setData({
    slot: null, tutorId: "", subject: "",
    title: "", description: "", sessionType: null,tutorName: "",
subjectId:"", modality: null,
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
  DOMINGO: 7, // Agregado para evitar errores de undefined
};

// 1. Obtenemos el día del contexto o fallback a LUNES
const rawDay = slotContext?.dayOfWeek ?? "LUNES";

// 2. Normalizamos el texto (Pasar a MAYÚSCULAS y quitar tildes como "MIÉRCOLES")
const normalizedDay = rawDay
  .toUpperCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const today = new Date();
const todayDow = today.getDay() === 0 ? 7 : today.getDay();

// 3. Obtenemos el target o fallback a LUNES si el input no coincide con el mapa
const targetDow = dayMap[normalizedDay] ?? 1;

// 4. Cálculo de la diferencia de días
const diff = targetDow >= todayDow
  ? targetDow - todayDow
  : 7 - todayDow + targetDow;

// 5. Creación de la nueva fecha
const scheduledDate = new Date(today);
scheduledDate.setDate(today.getDate() + diff);

// 6. Generación del string (Formato YYYY-MM-DD en UTC)
const scheduledDateStr = scheduledDate.toISOString().split("T")[0];

    const [startH, startM] = (slotContext?.startTime ?? "00:00").split(":").map(Number);
    const [endH, endM] = (slotContext?.endTime ?? "00:00").split(":").map(Number);
    const durationHours = Math.round(((endH * 60 + endM) - (startH * 60 + startM)) / 60 * 2) / 2;
    // Ejemplo: 09:00 → 10:30 = 1.5 horas

    const sessionData = {
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      availabilityId: data.slot?.id,
      scheduledDate: scheduledDateStr, 
      modality: data.modality ?? slotContext?.modality ?? "PRES",
      durationHours: durationHours,
      title: data.title,
      description: data.description,
    };


const res = await fetch('/api/sessions/scheduleapi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(sessionData),
});

if (!res.ok) {
  const error = await res.json();
  throw new Error(error.message || 'Error al agendar sesión');
}

const result = await res.json();

    sileo.action({
      title: "Tutoría agendada",
      description: "Tu espacio ha sido reservado exitosamente.",
      fill: "#58d68d",
      styles: { badge: "#ffffff" } ,
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

  // Tutores disponibles para el slot y materia seleccionados
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

  // Si cualquier slot tiene modality null, pides el paso de modalidad;
  // en tu modelo original ya dependías de data.slot.modality.
  const needsModality = data.slot?.modality === null;

  // Calcular paso máximo según condicional
  const totalSteps = needsModality ? 4 : 3;

  return (
    <>
      {/* Popover de materias */}
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
          <Drawer.Overlay style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)", zIndex: 40
          }} />
          <Drawer.Content style={{
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            top: "5%",
            background: "#fff",
            borderRadius: "16px 16px 0 0",
            zIndex: 50,
            outline: "none",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "95vh",      // altura siempre fija
          }}>
            {/* Barra degradado */}
            <div style={{
              height: "6px",
              background: "linear-gradient(90deg, #a78bfa, #7c3aed)",
              borderRadius: "16px 16px 0 0",
              flexShrink: 0,
            }} />

            {/* Handle */}
            <div style={{
              width: "48px", height: "4px", background: "#e5e7eb",
              borderRadius: "999px", margin: "12px auto 0",
              flexShrink: 0,
            }} />

            {/* Contenido centrado vertical y horizontalmente */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
              padding: "32px 48px",
            }}>
              <div style={{ width: "100%", maxWidth: "800px" }}>
                {step === 1 && <AvailabilityStep tutorIds={tutorIds}
                            slot={data.slot}
                            subject={data.subject}
                            token={token}
                            onSelect={(tutorId) => {
                              setData((prev) => ({ ...prev, tutorId }));
                              setStep(2);
                            }} />}
                {step === 2 && <DetailsStep onNext={(title, description) => {
                              setData((prev) => ({ ...prev, title, description }));
                              setStep(3);
                            }}
                            onBack={() => setStep(1)} />}
                {step === 3 && <SessionTypeStep onNext={(sessionType) => {
                              setData((prev) => ({ ...prev, sessionType }));
                              if (needsModality) setStep(4);
                              else handleSubmit()
                            }}
                            onBack={() => setStep(2)} />}
                {step === 4 && needsModality && <ModalityStep onNext={(modality) => {
                              setData((prev) => ({ ...prev, modality }));
                              handleSubmit()
                            }}
                            onBack={() => setStep(3)} />}
              </div>
            </div>

            {/* Indicador de paso — siempre al fondo */}
            <div style={{
              padding: "16px", textAlign: "center",
              fontSize: "14px", color: "#6b7280",
              borderTop: "1px solid #f3f4f6",
              flexShrink: 0,
            }}>
              Paso {["1️⃣","2️⃣","3️⃣","4️⃣"][step - 1]}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}