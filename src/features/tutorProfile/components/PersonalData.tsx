import "../styles/SetNewPassword.css";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { StepHandle } from "./ChooseSubjects";

const PersonalData = forwardRef<StepHandle, { onNext: (data: { phone: string }) => void; onCanContinueChange?: (canContinue: boolean) => void; initialPhone?: string }>(({ onNext, onCanContinueChange, initialPhone }, ref) => {
    const [phone, setPhone] = useState(initialPhone ?? "");
    const [touched, setTouched] = useState(false);

    const phoneOk = /^[0-9]{10}$/.test(phone.trim());

    useImperativeHandle(ref, () => ({
        triggerContinue: () => onNext({ phone: phone.trim() }),
        getData: () => ({ phone: phone.trim() }),
    }), [phone, onNext]);

    useEffect(() => {
        onCanContinueChange?.(phoneOk);
    }, [phoneOk, onCanContinueChange]);

    const inputClass = [
        "password-input",
        touched && !phoneOk ? "password-input--error" : "",
        touched && phoneOk ? "password-input--success" : "",
    ].filter(Boolean).join(" ");

    return (
        <div className="drawer-body">
            <div className="body-header">
                <p className="body-header-title">Datos personales</p>
                <p className="body-header-subtitle">
                    Completa tu información de contacto
                </p>
            </div>

            <div className="password-form">
                <div className="password-field">
                    <label className="password-label" htmlFor="phone">
                        Número de teléfono
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            id="phone"
                            type="tel"
                            className={inputClass}
                            placeholder="Ingresa tu número de teléfono (10 dígitos)"
                            value={phone}
                            maxLength={10}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => setTouched(true)}
                        />
                    </div>
                    {touched && !phoneOk && (
                        <p className="password-error">Ingresa un número válido (10 dígitos)</p>
                    )}
                </div>
            </div>
        </div>
    );
});

export default PersonalData;
