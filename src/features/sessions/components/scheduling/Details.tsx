import { useState } from "react";
import "../../assets/styles/Detail.css";

const TITLE_MIN = 5;
const TITLE_MAX = 100;
const DESC_MIN = 10;
const DESC_MAX = 500;

interface Props {
  onNext: (title: string, description: string) => void;
  onBack: () => void;
  initialTitle?: string;
  initialDescription?: string;
}

export default function DetailsStep({ onNext, onBack, initialTitle = "", initialDescription = "" }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);

  const titleError =
    titleTouched && title.length > 0 && title.length < TITLE_MIN
      ? `Mínimo ${TITLE_MIN} caracteres`
      : null;

  const descError =
    descTouched && description.length > 0 && description.length < DESC_MIN
      ? `Mínimo ${DESC_MIN} caracteres`
      : null;

  const isReady =
    title.length >= TITLE_MIN &&
    title.length <= TITLE_MAX &&
    description.length >= DESC_MIN &&
    description.length <= DESC_MAX;

  return (
    <div>
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
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            className={`details-field__input${titleError ? " details-field__input--error" : ""}`}
          />
          <div className="details-field__footer">
            {titleError
              ? <span className="details-field__error">{titleError}</span>
              : <span />
            }
            <span className="details-field__counter">{title.length}/{TITLE_MAX}</span>
          </div>
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
            maxLength={DESC_MAX}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setDescTouched(true)}
            rows={5}
            className={`details-field__textarea${descError ? " details-field__textarea--error" : ""}`}
          />
          <div className="details-field__footer">
            {descError
              ? <span className="details-field__error">{descError}</span>
              : <span />
            }
            <span className="details-field__counter">{description.length}/{DESC_MAX}</span>
          </div>
        </div>

        {/* ── Pie con botones de navegación ── */}
        <div className="details-footer">
          <button
            onClick={onBack}
            className="details-footer__back-btn"
          >
            Atrás
          </button>
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
