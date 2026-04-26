// EvaluationDialog.tsx
// Task 4 — Vista de calificación post-sesión
import { useState, useEffect, useCallback } from 'react';
import '../styles/EvaluationDialog.css';
import { Monitor, Clock, Calendar, CheckCircle, X } from 'lucide-react';

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
  { key: 'knowledge', label: 'Dominio del tema' },
  { key: 'clarity', label: 'Claridad en explicación' },
  { key: 'punctuality', label: 'Disponibilidad y puntualidad' },
  { key: 'patience', label: 'Paciencia y actitud' },
  { key: 'usefulness', label: 'Utilidad de la sesión' },
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
  const [sessionDescription, setSessionDescription] = useState('');
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [ratings, setRatings] = useState<Record<string, number>>({
    knowledge: 0, clarity: 0, punctuality: 0, patience: 0, usefulness: 0,
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
        setSessionDescription(data.description ?? '');
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

            {/* Header section */}
            <div className="es-header">
              <div className="es-avatar" style={{ background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                T
              </div>
              <div className="es-header-text">
                <h2 className="es-title">{sessionTitle}</h2>
                <p className="es-description">{sessionDescription || 'Sin descripción disponible.'}</p>
              </div>
            </div>

            {/* Tags row */}
            <div className="es-tags">
              <span className="es-tag es-tag--subject">Diferencial</span>
              <span className="es-tag es-tag--tutor">
                <span className="es-tag__dot" />
                Daniel Camacho
              </span>
              <span className="es-tag es-tag--status">Cerrada</span>
              <a href="#" className="es-tag es-tag--link" onClick={(e) => e.preventDefault()}>
                🔗 Enlace de la sesión
              </a>
            </div>

            {/* 4-Grid summary */}
            <div className="es-grid">
              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <Monitor size={20} />
                </div>
                <span className="es-info-card__label">Virtual</span>
              </div>
              
              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <Clock size={20} />
                </div>
                <span className="es-info-card__label">2 horas</span>
              </div>

              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <Calendar size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="es-info-card__label">12 de Marzo</span>
                  <span className="es-info-card__sublabel">2:00pm</span>
                </div>
              </div>

              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <CheckCircle size={20} />
                </div>
                <span className="es-info-card__label">Terminada</span>
              </div>
            </div>

            <div className="es-footer">
              <button className="es-btn es-btn--confirm" onClick={handleSubmit}
                disabled={submitting} style={{ padding: '12px 64px' }}>
                {submitting ? 'Enviando…' : 'Calificar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluationDialog;
