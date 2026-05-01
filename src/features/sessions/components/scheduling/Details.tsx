import { useState } from "react";
import "../../assets/styles/Detail.css";

interface Props {
  onNext: (title: string, description: string) => void;
  onBack: () => void;
}

export default function DetailsStep({ onNext, onBack }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const isReady = Boolean(title && description);

  return (
    <div>
      {/* ── Encabezado ── */}
      <h2 className="details-title">
        <span className="details-title__highlight">Información</span>{" "}
        adicional
      </h2>
      <p className="details-subtitle">Estás agendando un espacio nuevo</p>

      {/* ── Contenedor principal ── */}
      <div className="details-card">

        {/* ── Campo: Tema ── */}
        <div className="details-field">
          <h3 className="details-field__label">Tema</h3>
          <p className="details-field__hint">
            Escribe el tema que quieres que sea tratado en la tutoría
          </p>
          <input
            type="text"
            placeholder="Introducción a derivadas parciales"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="details-field__input"
          />
        </div>

        {/* ── Campo: Descripción ── */}
        <div className="details-field">
          <h3 className="details-field__label">Descripción</h3>
          <p className="details-field__hint">
            Describe de una manera clara y concisa el objetivo del espacio
          </p>
          <textarea
            placeholder="Introducción a derivadas parciales"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="details-field__textarea"
          />
        </div>

        {/* ── Pie con botón de continuar ── */}
        <div className="details-footer">
          <button
            disabled={!isReady}
            onClick={() => isReady && onNext(title, description)}
            className={`details-footer__continue-btn${isReady ? " details-footer__continue-btn--active" : ""}`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}