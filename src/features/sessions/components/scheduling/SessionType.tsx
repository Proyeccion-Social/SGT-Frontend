import { useState } from "react";
import grupalIcon from "../../assets/grupal.svg";
import individualIcon from "../../assets/individiual.svg";
import checkmarkIcon from "../../assets/CheckmarkIcon.svg";
import "../../assets/styles/SessionType.css";

interface Props {
  onNext: (type: "INDIVIDUAL" | "GRUPAL") => void;
  onBack: () => void;
  initialType?: "INDIVIDUAL" | "GRUPAL" | null;
  isSubmitting?: boolean;
}

export default function SessionTypeStep({ onNext, onBack, initialType = null, isSubmitting = false }: Props) {
  const [selected, setSelected] = useState<"INDIVIDUAL" | "GRUPAL" | null>(initialType);

  const options = [
    { value: "INDIVIDUAL" as const, label: "Individual", icon: individualIcon },
    { value: "GRUPAL" as const, label: "Grupal", icon: grupalIcon },
  ];

  return (
    <div>
      {/* ── Encabezado ── */}
      <h2 className="session-type-title">
        <span className="session-type-title__highlight">Información</span>{" "}
        adicional
      </h2>
      <p className="session-type-subtitle">Estás agendando un espacio nuevo</p>

      {/* ── Contenedor principal ── */}
      <div className="session-type-card">
        <h3 className="session-type-card__label">Tipo</h3>
        <p className="session-type-card__hint">Selecciona el tipo de espacio</p>

        {/* ── Lista de opciones ── */}
        <div className="session-type-options">
          {options.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={`session-type-option${selected === value ? " session-type-option--selected" : ""}`}
            >
              {/* ── Indicador de selección ── */}
              {selected === value && (
                <div className="session-type-option__check-badge">
                  <img src={checkmarkIcon.src} alt="" aria-hidden="true" width="10" height="8" />
                </div>
              )}

              {/* ── Ícono del tipo de sesión ── */}
              <img
                src={icon.src}
                alt={label}
                className="session-type-option__icon"
              />
              {label}
            </button>
          ))}
        </div>

        {/* ── Pie con botones de navegación ── */}
        <div className="session-type-footer">
          <button
            onClick={onBack}
            className="session-type-footer__back-btn"
          >
            Atrás
          </button>
          <button
            disabled={!selected || isSubmitting}
            onClick={() => selected && !isSubmitting && onNext(selected)}
            className={`session-type-footer__continue-btn${selected && !isSubmitting ? " session-type-footer__continue-btn--active" : ""}`}
          >
            {isSubmitting ? "Agendando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}