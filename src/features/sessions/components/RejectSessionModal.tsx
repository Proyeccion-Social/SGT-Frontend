import './styles/SessionDetailView.css';
import './styles/CancelSessionModal.css';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { sileo, Toaster } from 'sileo';
import type { Session } from '../types/session.types';

const REASON_MAX = 500;

interface Props {
  session: Session;
  onClose: () => void;
  onSuccess: () => void;
  rechazar: (sessionId: string, reason: string) => Promise<boolean>;
}

export const RejectSessionModal = ({
  session,
  onClose,
  onSuccess,
  rechazar,
}: Props) => {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleReject = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setValidationError('El motivo de rechazo es obligatorio.');
      return;
    }
    setValidationError(null);
    setSubmitError(null);
    setIsRejecting(true);
    await sileo
      .promise(
        async () => {
          const ok = await rechazar(session.id, trimmed);
          if (!ok) throw new Error('No se pudo rechazar la sesión.');
          onSuccess();
        },
        {
          loading: { title: 'Rechazando tutoría…' },
          success: {
            title: 'Tutoría rechazada',
            description: 'La propuesta ha sido rechazada exitosamente.',
            fill: '#2ecc71',
          },
          error: { title: 'Error al rechazar', fill: '#f35761' },
        }
      )
      .catch(() => {
        setSubmitError('No se pudo rechazar la tutoría. Intenta de nuevo.');
      })
      .finally(() => {
        setIsRejecting(false);
      });
  };

  return createPortal(
    <div
      className="modal-overlay modal-overlay--reason"
      role="dialog"
      aria-modal="true"
      aria-label="Rechazar tutoría"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRejecting) onClose();
      }}
    >
      <Toaster position="top-center" />
      <div className="modal-card modal-card--reason">
        <button
          type="button"
          className="modal-card__close--reason"
          onClick={onClose}
          disabled={isRejecting}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="cancel-modal__title">
          Antes de irte, explica por qué quieres rechazar esta tutoría
        </h2>

        <textarea
          className="cancel-modal__textarea"
          placeholder="Escribe el motivo del rechazo…"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value.slice(0, REASON_MAX));
            setValidationError(null);
            setSubmitError(null);
          }}
          rows={5}
          maxLength={REASON_MAX}
          aria-label="Motivo de rechazo"
          aria-required="true"
          aria-invalid={!!validationError}
          disabled={isRejecting}
        />

        <p className="cancel-modal__counter" aria-live="polite">
          {reason.length}/{REASON_MAX}
        </p>

        {validationError && (
          <p className="cancel-modal__error" role="alert">
            {validationError}
          </p>
        )}

        {submitError && (
          <p className="cancel-modal__error" role="alert">
            {submitError}
          </p>
        )}

        <div className="cancel-modal__footer">
          <button
            type="button"
            className="sdv-btn sdv-btn--propose"
            onClick={onClose}
            disabled={isRejecting}
          >
            Volver
          </button>
          <button
            type="button"
            className="sdv-btn sdv-btn--cancel"
            onClick={handleReject}
            disabled={isRejecting}
          >
            {isRejecting ? 'Rechazando…' : 'Rechazar tutoría'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RejectSessionModal;
