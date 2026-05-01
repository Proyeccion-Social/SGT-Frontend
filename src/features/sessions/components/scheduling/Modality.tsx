import { useState } from "react";
import presencialIcon from "../../assets/presencial.svg";
import virtualIcon from "../../assets/virtual.svg";
import checkmarkIcon from "../../assets/CheckmarkIcon.svg";
import "../../assets/styles/Modality.css";

interface Props {
  onNext: (modality: "VIRT" | "PRES") => void;
  onBack: () => void;
}

export default function ModalityStep({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<"VIRT" | "PRES" | null>(null);

  const options = [
    { value: "VIRT" as const, label: "Virtual", icon: virtualIcon },
    { value: "PRES" as const, label: "Presencial", icon: presencialIcon },
  ];

  return (
    <div>
      {/* ── Encabezado ── */}
      <h2 className="modality-title">
        <span className="modality-title__highlight">Información</span>{" "}
        adicional
      </h2>
      <p className="modality-subtitle">Estás agendando un espacio nuevo</p>

      {/* ── Contenedor principal ── */}
      <div className="modality-card">
        <h3 className="modality-card__label">Modalidad</h3>
        <p className="modality-card__hint">¿Virtual o presencial?</p>

        {/* ── Lista de opciones ── */}
        <div className="modality-options">
          {options.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={`modality-option${selected === value ? " modality-option--selected" : ""}`}
            >
              {/* ── Indicador de selección ── */}
              {selected === value && (
                <div className="modality-option__check-badge">
                  <img src={checkmarkIcon.src} alt="" aria-hidden="true" width="10" height="8" />
                </div>
              )}

              {/* ── Ícono de la modalidad ── */}
              <img
                src={icon.src}
                alt={label}
                className="modality-option__icon"
              />
              {label}
            </button>
          ))}
        </div>

        {/* ── Pie con botón de continuar ── */}
        <div className="modality-footer">
          <button
            disabled={!selected}
            onClick={() => selected && onNext(selected)}
            className={`modality-footer__continue-btn${selected ? " modality-footer__continue-btn--active" : ""}`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}