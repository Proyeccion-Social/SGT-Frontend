// ConfirmSessionDialog.tsx
// Email action: confirm or reject a session request
// Task 2 — Vista de confirmar/rechazar solicitud de sesión

import { useState, useEffect, useCallback } from 'react';
import '../styles/emailScreens.css';
import type { Session } from '@features/emailScreens/types/session.types';

interface Props {
  sessionId: string;
  onClose: () => void;
}

const statusLabel = (s: string): string => {
  const map: Record<string, string> = {
    VIRT: 'Virtual', PRES: 'Presencial',
  };
  return map[s] ?? s;
};

const formatDate = (date: string, time: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${months[m - 1]} ${y} · ${time.substring(0, 5)}`;
};

export const ConfirmSessionDialog = ({ sessionId, onClose }: Props) => {
  const [session, setSession]             = useState<Session | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess]             = useState<string | null>(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason]   = useState('');

  useEffect(() => {
    fetch(`/api/emailScreens/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setSession)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleAction = async (action: 'confirm' | 'reject') => {
    if (action === 'reject' && !showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    if (action === 'reject' && rejectReason.trim() === '') return;

    setActionLoading(true);
    setError(null);
    try {
      const endpoint = action === 'confirm'
        ? '/api/emailScreens/sessions/confirm-session'
        : '/api/emailScreens/sessions/reject-session';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...(action === 'reject' ? { reason: rejectReason } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }

      setSuccess(action === 'confirm'
        ? 'Sesión confirmada exitosamente ✓'
        : 'Sesión rechazada'
      );
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Check if session request expired
  const isExpired = session?.expiresAt
    ? new Date(session.expiresAt).getTime() < Date.now()
    : false;

  return (
    <div className="es-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="es-card">
        <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>

        {loading && (
          <div className="es-card__loading"><p>Cargando sesión…</p></div>
        )}

        {!loading && error && !success && (
          <div className="es-card__error" role="alert">
            <p>{error}</p>
            <button className="es-btn es-btn--confirm" onClick={onClose}>Cerrar</button>
          </div>
        )}

        {!loading && success && (
          <div className="es-card__success"><p>{success}</p></div>
        )}

        {!loading && !error && !success && session && (
          <>
            <h2 className="es-title">Confirmar solicitud de tutoría</h2>
            <p className="es-session-name">{session.title}</p>

            {/* Session details grid */}
            <div className="es-session-details">
              <div className="es-detail-item">
                <div className="es-detail-item__label">Estudiante</div>
                <div className="es-detail-item__value">{session.student?.name ?? '—'}</div>
              </div>
              <div className="es-detail-item">
                <div className="es-detail-item__label">Materia</div>
                <div className="es-detail-item__value">{String(session.subject?.name ?? session.subject)}</div>
              </div>
              <div className="es-detail-item">
                <div className="es-detail-item__label">Fecha y hora</div>
                <div className="es-detail-item__value">
                  {formatDate(session.scheduledDate, session.startTime)}
                </div>
              </div>
              <div className="es-detail-item">
                <div className="es-detail-item__label">Modalidad</div>
                <div className="es-detail-item__value">{statusLabel(String(session.modality))}</div>
              </div>
            </div>

            {session.description && (
              <p className="es-description">{session.description}</p>
            )}

            {/* Expiration */}
            {session.expiresAt && (
              <div className={`es-expiration ${isExpired ? 'es-expiration--expired' : ''}`}>
                {isExpired
                  ? '⚠ Esta solicitud ha expirado'
                  : `Expira: ${new Date(session.expiresAt).toLocaleString('es-CO')}`
                }
              </div>
            )}

            {/* Reject reason textarea */}
            {showRejectReason && (
              <textarea
                className="es-reason-textarea"
                placeholder="Motivo del rechazo (obligatorio)…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                aria-label="Motivo del rechazo"
                aria-required="true"
              />
            )}

            {!isExpired && (
              <div className="es-footer">
                <button
                  className="es-btn es-btn--reject"
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading || (showRejectReason && rejectReason.trim() === '')}
                >
                  {actionLoading ? 'Procesando…' : 'Rechazar'}
                </button>
                <button
                  className="es-btn es-btn--confirm"
                  onClick={() => handleAction('confirm')}
                  disabled={actionLoading || showRejectReason}
                >
                  {actionLoading ? 'Procesando…' : 'Confirmar'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmSessionDialog;
