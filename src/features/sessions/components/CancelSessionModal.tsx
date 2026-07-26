// CancelSessionModal.tsx
import './styles/SessionDetailView.css';
import './styles/CancelSessionModal.css';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { sileo, Toaster } from 'sileo';
import type { Session } from '../types/session.types';

const REASON_MAX = 500;

interface Props {
  session: Session;
  session_id: string;
  onClose: () => void;
  onSuccess: () => void;
  canCancel: (session: Session) => boolean;
  cancelar: (sessionId: string, reason: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const CancelSessionModal = ({
  session,
  onClose,
  onSuccess,
  canCancel,
  cancelar,
}: Props) => {
  const [reason, setReason] = useState('');
  const [windowWarning, setWindowWarning] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setValidationError('El motivo de cancelación es obligatorio.');
      return;
    }
    if (!canCancel(session)) {
      setWindowWarning(true);
      return;
    }
    setWindowWarning(false);
    setValidationError(null);
    setSubmitError(null);
    setIsCancelling(true);
    await sileo
      .promise(
        async () => {
          const ok = await cancelar(session.id, trimmed);
          if (!ok) throw new Error('No se pudo cancelar la sesión.');
          onSuccess();
        },
        {
          loading: { title: 'Cancelando sesión...' },
          success: {
            title: 'Sesión cancelada',
            description: 'La tutoría ha sido cancelada exitosamente.',
            fill: '#2ecc71',
          },
          error: { title: 'Error al cancelar', fill: '#f35761' },
        }
      )
      .catch(() => {
        setSubmitError('No se pudo cancelar la tutoría. Intenta de nuevo.');
      })
      .finally(() => {
        setIsCancelling(false);
      });
  };

  return createPortal(
    <div
      className="modal-overlay modal-overlay--reason"
      role="dialog"
      aria-modal="true"
      aria-label="Cancelar tutoría"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCancelling) onClose();
      }}
    >
      <Toaster position="top-center" />
      <div className="modal-card modal-card--cancel">
        <button
          type="button"
          className="modal-card__close--reason"
          onClick={onClose}
          disabled={isCancelling}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="cancel-modal__title">
          Antes de irte, explica por qué quieres cancelar esta tutoría
        </h2>

        <textarea
          className="cancel-modal__textarea"
          placeholder="Escribe tu justificación aquí…"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value.slice(0, REASON_MAX));
            setWindowWarning(false);
            setValidationError(null);
            setSubmitError(null);
          }}
          rows={5}
          maxLength={REASON_MAX}
          aria-label="Justificación de cancelación"
          aria-required="true"
          aria-invalid={!!validationError}
          disabled={isCancelling}
        />

        <p className="cancel-modal__counter" aria-live="polite">
          {reason.length}/{REASON_MAX}
        </p>

        {windowWarning && (
          <p className="cancel-modal__warning" role="alert">
            La ventana de cancelación para esta sesión ya expiró.
          </p>
        )}

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
            disabled={isCancelling}
          >
            Volver
          </button>
          <button
            type="button"
            className="sdv-btn sdv-btn--cancel"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelando…' : 'Cancelar tutoría'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CancelSessionModal;