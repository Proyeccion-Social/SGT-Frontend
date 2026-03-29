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
}

export default function SchedulingWizard({ slots }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [popover, setPopover] = useState<PopoverData | null>(null); // control visual
  const [slotContext, setSlotContext] = useState<any>(null); // datos persistentes durante todo el wizard
  const [data, setData] = useState<WizardData>({
    slot: null,
    tutorId: "",
    subject: "",
    title: "",
    description: "",
    sessionType: null,
    modality: null,
  });

  useEffect(() => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    console.log("detail completo:", custom.detail);

    const matchingSlots = slots.filter(
      (s) =>
        s.dayOfWeek === custom.detail.dayOfWeek &&
        s.startTime <= custom.detail.startTime &&
        (s.endTime ?? "23:59") >= custom.detail.endTime
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
  const matchingSlot = slots.find(
    (s) =>
      s.dayOfWeek === popover?.slotData.dayOfWeek &&
      s.startTime <= popover?.slotData.startTime &&
      (s.endTime ?? "23:59") >= popover?.slotData.endTime &&
      s.subject === subject
  );

  // Guardar contexto completo para todo el wizard
  setSlotContext(popover?.slotData);
  
  setData((prev) => ({ ...prev, slot: matchingSlot || null, subject }));
  setPopover(null); // solo cierra visualmente
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
    title: "", description: "", sessionType: null, modality: null,
  });
};

  // Tutores disponibles para el slot y materia seleccionados
  const availableSlots = slots.filter(
    (s) =>
      s.dayOfWeek === data.slot?.dayOfWeek &&
      s.startTime === data.slot?.startTime &&
      s.subject === data.subject
  );

  const tutorIds = [...new Set(availableSlots.flatMap((s) => s.tutorIds || []))];
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
                              else handleClose(); // aquí irá el submit final
                            }}
                            onBack={() => setStep(2)} />}
                {step === 4 && needsModality && <ModalityStep onNext={(modality) => {
                              setData((prev) => ({ ...prev, modality }));
                              handleClose(); // aquí irá el submit final
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