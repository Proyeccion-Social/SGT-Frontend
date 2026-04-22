import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";

import { GeneralSettingsView } from "./GeneralSettingsView";
import { PreferencesView } from "./PreferencesView";

import favoritoIconSrc from "../../assets/favorito.svg?url";
import salirIconSrc from "../../assets/salir.svg?url";
import settingsIconSrc from "../../assets/settings.svg?url";
import "../../styles/profileSettings.css";

type ActiveView = "general" | "preferences";

export interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsDialog({ open, onOpenChange }: ProfileSettingsDialogProps) {
  const [activeView, setActiveView] = useState<ActiveView>("general");
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="ps-dialog"
        style={{
          width: 800,
          maxWidth: 800,
          height: 600,
          maxHeight: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          overflow: "hidden",
        }}
        showCloseButton={false}
      >
        {/* Botón de cierre custom — mitad dentro, mitad fuera en esquina diagonal */}
        <DialogClose asChild>
          <button type="button" className="ps-close-btn" aria-label="Cerrar">
            <img src={salirIconSrc} alt="" aria-hidden="true" />
          </button>
        </DialogClose>
        {/* HEADER */}
        <DialogHeader className="ps-header">
          <DialogTitle className="ps-title">
            <span className="ps-title-black">Informacion de</span>{" "}
            <span className="ps-title-purple">mi perfil</span>
          </DialogTitle>
          <DialogDescription className="ps-description">
            Revisa tu información persona y actualiza si es necesario
          </DialogDescription>
        </DialogHeader>

        {/* CONTENT — renderiza la view activa */}
        <div className="ps-content">
          {activeView === "general" && <GeneralSettingsView user={user} />}
          {activeView === "preferences" && <PreferencesView />}
        </div>

        {/* BOTTOM NAV */}
        <nav className="ps-bottom" aria-label="Navegación del perfil">
          <div className="ps-bottom-inner">
            <button
              type="button"
              className={`ps-nav-btn ps-nav-btn--raw${activeView === "general" ? " ps-nav-btn--active" : ""}`}
              onClick={() => setActiveView("general")}
              aria-label="Configuración general"
              aria-pressed={activeView === "general"}
            >
              <img src={settingsIconSrc} alt="" aria-hidden="true" />
            </button>

            <div className="ps-avatar-circle">
              {/* TODO: mostrar img de perfil cuando esté disponible en el store */}
              <span className="ps-avatar-fallback">{initials}</span>
            </div>

            <button
              type="button"
              className={`ps-nav-btn ps-nav-btn--raw ps-nav-btn--preferences${activeView === "preferences" ? " ps-nav-btn--active" : ""}`}
              onClick={() => setActiveView("preferences")}
              aria-label="Preferencias"
              aria-pressed={activeView === "preferences"}
            >
              <img src={favoritoIconSrc} alt="" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
