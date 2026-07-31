import { useState, useEffect } from "react";
import { navigate } from "astro:transitions/client";
import { sileo } from "sileo";
import "../styles/ResetPasswordForm.css";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

function getStrength(pw: string): 0 | 1 | 2 | 3 {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= MIN_LENGTH) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[@$!%*?&#]/.test(pw)) score++;
    return score as 0 | 1 | 2 | 3;
}

export default function ResetPasswordForm() {
    const [token, setToken] = useState<string | null>(null);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState({ password: false, confirm: false });
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get("token");
        setToken(t);
        setIsReady(true);
    }, []);

    const strength = getStrength(password);
    const hasMinLength = password.length >= MIN_LENGTH;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);

    const lengthOk = hasMinLength && password.length <= MAX_LENGTH;
    const mismatch = confirm.length > 0 && password !== confirm;
    const matchOk = confirm.length > 0 && password === confirm && lengthOk;

    const canSubmit = !!token && lengthOk && strength === 3 && matchOk && !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        
        try {
            // Usamos una petición normal en lugar de sileo.promise para tener control total
            // del mensaje dinámico que viene del backend.
            const response = await fetch("/api/emailScreens/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password,
                    confirmPassword: confirm,
                }),
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMsg = body?.message ?? "Error al restablecer la contraseña";
                
                // Mostramos el mensaje exacto del backend
                sileo.error({ 
                    title: "Error", 
                    description: errorMsg, 
                    fill: "#f35761" 
                });

                if (errorMsg.toLowerCase().includes("token") || errorMsg.toLowerCase().includes("invalid")) {
                    setTokenExpired(true);
                }
                setSubmitting(false);
                return;
            }

            // Si todo salió bien
            sileo.success({ 
                title: "¡Éxito!", 
                description: "Contraseña actualizada correctamente", 
                fill: "#58d68d" 
            });

            setSuccess(true);
            
            sileo.action({
                title: "¡Contraseña actualizada!",
                description: "Tu contraseña ha sido cambiada. Ahora puedes iniciar sesión.",
                button: {
                    title: "Ir al Inicio",
                    onClick: () => navigate("/"),
                },
                fill: "#58d68d",
                styles: {
                    badge: { fill: "#ffffff" },
                },
            });

        } catch (error: any) {
            sileo.error({ 
                title: "Error de conexión", 
                description: "No se pudo conectar con el servidor", 
                fill: "#f35761" 
            });
            setSubmitting(false);
        }
    };

    if (!isReady) return null;

    if (tokenExpired) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-header">
                    <h1 className="reset-password-title">Enlace <span>expirado</span></h1>
                    <p className="reset-password-subtitle">
                        El enlace de recuperación ya fue usado o ha expirado por seguridad.
                    </p>
                </div>
                <button className="reset-password-submit" onClick={() => navigate("/")}>
                    Volver al Inicio
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="reset-success-card">
                <div className="reset-success-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h1 className="reset-success-title">¡Todo listo!</h1>
                <p className="reset-success-text">
                    Tu contraseña ha sido restablecida con éxito. Ya puedes cerrar esta pestaña o volver al login.
                </p>
                <button className="reset-password-submit" onClick={() => navigate("/")}>
                    Ir al Inicio de Sesión
                </button>
            </div>
        );
    }

    if (token === null) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-header">
                    <h1 className="reset-password-title">Enlace <span>inválido</span></h1>
                    <p className="reset-password-subtitle">No se encontró un token válido en la URL.</p>
                </div>
                <button className="reset-password-submit" onClick={() => navigate("/")}>
                    Ir al Login
                </button>
            </div>
        );
    }

    return (
        <form className="reset-password-container" onSubmit={handleSubmit}>
            <div className="reset-password-header">
                <h1 className="reset-password-title">Restablece tu <span>contraseña</span></h1>
                <p className="reset-password-subtitle">Crea una contraseña segura para proteger tu cuenta.</p>
            </div>

            <div className="reset-password-fields">
                <div className="reset-password-field">
                    <label className="reset-password-label" htmlFor="password">Nueva contraseña</label>
                    <div className="reset-password-input-wrapper">
                        <input
                            id="password"
                            type={showNew ? "text" : "password"}
                            className={`reset-password-input ${touched.password && (password.length > 0 && !lengthOk) ? "reset-password-input--error" : ""}`}
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                            required
                        />
                        <button
                            type="button"
                            className="reset-password-eye-btn"
                            onClick={() => setShowNew(!showNew)}
                        >
                            {showNew ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                    {touched.password && password.length > 0 && (
                        <div className="password-errors-list" style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                            {!hasMinLength && (
                                <p style={{ color: "#f35761", fontSize: "12px" }}>Mínimo {MIN_LENGTH} caracteres</p>
                            )}
                            {password.length > MAX_LENGTH && (
                                <p style={{ color: "#f35761", fontSize: "12px" }}>Máximo {MAX_LENGTH} caracteres</p>
                            )}
                            {(!hasUppercase || !hasLowercase) && (
                                <p style={{ color: "#f35761", fontSize: "12px" }}>Incluye al menos una mayúscula y una minúscula</p>
                            )}
                            {!hasDigit && (
                                <p style={{ color: "#f35761", fontSize: "12px" }}>Incluye al menos un número</p>
                            )}
                            {!hasSpecial && (
                                <p style={{ color: "#f35761", fontSize: "12px" }}>Incluye al menos un carácter especial como #, @, $, %, &, *, !, ?</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="reset-password-field">
                    <label className="reset-password-label" htmlFor="confirm">Confirmar contraseña</label>
                    <div className="reset-password-input-wrapper">
                        <input
                            id="confirm"
                            type={showConfirm ? "text" : "password"}
                            className={`reset-password-input ${touched.confirm && mismatch ? "reset-password-input--error" : ""}`}
                            placeholder="Repite tu nueva contraseña"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
                            required
                        />
                        <button
                            type="button"
                            className="reset-password-eye-btn"
                            onClick={() => setShowConfirm(!showConfirm)}
                        >
                            {showConfirm ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                    {touched.confirm && mismatch && (
                        <p style={{ color: "#f35761", fontSize: "12px", marginTop: "4px" }}>Las contraseñas no coinciden.</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                className="reset-password-submit"
                disabled={!canSubmit}
            >
                {submitting ? "Actualizando..." : "Restablecer contraseña"}
            </button>
        </form>
    );
}
