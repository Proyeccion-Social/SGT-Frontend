import { useState } from "react";
import { sileo } from "sileo";

const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

function getPasswordError(pw: string): string {
  if (pw.length < 8)          return "Debe tener al menos 8 caracteres.";
  if (!/[A-Z]/.test(pw))      return "Debe incluir al menos una letra may\u00fascula.";
  if (!/[a-z]/.test(pw))      return "Debe incluir al menos una letra min\u00fascula.";
  if (!/\d/.test(pw))         return "Debe incluir al menos un n\u00famero.";
  if (!/[@$!%*?&#]/.test(pw)) return "Debe incluir al menos un car\u00e1cter especial (@$!%*?&#).";
  return "";
}

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
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`gs-pw-input${error ? " gs-pw-input--error" : ""}`}
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

    errors.newPw = getPasswordError(pwForm.newPw);

    if (pwForm.newPw !== pwForm.confirm)
      errors.confirm = "Las contraseñas no coinciden.";

    setPwErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    const sessionCheck = await fetch("/api/auth/check-session");
    if (!sessionCheck.ok) {
      window.location.href = "/?session_expired=true";
      return;
    }
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
          loading: { title: "Actualizando contraseña…" },
          success: { title: "Contraseña actualizada" },
          error:   { title: "No se pudo cambiar la contraseña" },
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
              <input value={user?.name ?? ""} readOnly disabled />
            </div>
            <div className="gs-field">
              <label className="gs-label">Correo electrónico</label>
              <input type="email" value={user?.email ?? ""} readOnly disabled />
            </div>
            <div className="gs-field">
              <label className="gs-label">Rol</label>
              <input value={user?.role ?? ""} readOnly disabled />
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
              <button type="submit" className="gs-submit-btn" disabled={savingPw}>
                {savingPw ? "Actualizando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
