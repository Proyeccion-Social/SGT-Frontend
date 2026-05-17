// ConfirmSessionDialog.tsx
// Email action: confirm or reject a session request
// Task 2 — Vista de confirmar/rechazar solicitud de sesión

import { useState, useEffect, useCallback } from 'react';
import '../styles/ConfirmSessionDialog.css';
import type { Session } from '@features/emailScreens/types/session.types';
import { Monitor, Clock, Calendar, MapPin, X } from 'lucide-react';

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
            {/* Header section */}
            <div className="es-header">
              {session.tutor?.photo ? (
                <img src={session.tutor.photo} alt={session.tutor.name} className="es-avatar" />
              ) : (
                <div className="es-avatar" style={{ background: '#8751ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {session.tutor?.name?.charAt(0) ?? 'T'}
                </div>
              )}
              <div className="es-header-text">
                <h2 className="es-title">{session.title}</h2>
                <p className="es-description">{session.description || 'Sin descripción disponible.'}</p>
              </div>
            </div>

            {/* Tags row */}
            <div className="es-tags">
              <span className="es-tag es-tag--subject">
                {String(session.subject?.name ?? session.subject)}
              </span>
              <span className="es-tag es-tag--tutor">
                <span className="es-tag__dot" />
                {session.tutor?.name}
              </span>
              <span className="es-tag es-tag--status">
                {session.status}
              </span>
              {session.modality === 'VIRT' && (
                <a href="#" className="es-tag es-tag--link" onClick={(e) => e.preventDefault()}>
                  🔗 Enlace de la sesión
                </a>
              )}
            </div>

            {/* 4-Grid info cards */}
            <div className="es-grid">
              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <Monitor size={20} />
                </div>
                <span className="es-info-card__label">{session.modality === 'VIRT' ? 'Virtual' : 'Presencial'}</span>
              </div>
              
              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <Clock size={20} />
                </div>
                <span className="es-info-card__label">{session.duration} horas</span>
              </div>

              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <Calendar size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="es-info-card__label">{formatDate(session.scheduledDate, '').split(' · ')[0]}</span>
                  <span className="es-info-card__sublabel">{session.startTime.substring(0, 5)}</span>
                </div>
              </div>

              <div className="es-info-card">
                <div className="es-info-card__icon">
                  <MapPin size={20} />
                </div>
                <span className="es-info-card__label">Pendiente</span>
              </div>
            </div>

            {/* Expiration or Status Message */}
            {session.status !== 'PENDING_TUTOR_CONFIRMATION' ? (
              <div className="es-expiration" style={{ marginBottom: 20, background: '#f1f5f9', color: '#475569', textAlign: 'center' }}>
                ✓ Esta sesión ya ha sido {session.status === 'SCHEDULED' ? 'confirmada' : 'procesada'}.
              </div>
            ) : session.expiresAt && (
              <div className={`es-expiration ${isExpired ? 'es-expiration--expired' : ''}`} style={{ marginBottom: 20 }}>
                {isExpired
                  ? '⚠ Esta solicitud ha expirado'
                  : `Expira: ${new Date(session.expiresAt).toLocaleString('es-CO')}`
                }
              </div>
            )}

            {/* Reject reason textarea */}
            {showRejectReason && (
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <textarea
                  className="es-reason-textarea"
                  placeholder="Motivo del rechazo (mínimo 10 caracteres)…"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  aria-label="Motivo del rechazo"
                  aria-required="true"
                  style={{ marginBottom: '4px' }}
                />
                <span style={{ fontSize: '11px', color: rejectReason.length < 10 ? '#ef4444' : '#10b981' }}>
                  {rejectReason.length} / 500 caracteres (mínimo 10)
                </span>
              </div>
            )}

            {!isExpired && session.status === 'PENDING_TUTOR_CONFIRMATION' && (
              <div className="es-footer">
                {!showRejectReason ? (
                  <>
                    <button
                      className="es-btn es-btn--confirm"
                      onClick={() => handleAction('confirm')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Procesando…' : 'Aceptar'}
                    </button>
                    <button
                      className="es-btn es-btn--reject"
                      onClick={() => setShowRejectReason(true)}
                      disabled={actionLoading}
                    >
                      Rechazar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="es-btn"
                      style={{ background: '#f1f5f9', color: '#475569' }}
                      onClick={() => {
                        setShowRejectReason(false);
                        setRejectReason('');
                      }}
                      disabled={actionLoading}
                    >
                      Volver
                    </button>
                    <button
                      className="es-btn es-btn--reject"
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading || rejectReason.trim().length < 10}
                    >
                      {actionLoading ? 'Procesando…' : 'Confirmar Rechazo'}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmSessionDialog;
