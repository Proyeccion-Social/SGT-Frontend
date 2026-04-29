import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

import generalIconSrc   from "../../assets/general.svg?url";
import contrasenaIconSrc from "../../assets/contraseña.svg?url";
import ojoSrc            from "../../assets/ojo.svg?url";
import ojoOcultoSrc      from "../../assets/ojo-oculto.svg?url";
import "../../styles/sidebar.css";
import "../../styles/generalSettings.css";

type GeneralSubTab = "info" | "password";

// ─── Sidebar Button ───────────────────────────────────────────────────────────

interface SidebarButtonProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function SidebarButton({ icon, label, selected, onClick }: SidebarButtonProps) {
  return (
    <button
      type="button"
      className={`ps-sidebar-btn${selected ? " ps-sidebar-btn--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <img src={icon} alt="" aria-hidden="true" className="ps-sidebar-btn__icon" />
      <span className="ps-sidebar-btn__label">{label}</span>
    </button>
  );
}

// ─── Password Field ───────────────────────────────────────────────────────────

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

function PasswordField({ id, label, value, onChange, error, placeholder, autoComplete }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="gs-field">
      <label htmlFor={id} className="gs-label">{label}</label>
      <div className="gs-input-wrapper">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="gs-pw-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? (
            <img src={ojoOcultoSrc} width="16" height="16" alt="" aria-hidden="true" className="gs-pw-icon" />
          ) : (
            <img src={ojoSrc} width="16" height="16" alt="" aria-hidden="true" className="gs-pw-icon" />
          )}
        </button>
      </div>
      {error && <span className="gs-error">{error}</span>}
    </div>
  );
}

// ─── General Settings View ────────────────────────────────────────────────────

interface GeneralSettingsViewProps {
  user: { name: string; email: string; role: string } | null;
  initialTab?: GeneralSubTab;
}

export function GeneralSettingsView({ user, initialTab }: GeneralSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<GeneralSubTab>(initialTab ?? "info");

  const [pwForm, setPwForm]     = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({ current: "", newPw: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  async function handleSavePassword() {
    const errors = { current: "", newPw: "", confirm: "" };

    if (!PW_REGEX.test(pwForm.newPw))
      errors.newPw = "Debe tener mayúscula, minúscula, número y carácter especial (@$!%*?&).";

    if (pwForm.newPw !== pwForm.confirm)
      errors.confirm = "Las contraseñas no coinciden.";

    setPwErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingPw(true);
    await sileo
      .promise(
        fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword:    pwForm.current,
            newPassword:        pwForm.newPw,
            confirmNewPassword: pwForm.confirm,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message ?? "Error al cambiar la contraseña");
          }
          return res;
        }),
        {
          loading: { title: "Actualizando contraseña…", fill: "#8751ff" },
          success: { title: "Contraseña actualizada",   fill: "#58d68d" },
          error:   { title: "No se pudo cambiar la contraseña", fill: "#f35761" },
        },
      )
      .then(() => setPwForm({ current: "", newPw: "", confirm: "" }))
      .finally(() => setSavingPw(false));
  }

  return (
    <div className="gs-view">
      <aside className="ps-sidebar">
        <SidebarButton
          icon={generalIconSrc}
          label="General"
          selected={activeTab === "info"}
          onClick={() => setActiveTab("info")}
        />
        <SidebarButton
          icon={contrasenaIconSrc}
          label="Contraseña"
          selected={activeTab === "password"}
          onClick={() => setActiveTab("password")}
        />
      </aside>

      <main className="gs-main">
        {activeTab === "info" && (
          <div className="gs-form">
            <div className="gs-field">
              <label className="gs-label">Nombre completo</label>
              <Input value={user?.name ?? ""} readOnly disabled />
            </div>
            <div className="gs-field">
              <label className="gs-label">Correo electrónico</label>
              <Input type="email" value={user?.email ?? ""} readOnly disabled />
            </div>
            <div className="gs-field">
              <label className="gs-label">Rol</label>
              <Input value={user?.role ?? ""} readOnly disabled />
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <form className="gs-form" onSubmit={(e) => { e.preventDefault(); handleSavePassword(); }}>
            <PasswordField
              id="gs-pw-current"
              label="Contraseña antigua"
              value={pwForm.current}
              onChange={(val) => setPwForm((f) => ({ ...f, current: val }))}
              error={pwErrors.current}
              placeholder="Tu contraseña actual"
              autoComplete="current-password"
            />
            <PasswordField
              id="gs-pw-new"
              label="Nueva contraseña"
              value={pwForm.newPw}
              onChange={(val) => setPwForm((f) => ({ ...f, newPw: val }))}
              error={pwErrors.newPw}
              placeholder="Mín. 8 car., mayúscula, número y símbolo"
              autoComplete="new-password"
            />
            <PasswordField
              id="gs-pw-confirm"
              label="Confirmar contraseña nueva"
              value={pwForm.confirm}
              onChange={(val) => setPwForm((f) => ({ ...f, confirm: val }))}
              error={pwErrors.confirm}
              placeholder="Repite tu nueva contraseña"
              autoComplete="new-password"
            />
            <div className="gs-form-actions">
              <Button type="submit" disabled={savingPw}>
                {savingPw ? "Actualizando..." : "Guardar"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
