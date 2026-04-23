import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import generalIconSrc from "../../assets/general.svg?url";
import contrasenaIconSrc from "../../assets/contraseña.svg?url";
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
      className={`gs-sidebar-btn${selected ? " gs-sidebar-btn--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <img src={icon} alt="" aria-hidden="true" className="gs-sidebar-btn__icon" />
      <span className="gs-sidebar-btn__label">{label}</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
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

  // Info form
  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({ current: "", newPw: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  function handleSaveInfo() {
    if (!name.trim() || name.trim().length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    setNameError("");
    setSavingInfo(true);

    // TODO: llamar BFF para actualizar nombre de perfil
    // fetch('/api/bff/profile', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name: name.trim() }),
    // })
    //   .then(res => res.json())
    //   .then(() => { /* actualizar store con nuevo nombre */ })
    //   .finally(() => setSavingInfo(false));

    setTimeout(() => setSavingInfo(false), 800);
  }

  function handleSavePassword() {
    const errors = { current: "", newPw: "", confirm: "" };
    if (!pwForm.current) errors.current = "Campo requerido.";
    if (!pwForm.newPw || pwForm.newPw.length < 8) errors.newPw = "Mínimo 8 caracteres.";
    if (pwForm.newPw !== pwForm.confirm) errors.confirm = "Las contraseñas no coinciden.";
    setPwErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingPw(true);

    // TODO: llamar BFF para cambiar contraseña
    // fetch('/api/bff/profile/password', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
    // })
    //   .then(res => res.json())
    //   .finally(() => setSavingPw(false));

    setTimeout(() => {
      setSavingPw(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
    }, 800);
  }

  return (
    <div className="gs-view">
      <aside className="gs-sidebar">
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
          <form className="gs-form" onSubmit={(e) => { e.preventDefault(); handleSaveInfo(); }}>
            <div className="gs-field">
              <label htmlFor="gs-name" className="gs-label">Nombre completo</label>
              <Input
                id="gs-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                aria-invalid={!!nameError}
              />
              {nameError && <span className="gs-error">{nameError}</span>}
            </div>

            <div className="gs-field">
              <label htmlFor="gs-email" className="gs-label">Correo electrónico</label>
              <Input
                id="gs-email"
                type="email"
                value={user?.email ?? ""}
                disabled
                readOnly
              />
            </div>

            <div className="gs-field">
              <label htmlFor="gs-role" className="gs-label">Rol</label>
              <Input
                id="gs-role"
                type="text"
                value={user?.role ?? ""}
                disabled
                readOnly
              />
            </div>

            <div className="gs-form-actions">
              <Button type="submit" disabled={savingInfo}>
                {savingInfo ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
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
              placeholder="Mínimo 8 caracteres"
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
