import "./ChangePasswordForm.css";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { sileo } from "sileo";
import eyeNormal from "../assets/icons/eye-normal.svg";
import eyeLabeled from "../assets/icons/eye-labeled.svg";

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
    return <img src={open ? eyeNormal.src : eyeLabeled.src} alt="" width={20} height={20} />;
}

export default function ChangePasswordForm() {
    const user = useAuthStore((s) => s.user);
    const requiresPasswordChange = useAuthStore((s) => s.requiresPasswordChange);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState({ current: false, newPw: false, confirm: false });

    useEffect(() => {
        if (!requiresPasswordChange) {
            window.location.href = "/dashboard";
        }
    }, [requiresPasswordChange]);

    const strength = getStrength(newPassword);

    const currentEmpty = touched.current && currentPassword.length === 0;
    const tooShort = newPassword.length > 0 && newPassword.length < MIN_LENGTH;
    const tooLong = newPassword.length > MAX_LENGTH;
    const lengthOk = newPassword.length >= MIN_LENGTH && newPassword.length <= MAX_LENGTH;
    const mismatch = confirm.length > 0 && newPassword !== confirm;
    const matchOk = confirm.length > 0 && newPassword === confirm && lengthOk;

    const canSubmit =
        currentPassword.length > 0 &&
        lengthOk &&
        strength === 3 &&
        matchOk &&
        !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);

        try {
            await sileo.promise(
                fetch("/api/auth/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmNewPassword: confirm,
                    }),
                }).then(async (res) => {
                    if (!res.ok) {
                        const body = await res.json().catch(() => null);
                        throw new Error(body?.message ?? "Error al cambiar la contraseña");
                    }
                    return res;
                }),
                {
                    loading: { title: "Cambiando contraseña...", fill: "#8751ff" },
                    success: { title: "Contraseña actualizada", fill: "#58d68d" },
                    error: { title: "Error al cambiar la contraseña", fill: "#f35761" },
                }
            );

            useAuthStore.getState().setRequiresPasswordChange(false);
            window.location.href = "/dashboard";
        } catch {
            setSubmitting(false);
        }
    };

    const currentInputClass = [
        "password-input",
        currentEmpty ? "password-input--error" : "",
    ].filter(Boolean).join(" ");

    const newInputClass = [
        "password-input",
        touched.newPw && tooShort ? "password-input--error" : "",
        touched.newPw && tooLong ? "password-input--error" : "",
        touched.newPw && lengthOk ? "password-input--success" : "",
    ].filter(Boolean).join(" ");

    const confirmInputClass = [
        "password-input",
        touched.confirm && mismatch ? "password-input--error" : "",
        touched.confirm && matchOk ? "password-input--success" : "",
    ].filter(Boolean).join(" ");

    if (!requiresPasswordChange) return null;

    return (
        <form className="change-password-form" onSubmit={handleSubmit}>
            <div className="change-password-header">
                <h1 className="change-password-title">
                    Cambiemos tu <span>contraseña</span>
                </h1>
                <p className="change-password-subtitle">
                    Es la primera vez que estás entrando, crea una nueva contraseña
                </p>
            </div>

            <div className="change-password-fields">
                {/* Current password */}
                <div className="password-field">
                    <label className="password-label" htmlFor="current-password">
                        Contraseña actual
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            id="current-password"
                            type={showCurrent ? "text" : "password"}
                            className={currentInputClass}
                            placeholder="Ingresa tu contraseña temporal"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, current: true }))}
                            autoComplete="current-password"
                        />
                        <button
                            className="password-eye-btn"
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            <EyeIcon open={showCurrent} />
                        </button>
                    </div>
                    {currentEmpty && (
                        <p className="password-error">Ingresa tu contraseña actual</p>
                    )}
                </div>

                {/* New password */}
                <div className="password-field">
                    <label className="password-label" htmlFor="new-password">
                        Nueva contraseña
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            id="new-password"
                            type={showNew ? "text" : "password"}
                            className={newInputClass}
                            placeholder="Ingresa tu nueva contraseña"
                            value={newPassword}
                            maxLength={MAX_LENGTH}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, newPw: true }))}
                            autoComplete="new-password"
                        />
                        <button
                            className="password-eye-btn"
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            <EyeIcon open={showNew} />
                        </button>
                    </div>

                    {newPassword.length > 0 && (
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

                    {touched.newPw && tooShort && (
                        <p className="password-error">Mínimo {MIN_LENGTH} caracteres</p>
                    )}
                    {touched.newPw && tooLong && (
                        <p className="password-error">Máximo {MAX_LENGTH} caracteres</p>
                    )}
                </div>

                {/* Confirm password */}
                {newPassword.length > 0 && (
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
                                autoComplete="new-password"
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

            <button
                type="submit"
                className="change-password-submit"
                disabled={!canSubmit}
            >
                Guardar
            </button>
        </form>
    );
}
