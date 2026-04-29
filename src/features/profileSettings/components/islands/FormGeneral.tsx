import { useState } from "react";
import { Input } from "@/components/ui/input";
import { sileo } from "sileo";
import ojoSrc      from "../../assets/ojo.svg?url";
import ojoOcultoSrc from "../../assets/ojo-oculto.svg?url";
import "../../styles/formGeneral.css";

const PHONE_REGEX = /^\d{10}$/;
const PW_REGEX    = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

interface FormGeneralProps {
  user: { name: string; email: string } | null;
  initialMode?: "info" | "password";
}

// ─── Password field with visibility toggle ────────────────

interface PwFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

function PwField({ id, label, value, onChange, error, placeholder, autoComplete }: PwFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="fg-field">
      <label htmlFor={id} className="fg-label">{label}</label>
      <div className="fg-input-wrapper">
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
          className="fg-pw-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? (
            <img src={ojoOcultoSrc} width="16" height="16" alt="" aria-hidden="true" className="fg-pw-icon" />
          ) : (
            <img src={ojoSrc} width="16" height="16" alt="" aria-hidden="true" className="fg-pw-icon" />
          )}
        </button>
      </div>
      {error && <span className="fg-error">{error}</span>}
    </div>
  );
}

// ─── FormGeneral ──────────────────────────────────────────

export function FormGeneral({ user, initialMode = "info" }: FormGeneralProps) {
  const [mode, setMode] = useState<"info" | "password">(initialMode);

  const [phone, setPhone]         = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [pwForm, setPwForm]     = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({ current: "", newPw: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  function handleSaveInfo() {
    if (!PHONE_REGEX.test(phone)) {
      setPhoneError("El número debe tener exactamente 10 dígitos.");
      return;
    }
    setPhoneError("");
    setSavingInfo(true);
    // TODO: BFF endpoint para actualizar teléfono
    setTimeout(() => setSavingInfo(false), 800);
  }

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
      .then(() => {
        setPwForm({ current: "", newPw: "", confirm: "" });
        setMode("info");
      })
      .finally(() => setSavingPw(false));
  }

  return (
    <div className="fg-card">
      <div className="fg-body">
        {mode === "info" ? (
          <>
            <div className="fg-field">
              <label className="fg-label">Nombre completo</label>
              <Input value={user?.name ?? ""} readOnly disabled />
            </div>
            <div className="fg-field">
              <label className="fg-label">Correo electrónico</label>
              <Input type="email" value={user?.email ?? ""} readOnly disabled />
            </div>
            <div className="fg-field">
              <label htmlFor="fg-phone" className="fg-label">Número de teléfono</label>
              <Input
                id="fg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 dígitos"
                aria-invalid={!!phoneError}
              />
              {phoneError && <span className="fg-error">{phoneError}</span>}
            </div>
          </>
        ) : (
          <>
            <PwField
              id="fg-pw-current"
              label="Contraseña antigua"
              value={pwForm.current}
              onChange={(v) => setPwForm((f) => ({ ...f, current: v }))}
              error={pwErrors.current}
              placeholder="Tu contraseña actual"
              autoComplete="current-password"
            />
            <PwField
              id="fg-pw-new"
              label="Nueva contraseña"
              value={pwForm.newPw}
              onChange={(v) => setPwForm((f) => ({ ...f, newPw: v }))}
              error={pwErrors.newPw}
              placeholder="Mín. 8 car., mayúscula, número y símbolo"
              autoComplete="new-password"
            />
            <PwField
              id="fg-pw-confirm"
              label="Confirmar contraseña"
              value={pwForm.confirm}
              onChange={(v) => setPwForm((f) => ({ ...f, confirm: v }))}
              error={pwErrors.confirm}
              placeholder="Repite tu nueva contraseña"
              autoComplete="new-password"
            />
          </>
        )}
      </div>

      <div className="fg-actions">
        {mode === "info" ? (
          <>
            <button type="button" className="tp-btn" onClick={() => setMode("password")}>
              Cambiar contraseña
            </button>
            <button
              type="button"
              className="tp-btn"
              onClick={handleSaveInfo}
              disabled={savingInfo}
            >
              {savingInfo ? "Guardando…" : "Guardar"}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="tp-btn" onClick={() => setMode("info")}>
              Volver
            </button>
            <button
              type="button"
              className="tp-btn"
              onClick={handleSavePassword}
              disabled={savingPw}
            >
              {savingPw ? "Guardando…" : "Guardar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
