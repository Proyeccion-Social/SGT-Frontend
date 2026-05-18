import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { BasicInformation } from "./BasicInformation";
import { FormGeneral } from "./FormGeneral";
import { HoursLimit } from "./HoursLimit";
import { sileo } from "sileo";

import salirIconSrc      from "../../assets/salir.svg?url";
import settingsIconSrc   from "../../assets/settings.svg?url";
import horasIconSrc      from "../../assets/horas.svg?url";
import calendarioIconSrc from "../../assets/calendario.svg?url";
import activacionIconSrc from "../../assets/activacion.svg?url";
import materiasIconSrc   from "../../assets/materias.svg?url";
import { TutorSubjectsView } from "./TutorSubjectsView";
import "../../styles/profileSettings.css";
import "../../styles/tutorProfile.css";

type TutorView = "general" | "hours" | "subjects";

export interface TutorProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: TutorView;
  initialGeneralMode?: "info" | "password";
}

export function TutorProfileDialog({
  open,
  onOpenChange,
  initialView,
  initialGeneralMode,
}: TutorProfileDialogProps) {
  const [activeView, setActiveView] = useState<TutorView>(initialView ?? "general");
  const [phone, setPhone]           = useState<string | null>(null);
  const [tutorSubjectIds, setTutorSubjectIds] = useState<string[]>([]);
  const [toggling, setToggling]     = useState(false);
  const { user, setUser } = useAuthStore();

  const isActive = user?.status === "ACTIVE";

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "T";

  useEffect(() => {
    if (!open) return;
    setActiveView(initialView ?? "general");
    fetch("/api/auth/check-session").then((check) => {
      if (!check.ok) {
        window.location.href = "/?session_expired=true";
        return;
      }
      fetch("/api/settings/tutor-profile")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { 
          setPhone(data?.phone ?? null); 
          if (data?.subjects && Array.isArray(data.subjects)) {
            setTutorSubjectIds(data.subjects.map((s: { id: string }) => s.id));
          } else if (data?.subject_ids && Array.isArray(data.subject_ids)) {
            setTutorSubjectIds(data.subject_ids);
          } else if (data?.subjectIds && Array.isArray(data.subjectIds)) {
            setTutorSubjectIds(data.subjectIds);
          }
        })
        .catch(() => { setPhone(null); setTutorSubjectIds([]); });
    });
  }, [open, initialView]);

  async function handleToggleActive() {
    if (toggling || !user) return;
    const sessionCheck = await fetch("/api/auth/check-session");
    if (!sessionCheck.ok) {
      window.location.href = "/?session_expired=true";
      return;
    }
    const next = !isActive;
    setToggling(true);
    await sileo
      .promise(
        fetch("/api/settings/tutor-active", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: next }),
        }).then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message ?? "Error al cambiar el estado");
          }
          return res;
        }),
        {
          loading: { title: next ? "Activando cuenta…"   : "Desactivando cuenta…", fill: "#8751ff" },
          success: { title: next ? "Cuenta activada"     : "Cuenta desactivada",   fill: next ? "#2ecc71" : "#f35761" },
          error:   { title: "No se pudo cambiar el estado",                         fill: "#f35761" },
        },
      )
      .then(() => {
        setUser({ ...user, status: next ? "ACTIVE" : "INACTIVE" });
      })
      .finally(() => setToggling(false));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent
        className="tp-dialog"
        style={{
          width: 800,
          maxWidth: 800,
          height: 550,
          maxHeight: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
        showCloseButton={false}
        id="profileViewTutorTUTORIAL"
        
      >
        <DialogClose asChild>
          <button type="button" className="ps-close-btn" aria-label="Cerrar">
            <img src={salirIconSrc} alt="" aria-hidden="true" />
          </button>
        </DialogClose>

        <DialogHeader className="ps-header">
          <DialogTitle className="ps-title">
            <span className="ps-title-black">Información de</span>{" "}
            <span className="ps-title-purple">mi perfil</span>
          </DialogTitle>
          <DialogDescription className="ps-description">
            Revisa tu información personal y actualiza si es necesario
          </DialogDescription>
        </DialogHeader>

        <div className="tp-body">
          <BasicInformation />
          <div className="tp-panel">
            {activeView === "general" && <FormGeneral user={user} initialMode={initialGeneralMode} initialPhone={phone ?? undefined} />}
            {activeView === "hours"   && <HoursLimit />}
            {activeView === "subjects" && <TutorSubjectsView initialSubjectIds={tutorSubjectIds} onSuccess={() => onOpenChange(false)} />}
          </div>
        </div>

        <nav className="tp-bottom" aria-label="Navegación del perfil de tutor">
          <div className="tp-bottom-inner">
            <button
              id="disponibilidadTutorTUTORIAL"
              type="button"
              className="tp-nav-icon-btn tp-nav-icon-btn--calendar"
              aria-label="Gestionar disponibilidad"
              onClick={() => {
                onOpenChange(false);
                window.dispatchEvent(new Event("open-tutor-calendar-dialog"));
              }}
            >
              <img src={calendarioIconSrc} alt="" aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`tp-nav-raw${activeView === "general" ? " tp-nav-active" : ""}`}
              onClick={() => setActiveView("general")}
              aria-label="Configuración general"
              aria-pressed={activeView === "general"}
            >
              <img src={settingsIconSrc} alt="" aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`tp-nav-raw${activeView === "subjects" ? " tp-nav-active" : ""}`}
              onClick={() => setActiveView("subjects")}
              aria-label="Materias"
              aria-pressed={activeView === "subjects"}
            >
              <img src={materiasIconSrc} alt="" aria-hidden="true" />
            </button>

            <div className="ps-avatar-circle">
              <span className="ps-avatar-fallback">{initials}</span>
            </div>

            <button
              id="horasDispTutorTUTORIAL"
              type="button"
              className={`tp-nav-raw${activeView === "hours" ? " tp-nav-active" : ""}`}
              onClick={() => setActiveView("hours")}
              aria-label="Horas"
              aria-pressed={activeView === "hours"}
            >
              <img src={horasIconSrc} alt="" aria-hidden="true" />
            </button>

            <button
              id="activarCuentaTutorTUTORIAL"
              type="button"
              className={`tp-nav-icon-btn tp-nav-icon-btn--activacion${isActive ? "" : " tp-nav-icon-btn--inactive"}`}
              onClick={handleToggleActive}
              disabled={toggling}
              aria-label={isActive ? "Desactivar cuenta" : "Activar cuenta"}
              aria-pressed={isActive}
            >
              <img src={activacionIconSrc} alt="" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
