import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSettingsDialog } from "@/features/profileSettings/components/islands/ProfileSettingsDialog";
import { TutorProfileDialog } from "@/features/profileSettings/components/islands/TutorProfileDialog";
import type { TutorProfileDialogProps } from "@/features/profileSettings/components/islands/TutorProfileDialog";

import generalIconSrc    from "../../assets/general.svg?url";
import materiasIconSrc   from "../../assets/materias.svg?url";
import contrasenaIconSrc from "../../assets/contraseña.svg?url";
import logoutIconSrc     from "../../assets/logout.svg?url";
import horasIconSrc      from "@/features/profileSettings/assets/horas.svg?url";

import "../../styles/userMenuDropdown.css";

type DialogTarget = {
  view: "general" | "preferences";
  generalTab?: "info" | "password";
  preferencesTab?: "materias" | "modalidad";
};

export default function UserMenuDropdown() {
  const { user, clearUser } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>({ view: "general" });

  const [tutorDialogOpen, setTutorDialogOpen]     = useState(false);
  const [tutorView, setTutorView]                 = useState<TutorProfileDialogProps["initialView"]>("general");
  const [tutorGeneralMode, setTutorGeneralMode]   = useState<"info" | "password">("info");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  function openDialog(target: DialogTarget) {
    setDialogTarget(target);
    setDialogOpen(true);
  }

  function openTutorDialog(
    view: TutorProfileDialogProps["initialView"],
    generalMode: "info" | "password" = "info",
  ) {
    setTutorView(view);
    setTutorGeneralMode(generalMode);
    setTutorDialogOpen(true);
  }

  function handleLogout() {
    clearUser();
    window.location.href = "/login";
  }

  const isStudent = user?.role === "STUDENT";
  const isTutor = user?.role === "TUTOR";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="umd-trigger" aria-label="Menú de usuario">
            <span className="umd-trigger__initials">{initials}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="umd-content w-72">
          {/* Sección 1: Info del usuario */}
          <div className="umd-user-info">
            <span className="umd-user-info__avatar">{initials}</span>
            <div className="umd-user-info__details">
              <span className="umd-user-info__name">{user?.name ?? "—"}</span>
              <span className="umd-user-info__email">{user?.email ?? "—"}</span>
              <span className="umd-user-info__role">{user?.role ?? "—"}</span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Sección 2: Mi cuenta */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            {isStudent && (
              <>
                <DropdownMenuItem
                  onSelect={() => openDialog({ view: "general", generalTab: "info" })}
                >
                  <img src={generalIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    openDialog({ view: "preferences", preferencesTab: "materias" })
                  }
                >
                  <img src={materiasIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
                  Mis intereses
                </DropdownMenuItem>
              </>
            )}
            {isTutor && (
              <>
                <DropdownMenuItem onSelect={() => openTutorDialog("general")}>
                  <img src={generalIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openTutorDialog("hours")}>
                  <img src={horasIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
                  Horas semanales
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Sección 3: Seguridad */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Seguridad</DropdownMenuLabel>
            {isStudent && (
              <DropdownMenuItem
                onSelect={() => openDialog({ view: "general", generalTab: "password" })}
              >
                <img src={contrasenaIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
                Cambiar contraseña
              </DropdownMenuItem>
            )}
            {isTutor && (
              <DropdownMenuItem onSelect={() => openTutorDialog("general", "password")}>
                <img src={contrasenaIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
                Cambiar contraseña
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Sección 4: Cerrar sesión */}
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={handleLogout} className="umd-logout-item">
              <img src={logoutIconSrc} alt="" aria-hidden="true" className="umd-item-icon" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialView={dialogTarget.view}
        initialGeneralTab={dialogTarget.generalTab}
      />

      <TutorProfileDialog
        open={tutorDialogOpen}
        onOpenChange={setTutorDialogOpen}
        initialView={tutorView}
        initialGeneralMode={tutorGeneralMode}
        calendarHref="/history"
      />
    </>
  );
}
