// EvaluationDialog.tsx
// Task 4 — Vista de calificación post-sesión
import { useState, useEffect, useCallback } from 'react';
import '../styles/emailScreens.css';

interface Props {
  sessionId: string;
  isReminder?: boolean;
  onClose: () => void;
}

interface EvalAspect {
  key: string;
  label: string;
  value: number;
}

const ASPECTS: Omit<EvalAspect, 'value'>[] = [
  { key: 'topicMastery', label: 'Dominio del tema' },
  { key: 'clarity', label: 'Claridad en explicación' },
  { key: 'punctuality', label: 'Disponibilidad y puntualidad' },
  { key: 'attitude', label: 'Paciencia y actitud' },
];

const StarRow = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="es-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`es-star ${star <= value ? 'es-star--active' : ''}`}
        onClick={() => onChange(star)}
        aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
  </div>
);

export const EvaluationDialog = ({ sessionId, isReminder = false, onClose }: Props) => {
  const [loading, setLoading] = useState(true);
  const [sessionTitle, setSessionTitle] = useState('');
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [ratings, setRatings] = useState<Record<string, number>>({
    topicMastery: 0, clarity: 0, punctuality: 0, attitude: 0,
  });
  const [modalityAdequate, setModalityAdequate] = useState<boolean | null>(null);
  const [topicCovered, setTopicCovered] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`/api/emailScreens/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSessionTitle(data.title ?? 'Sesión');
        if (data.evaluation) setAlreadyRated(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [handleKeyDown]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  const setRating = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const allRated = Object.values(ratings).every((v) => v > 0);
  const canSubmit = allRated && modalityAdequate !== null && topicCovered !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/emailScreens/evaluations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ratings,
          modalityAdequate,
          topicCovered,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      setSuccess('Calificación enviada exitosamente ✓');
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Error al enviar calificación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="es-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="es-card" style={{ maxWidth: 560 }}>
        <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>

        {loading && <div className="es-card__loading"><p>Cargando…</p></div>}

        {!loading && error && !success && (
          <div className="es-card__error" role="alert"><p>{error}</p>
            <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button></div>
        )}

        {!loading && success && <div className="es-card__success"><p>{success}</p></div>}

        {!loading && !error && !success && alreadyRated && (
          <div className="es-card__success" style={{ color: '#64748b' }}>
            <p>Ya calificaste esta sesión</p>
            <button className="es-btn es-btn--confirm" onClick={onClose} style={{ marginTop: 16 }}>Cerrar</button>
          </div>
        )}

        {!loading && !error && !success && !alreadyRated && (
          <>
            {isReminder && (
              <div className="es-reminder-banner">📩 Este es un recordatorio para calificar tu sesión</div>
            )}

            <h2 className="es-title">Califica tu sesión</h2>
            <p className="es-session-name">{sessionTitle}</p>

            <div className="es-eval">
              {ASPECTS.map((aspect) => (
                <div key={aspect.key} className="es-eval__section">
                  <label className="es-eval__label">{aspect.label}</label>
                  <StarRow value={ratings[aspect.key]} onChange={(v) => setRating(aspect.key, v)} />
                </div>
              ))}

              {/* Modality question */}
              <div className="es-eval__section">
                <label className="es-eval__label">¿La modalidad fue adecuada?</label>
                <div className="es-radio-group">
                  <button type="button"
                    className={`es-radio ${modalityAdequate === true ? 'es-radio--selected' : ''}`}
                    onClick={() => setModalityAdequate(true)}>Sí</button>
                  <button type="button"
                    className={`es-radio ${modalityAdequate === false ? 'es-radio--selected' : ''}`}
                    onClick={() => setModalityAdequate(false)}>No</button>
                </div>
              </div>

              {/* Topic covered question */}
              <div className="es-eval__section">
                <label className="es-eval__label">¿Se cubrió el tema?</label>
                <div className="es-radio-group">
                  {['Sí', 'Parcialmente', 'No'].map((opt) => (
                    <button key={opt} type="button"
                      className={`es-radio ${topicCovered === opt ? 'es-radio--selected' : ''}`}
                      onClick={() => setTopicCovered(opt)}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* Optional comment */}
              <div className="es-eval__section">
                <label className="es-eval__label">Comentario (opcional)</label>
                <textarea className="es-textarea" value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia…" rows={3} />
              </div>
            </div>

            <div className="es-footer">
              <button className="es-btn es-btn--reject" onClick={onClose}>Cancelar</button>
              <button className="es-btn es-btn--confirm" onClick={handleSubmit}
                disabled={!canSubmit || submitting}>
                {submitting ? 'Enviando…' : 'Enviar calificación'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluationDialog;
