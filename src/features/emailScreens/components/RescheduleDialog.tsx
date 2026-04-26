// RescheduleDialog.tsx
// Task 3 — Vista de reagendar sesión
import { useState, useEffect, useCallback } from 'react';
import '../styles/RescheduleDialog.css';
import type { Session } from '@features/emailScreens/types/session.types';

interface Props {
  sessionId: string;
  onClose: () => void;
}

const statusLabel = (s: string): string => {
  const map: Record<string, string> = {
    CANCELLED_BY_TUTOR: 'Cancelada por tutor',
    CANCELLED_BY_STUDENT: 'Cancelada por estudiante',
    REJECTED_BY_TUTOR: 'Rechazada por tutor',
    CANCELLED: 'Cancelada',
  };
  return map[s] ?? s;
};

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
    const params = new URLSearchParams();
    if (subjectId) params.set('subjectId', String(subjectId));
    // Redirigir a la página real de búsqueda
    window.location.href = `/search/${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <div className="es-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="es-card">
        <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
        {loading && <div className="es-card__loading"><p>Cargando información…</p></div>}
        {!loading && error && (
          <div className="es-card__error" role="alert"><p>{error}</p>
            <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button></div>
        )}
        {!loading && !error && session && (
          <>
            <h2 className="es-title">Reagendar tutoría</h2>
            <p className="es-session-name">{session.title}</p>
            <div className="es-session-details">
              <div className="es-detail-item">
                <div className="es-detail-item__label">Estado</div>
                <div className="es-detail-item__value">{statusLabel(String(session.status))}</div>
              </div>
              <div className="es-detail-item">
                <div className="es-detail-item__label">Materia</div>
                <div className="es-detail-item__value">{String(session.subject?.name ?? session.subject)}</div>
              </div>
            </div>
            <p className="es-description">
              Tu sesión fue cancelada o rechazada. Puedes buscar un nuevo horario disponible con el mismo tutor o explorar otras opciones.
            </p>
            <div className="es-footer">
              <button className="es-btn es-btn--reject" onClick={onClose}>Cerrar</button>
              <button className="es-btn es-btn--secondary" onClick={handleGoToSearch}>Buscar nuevo horario</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RescheduleDialog;
