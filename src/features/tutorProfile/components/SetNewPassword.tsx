import "../styles/ChooseSubjects.css";
import "../styles/SetNewPassword.css";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

function getStrength(pw: string): 0 | 1 | 2 | 3 {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= MIN_LENGTH) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    return score as 0 | 1 | 2 | 3;
}

const STRENGTH_LABELS: Record<1 | 2 | 3, string> = {
    1: "Débil",
    2: "Media",
    3: "Fuerte",
};

const STRENGTH_CLASS: Record<1 | 2 | 3, string> = {
    1: "password-strength-bar--weak",
    2: "password-strength-bar--medium",
    3: "password-strength-bar--strong",
};

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7}>
            <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2.5" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7}>
            <path d="M2 2l16 16M7.5 7.7A4.5 4.5 0 0 0 10 14.5c2.485 0 4.5-2.015 4.5-4.5 0-.93-.27-1.795-.74-2.52" strokeLinecap="round" />
            <path d="M4.5 5.2C2.9 6.5 1.8 8.1 1.5 10c.7 3.4 4 6 8.5 6a9.7 9.7 0 0 0 4.5-1.1" strokeLinecap="round" />
            <path d="M10 5.5a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" />
        </svg>
    );
}

export default function SetNewPassword({ onNext, onSkip, isMandatory, isSubmitting }: { onNext: (password: string) => void; onSkip: () => void; isMandatory?: boolean; isSubmitting?: boolean }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState({ password: false, confirm: false });

    const strength = getStrength(password);

    const tooShort = password.length > 0 && password.length < MIN_LENGTH;
    const tooLong  = password.length > MAX_LENGTH;
    const lengthOk = password.length >= MIN_LENGTH && password.length <= MAX_LENGTH;
    const mismatch = confirm.length > 0 && password !== confirm;
    const matchOk  = confirm.length > 0 && password === confirm && lengthOk;

    const canContinue = lengthOk && matchOk;

    const passwordInputClass = [
        "password-input",
        touched.password && tooShort  ? "password-input--error" : "",
        touched.password && tooLong   ? "password-input--error" : "",
        touched.password && lengthOk  ? "password-input--success" : "",
    ].filter(Boolean).join(" ");

    const confirmInputClass = [
        "password-input",
        touched.confirm && mismatch  ? "password-input--error" : "",
        touched.confirm && matchOk   ? "password-input--success" : "",
    ].filter(Boolean).join(" ");

    return (
        <>
            <div className="drawer-body">
                <div className="body-header">
                    <p className="body-header-title">Establece tu nueva contraseña</p>
                    <p className="body-header-subtitle">
                        Mínimo {MIN_LENGTH} caracteres · Máximo {MAX_LENGTH} caracteres
                    </p>
                </div>

                <div className="password-form">
                    {/* ── Nueva contraseña ── */}
                    <div className="password-field">
                        <label className="password-label" htmlFor="new-password">
                            Nueva contraseña
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                className={passwordInputClass}
                                placeholder="Ingresa tu nueva contraseña"
                                value={password}
                                maxLength={MAX_LENGTH}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                            />
                            <button
                                className="password-eye-btn"
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>

                        {/* Strength bars */}
                        {password.length > 0 && (
                            <div className="password-strength">
                                <div className="password-strength-bars">
                                    {([1, 2, 3] as const).map((level) => (
                                        <div
                                            key={level}
                                            className={`password-strength-bar${strength >= level ? ` ${STRENGTH_CLASS[level]}` : ""}`}
                                        />
                                    ))}
                                </div>
                                {strength > 0 && (
                                    <span className="password-strength-label">
                                        {STRENGTH_LABELS[strength as 1 | 2 | 3]}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Validation feedback */}
                        {touched.password && tooShort && (
                            <p className="password-error">Mínimo {MIN_LENGTH} caracteres</p>
                        )}
                        {touched.password && tooLong && (
                            <p className="password-error">Máximo {MAX_LENGTH} caracteres</p>
                        )}
                        {touched.password && lengthOk && (
                            <p className="password-ok">Longitud válida</p>
                        )}
                    </div>

                    {/* ── Confirmar contraseña ── */}
                    <div className="password-field">
                        <label className="password-label" htmlFor="confirm-password">
                            Confirmar contraseña
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirm-password"
                                type={showConfirm ? "text" : "password"}
                                className={confirmInputClass}
                                placeholder="Repite tu nueva contraseña"
                                value={confirm}
                                maxLength={MAX_LENGTH}
                                onChange={(e) => setConfirm(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                            />
                            <button
                                className="password-eye-btn"
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                tabIndex={-1}
                                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                <EyeIcon open={showConfirm} />
                            </button>
                        </div>

                        {touched.confirm && mismatch && (
                            <p className="password-error">Las contraseñas no coinciden</p>
                        )}
                        {touched.confirm && matchOk && (
                            <p className="password-ok">Las contraseñas coinciden</p>
                        )}
                    </div>
                </div>

                <div className="button-row">
                    <Button className="skip-button" onClick={onSkip} disabled={isMandatory}>
                        Omitir
                    </Button>
                    <Button
                        className="next-button"
                        onClick={() => onNext(password)}
                        disabled={!canContinue || isSubmitting}
                    >
                        {isSubmitting ? "Guardando..." : "Continuar"}
                    </Button>
                </div>
            </div>
        </>
    );
}