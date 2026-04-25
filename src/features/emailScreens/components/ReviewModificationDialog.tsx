// ReviewModificationDialog.tsx
// Email action: accept or reject a modification request
// Task 1 — Vista de aceptar/rechazar propuesta de modificación

import { useState, useEffect, useCallback } from 'react';
import '../styles/emailScreens.css';

interface Props {
  requestId: string;
  onClose: () => void;
}

interface ModificationRequest {
  id: string;
  sessionId: string;
  sessionTitle?: string;
  currentModality?: string;
  currentDurationHours?: number;
  currentSchedule?: string;
  newModality?: string;
  newDurationHours?: number;
  newAvailabilityId?: number;
  newSchedule?: string;
  status?: string;
  proposedBy?: string;
  expiresAt?: string;
  createdAt?: string;
  [key: string]: any;
}

const modalityLabel = (m?: string) => {
  if (!m) return '—';
  const map: Record<string, string> = { VIRT: 'Virtual', PRES: 'Presencial' };
  return map[m] ?? m;
};

export const ReviewModificationDialog = ({ requestId, onClose }: Props) => {
  const [request, setRequest]             = useState<ModificationRequest | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess]             = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/emailScreens/modification-requests/${requestId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setRequest)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [requestId]);

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

  const handleAction = async (action: 'accept' | 'reject') => {
    setActionLoading(true);
    setError(null);
    try {
      const endpoint = action === 'accept'
        ? '/api/emailScreens/modification-requests/accept'
        : '/api/emailScreens/modification-requests/reject';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }

      setSuccess(action === 'accept'
        ? 'Modificación aceptada exitosamente ✓'
        : 'Modificación rechazada'
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

  const isExpired = request?.expiresAt
    ? new Date(request.expiresAt).getTime() < Date.now()
    : false;

  return (
    <div className="es-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="es-card">
        <button className="es-card__close" onClick={onClose} aria-label="Cerrar">✕</button>

        {loading && (
          <div className="es-card__loading"><p>Cargando solicitud…</p></div>
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

        {!loading && !error && !success && request && (
          <>
            <h2 className="es-title">Revisar propuesta de modificación</h2>

            {request.sessionTitle && (
              <p className="es-session-name">{request.sessionTitle}</p>
            )}

            {/* Current vs proposed — clearly differentiated */}
            <div className="es-session-details">
              {request.currentModality && (
                <div className="es-detail-item">
                  <div className="es-detail-item__label">Modalidad actual</div>
                  <div className="es-detail-item__value">{modalityLabel(request.currentModality)}</div>
                </div>
              )}  
              {request.newModality && (
                <div className="es-detail-item" style={{ borderColor: '#7c3aed' }}>
                  <div className="es-detail-item__label">Modalidad propuesta</div>
                  <div className="es-detail-item__value" style={{ color: '#7c3aed' }}>
                    {modalityLabel(request.newModality)}
                  </div>
                </div>
              )}
              {request.currentDurationHours && (
                <div className="es-detail-item">
                  <div className="es-detail-item__label">Duración actual</div>
                  <div className="es-detail-item__value">{request.currentDurationHours}h</div>
                </div>
              )}
              {request.newDurationHours && (
                <div className="es-detail-item" style={{ borderColor: '#7c3aed' }}>
                  <div className="es-detail-item__label">Duración propuesta</div>
                  <div className="es-detail-item__value" style={{ color: '#7c3aed' }}>
                    {request.newDurationHours}h
                  </div>
                </div>
              )}
            </div>

            {/* Expiration */}
            {request.expiresAt && (
              <div className={`es-expiration ${isExpired ? 'es-expiration--expired' : ''}`}>
                {isExpired
                  ? '⚠ Esta propuesta ha expirado'
                  : `Expira: ${new Date(request.expiresAt).toLocaleString('es-CO')}`
                }
              </div>
            )}

            {!isExpired && (
              <div className="es-footer">
                <button
                  className="es-btn es-btn--reject"
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Procesando…' : 'Rechazar'}
                </button>
                <button
                  className="es-btn es-btn--confirm"
                  onClick={() => handleAction('accept')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Procesando…' : 'Aceptar'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModificationDialog;
