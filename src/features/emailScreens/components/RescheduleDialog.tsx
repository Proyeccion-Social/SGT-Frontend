import { useState, useEffect, useCallback } from 'react';
import '../styles/RescheduleDialog.css';
import type { Session } from '@features/emailScreens/types/session.types';
import calendarIcon from '../assets/calendar.svg';

interface Props {
  sessionId: string;
  onClose: () => void;
}

export const RescheduleDialog = ({ sessionId, onClose }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/emailScreens/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? `HTTP ${res.status}`);
        return res.json();
      })
      .then(setSession)
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

  const handleGoToSearch = () => {
    const subjectId = session?.subject?.id ?? '';
    window.location.href = `/sessions?subjectId=${subjectId}`;
  };

  return (
    <div className="es-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="es-card es-card--reschedule">
        <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
        {loading && <div className="es-card__loading"><p>Cargando información…</p></div>}
        {!loading && error && (
          <div className="es-card__error" role="alert"><p>{error}</p>
            <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button></div>
        )}
        {!loading && !error && session && (
          <div className="es-reschedule-content">
            <div className="es-reschedule-header">
              <img src={calendarIcon.src} alt="Calendario" className="es-reschedule-icon" />
              <h2 className="es-reschedule-title">¿Deseas reagendar la tutoría?</h2>
            </div>
            
            <div className="es-reschedule-actions">
              <button className="es-btn-general-reschedule es-btn--reschedule" onClick={handleGoToSearch}>
                Reagendar
              </button>
              <button className="es-btn-general-reschedule es-btn--exit" onClick={onClose}>
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RescheduleDialog;
