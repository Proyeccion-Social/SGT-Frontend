import { useState } from "react";
import presencialIcon from "../../assets/presencial.svg";
import virtualIcon from "../../assets/virtual.svg";
import checkmarkIcon from "../../assets/CheckmarkIcon.svg";
import "../../assets/styles/Modality.css";

interface Props {
  onNext: (modality: "VIRT" | "PRES") => void;
  onBack: () => void;
  initialModality?: "VIRT" | "PRES" | null;
  isSubmitting?: boolean;
}

export default function ModalityStep({ onNext, onBack, initialModality = null, isSubmitting = false }: Props) {
  const [selected, setSelected] = useState<"VIRT" | "PRES" | null>(initialModality);

  const options = [
    { value: "VIRT" as const, label: "Virtual", icon: virtualIcon },
    { value: "PRES" as const, label: "Presencial", icon: presencialIcon },
  ];

  return (
    <div>
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

        {/* ── Pie con botones de navegación ── */}
        <div className="modality-footer">
          <button
            onClick={onBack}
            className="modality-footer__back-btn"
          >
            Atrás
          </button>
          <button
            disabled={!selected || isSubmitting}
            onClick={() => selected && !isSubmitting && onNext(selected)}
            className={`modality-footer__continue-btn${selected && !isSubmitting ? " modality-footer__continue-btn--active" : ""}`}
          >
            {isSubmitting ? "Agendando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}