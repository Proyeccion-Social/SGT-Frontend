import { useState, useEffect } from "react";
import { sileo } from "sileo";
import { useAuthStore } from "@/store/authStore";
import "../styles/ResetPasswordForm.css";
import "../styles/ConfirmEmailForm.css";

export default function ConfirmEmailForm() {
    const [token, setToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { setUser, setRequiresProfileCompletion } = useAuthStore();

    const handleRedirect = () => {
        window.location.href = "/dashboard";
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
                    fill: "#f35761",
                });
                setSubmitting(false);
                return;
            }

            if (body.user) {
                setUser(body.user);
                setRequiresProfileCompletion(body.requiresProfileCompletion ?? false);
            }

            handleRedirect();
        } catch (error: any) {
            sileo.error({
                title: "Error de conexión",
                description: "No se pudo conectar con el servidor",
                fill: "#f35761",
            });
            setSubmitting(false);
        }
    };

    if (!isReady) return null;

    /* ── Invalid token ── */
    if (token === null) {
        return (
            <div className="confirm-email-container">
                <div className="reset-password-header">
                    <h1 className="reset-password-title">
                        Enlace <span>inválido</span>
                    </h1>
                    <p className="reset-password-subtitle">
                        No se encontró un token válido en la URL.
                    </p>
                </div>
                <button
                    className="reset-password-submit"
                    onClick={() => (window.location.href = "/")}
                >
                    Ir al Login
                </button>
            </div>
        );
    }

    /* ── Main form ── */
    return (
        <form className="confirm-email-container" onSubmit={handleConfirm}>
            <div className="reset-password-header">
                <h1 className="reset-password-title">
                    Confirma tu <span>correo</span>
                </h1>
                <p className="reset-password-subtitle">
                    Haz clic en el botón de abajo para verificar tu cuenta.
                </p>
            </div>

            {errorMsg && (
                <div className="confirm-email-error">{errorMsg}</div>
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