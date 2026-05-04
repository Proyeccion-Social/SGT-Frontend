// ReviewModificationDialog.tsx
// Email action: accept or reject a modification request
// Task 1 — Vista de aceptar/rechazar propuesta de modificación

import { useState, useEffect, useCallback } from 'react';
import '../styles/ReviewModificationDialog.css';
import { Monitor, Clock, Calendar, CheckCircle, X } from 'lucide-react';

interface Props {
  requestId: string;
  onClose: () => void;
}

interface ModificationRequest {
  id: string;
  sessionId: string;
  sessionTitle?: string;
  sessionDescription?: string;
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
  const [showCurrent, setShowCurrent]     = useState(false);

  useEffect(() => {
    fetch(`/api/emailScreens/modification-requests/${requestId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setRequest(data);
      })
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

      const payload = { requestId, sessionId: request.sessionId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
            {/* Header section */}
            <div className="es-header">
              <div className="es-avatar es-avatar--placeholder">
                {request.proposedBy?.charAt(0) ?? 'T'}
              </div>
              <div className={`es-header-text ${showCurrent ? 'es-header-text--faded' : ''}`}>
                <h2 className="es-title">{request.sessionTitle || 'Propuesta de sesión'}</h2>
                <p className="es-description">{request.sessionDescription || 'Sin descripción disponible.'}</p>
              </div>
            </div>

            {/* Tags row */}
            <div className="es-tags">
              <span className="es-tag es-tag--subject">Diferencial</span>
              <span className="es-tag es-tag--tutor">
                <span className="es-tag__dot" />
                {request.proposedBy}
              </span>
              <span className="es-tag es-tag--status">Pendiente</span>
              {request.currentModality && (
                <a 
                  href={request.currentModality === 'VIRT' ? (request.currentVirtualLink || '#') : '#'} 
                  target={request.currentModality === 'VIRT' && request.currentVirtualLink ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`es-tag es-tag--link ${request.currentModality === 'PRES' ? 'es-tag--pres' : ''}`} 
                  onClick={(e) => {
                    if (request.currentModality === 'PRES' || !request.currentVirtualLink) {
                      e.preventDefault();
                      if (request.currentModality === 'PRES' && request.currentLocation) {
                        alert(`Ubicación: ${request.currentLocation}`);
                      }
                    }
                  }}
                  title={request.currentModality === 'VIRT' ? 'Abrir link de sesión' : 'Ver ubicación física'}
                >
                  🔗 {request.currentModality === 'VIRT' ? 'Ver link de sesión' : (request.currentLocation || 'Ver ubicación')}
                </a>
              )}
            </div>

            {/* Modification section */}
            <h3 className="es-section-title">
              <span className="es-section-dot" />
              Propuesta de modificación
              <span 
                className="es-section-link" 
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? 'Ver propuesta' : 'Ver estado actual'}
              </span>
            </h3>

            <div className="es-mod-row">
              <div className={`es-info-card--mod ${showCurrent ? 'es-info-card--current' : ''}`}>
                <div className="es-info-card__icon">
                  <Monitor size={18} />
                </div>
                <span className="es-info-card__label">
                  {showCurrent ? modalityLabel(request.currentModality) : modalityLabel(request.newModality)}
                </span>
              </div>
              
              <div className={`es-info-card--mod ${showCurrent ? 'es-info-card--current' : ''}`}>
                <div className="es-info-card__icon">
                  <CheckCircle size={18} />
                </div>
                <span className="es-info-card__label">
                  {showCurrent ? 'Cerrada' : 'Abierta'}
                </span>
              </div>
            </div>

            <div className={`es-info-card--mod es-info-card--full ${showCurrent ? 'es-info-card--current' : ''} es-mb-20`}>
               <div className="es-info-card__icon">
                 <Calendar size={18} />
               </div>
               <span className="es-info-card__label">
                 {showCurrent 
                   ? (request.currentSchedule || 'Fecha original') 
                   : (request.newSchedule || 'Fecha propuesta')
                 }
               </span>
            </div>

            {/* Status or Expiration Message */}
            {request.status !== 'PENDING' ? (
              <div className="es-expiration es-expiration--processed">
                ✓ Esta propuesta ya ha sido {request.status === 'ACCEPTED' ? 'aceptada' : 'procesada'}.
              </div>
            ) : request.expiresAt && (
              <div className={`es-expiration ${isExpired ? 'es-expiration--expired' : ''} es-mb-20`}>
                {isExpired
                  ? '⚠ Esta propuesta ha expirado'
                  : `Expira: ${new Date(request.expiresAt).toLocaleString('es-CO')}`
                }
              </div>
            )}

            {!isExpired && request.status === 'PENDING' && (
              <div className="es-footer es-footer--modification">
                <button
                  className="es-btn es-btn--confirm"
                  onClick={() => handleAction('accept')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Procesando…' : 'Aceptar'}
                </button>
                <button
                  className="es-btn es-btn--reject"
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Procesando…' : 'Rechazar'}
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
