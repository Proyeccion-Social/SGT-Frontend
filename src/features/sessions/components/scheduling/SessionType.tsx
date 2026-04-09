import { useState } from "react";
import grupalIcon from "../../assets/grupal.svg";
import individualIcon from "../../assets/individiual.svg";
import "../../assets/styles/SessionType.css";

interface Props {
  onNext: (type: "INDIVIDUAL" | "GRUPAL") => void;
  onBack: () => void;
}

export default function SessionTypeStep({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<"INDIVIDUAL" | "GRUPAL" | null>(null);

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
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 3.5L3.5 6.5L9 1"
                      stroke="#3C3C3C"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

        {/* ── Pie con botón de continuar ── */}
        <div className="session-type-footer">
          <button
            disabled={!selected}
            onClick={() => selected && onNext(selected)}
            className={`session-type-footer__continue-btn${selected ? " session-type-footer__continue-btn--active" : ""}`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}