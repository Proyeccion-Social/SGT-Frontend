import { useState, useEffect } from "react";
import { navigate } from "astro:transitions/client";
import { sileo } from "sileo";
import "../styles/ResetPasswordForm.css";

export default function ConfirmEmailForm() {
    const [token, setToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleRedirect = () => {
        if (isRedirecting) return;
        setIsRedirecting(true);
        navigate("/dashboard");
    };

    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get("token");
        setToken(t);
        setIsReady(true);
    }, []);

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || submitting) return;

        setSubmitting(true);
        setErrorMsg(null);
        
        try {
            const response = await fetch("/api/emailScreens/confirm-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = body?.message ?? "Error al confirmar el correo";
                setErrorMsg(msg);
                
                sileo.error({ 
                    title: "Error", 
                    description: msg, 
                    fill: "#f35761" 
                });
                setSubmitting(false);
                return;
            }

            sileo.success({ 
                title: "¡Éxito!", 
                description: "Correo confirmado correctamente", 
                fill: "#58d68d" 
            });

            setSuccess(true);
            
            sileo.action({
                title: "¡Sesión iniciada!",
                description: "Tu correo ha sido confirmado exitosamente y hemos iniciado tu sesión.",
                button: {
                    title: "Ir al Dashboard",
                    onClick: handleRedirect,
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
                    Tu correo ha sido confirmado con éxito. Tu sesión ha sido iniciada automáticamente.
                </p>
                <button 
                    className="reset-password-submit" 
                    onClick={handleRedirect}
                    disabled={isRedirecting}
                >
                    {isRedirecting ? "Redirigiendo..." : "Ir al Dashboard"}
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
        <form className="reset-password-container" onSubmit={handleConfirm}>
            <div className="reset-password-header">
                <h1 className="reset-password-title">Confirma tu <span>correo</span></h1>
                <p className="reset-password-subtitle">Haz clic en el botón de abajo para verificar tu cuenta.</p>
            </div>

            {errorMsg && (
                <div style={{ 
                    padding: "12px", 
                    borderRadius: "8px", 
                    background: "#fff1f2", 
                    color: "#f35761", 
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "1px solid #ffe4e6"
                }}>
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                className="reset-password-submit"
                disabled={submitting}
            >
                {submitting ? "Confirmando..." : "Confirmar Correo"}
            </button>
        </form>
    );
}
