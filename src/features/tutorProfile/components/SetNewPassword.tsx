import "../styles/ChooseSubjects.css";
import "../styles/SetNewPassword.css";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { StepHandle } from "./ChooseSubjects";
import {
    getPasswordStrength as getStrength,
    PASSWORD_SPECIAL_CHARS_REGEX,
    MIN_PASSWORD_LENGTH as MIN_LENGTH,
    MAX_PASSWORD_LENGTH as MAX_LENGTH,
} from "@/lib/passwordPolicy";

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

const SetNewPassword = forwardRef<StepHandle, { onNext: (password: string, phone: string) => void; onCanContinueChange?: (canContinue: boolean) => void }>(({ onNext, onCanContinueChange }, ref) => {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState({ password: false, confirm: false, phone: false });

    const strength = getStrength(password);

    const hasMinLength = password.length >= MIN_LENGTH;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = PASSWORD_SPECIAL_CHARS_REGEX.test(password);

    const tooShort = password.length > 0 && !hasMinLength;
    const tooLong  = password.length > MAX_LENGTH;
    const lengthOk = hasMinLength && password.length <= MAX_LENGTH;
    const mismatch = confirm.length > 0 && password !== confirm;
    const matchOk  = confirm.length > 0 && password === confirm && lengthOk;
    const phoneOk  = phone.trim().length >= 10;

    const canContinue = phoneOk && (password.length === 0 || (lengthOk && strength === 3 && matchOk));

    useImperativeHandle(ref, () => ({
        triggerContinue: () => onNext(password, phone),
    }), [password, phone, onNext]);

    useEffect(() => {
        onCanContinueChange?.(canContinue);
    }, [canContinue, onCanContinueChange]);

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

    const phoneInputClass = [
        "password-input",
        touched.phone && !phoneOk ? "password-input--error" : "",
        touched.phone && phoneOk  ? "password-input--success" : "",
    ].filter(Boolean).join(" ");

    return (
        <>
            <div className="drawer-body">
                <div className="body-header">
                    <p className="body-header-title">Datos personales y seguridad</p>
                    <p className="body-header-subtitle">
                        Actualiza tu teléfono o cambia tu contraseña
                    </p>
                </div>

                <div className="password-form password-form--columns">
                    {/* ── Left column: Phone ── */}
                    <div className="password-form-column">
                        <div className="password-field">
                            <label className="password-label" htmlFor="phone">
                                Número de teléfono
                            </label>
                            <div className="password-input-wrapper">
                                <input
                                    id="phone"
                                    type="tel"
                                    className={phoneInputClass}
                                    placeholder="Ingresa tu número de teléfono"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                />
                            </div>
                            {touched.phone && !phoneOk && (
                                <p className="password-error">Ingresa un número válido (10 dígitos)</p>
                            )}
                        </div>
                    </div>

                    {/* ── Right column: Password ── */}
                    <div className="password-form-column">
                        <div className="password-field">
                            <label className="password-label" htmlFor="new-password">
                                Nueva contraseña <span className="password-optional">(opcional)</span>
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
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>

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

                            {touched.password && password.length > 0 && (
                                <div className="password-errors-list" style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {!hasMinLength && (
                                        <p className="password-error">Mínimo {MIN_LENGTH} caracteres</p>
                                    )}
                                    {tooLong && (
                                        <p className="password-error">Máximo {MAX_LENGTH} caracteres</p>
                                    )}
                                    {(!hasUppercase || !hasLowercase) && (
                                        <p className="password-error">Incluye al menos una mayúscula y una minúscula</p>
                                    )}
                                    {!hasDigit && (
                                        <p className="password-error">Incluye al menos un número</p>
                                    )}
                                    {!hasSpecial && (
                                        <p className="password-error">Incluye al menos un carácter especial (ej. @, #, ., ,, ;, !)</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {password.length > 0 && (
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
                        )}
                    </div>
                </div>
            </div>
        </>
    );
});

export default SetNewPassword;