// CancelSessionModal.tsx
import './styles/SessionDetailView.css';
import './styles/CancelSessionModal.css';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { sileo, Toaster } from 'sileo';
import type { CancelResult, Session } from '../types/session.types';
import { canCancelSession } from '../utils/sessionStatus';

const REASON_MAX = 500;

interface Props {
  session: Session;
  session_id: string;
  onClose: () => void;
  onSuccess: () => void;
  cancelar: (sessionId: string, reason: string) => Promise<CancelResult>;
  isLoading: boolean;
  error: string | null;
}

export const CancelSessionModal = ({
  session,
  onClose,
  onSuccess,
  cancelar,
}: Props) => {
  const [reason, setReason] = useState('');
  const [windowWarning, setWindowWarning] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setValidationError('El motivo de cancelación es obligatorio.');
      return;
    }

    // Fuente única de la regla de 24h: sessionStatus.canCancelSession.
    const availability = canCancelSession(session);
    if (!availability.visible || availability.disabled) {
      setWindowWarning(
        availability.reason ?? 'Esta tutoría ya no se puede cancelar.'
      );
      return;
    }

    setWindowWarning(null);
    setValidationError(null);
    setSubmitError(null);
    setIsCancelling(true);
    await sileo
      .promise<CancelResult>(
        async () => {
          const result = await cancelar(session.id, trimmed);
          // El backend responde 200 con `{ success, message }` y los errores de
          // negocio con `{ statusCode, message, error }`; en ambos casos el
          // texto que se muestra es el suyo, no uno inventado en el frontend.
          if (!result.ok) throw new Error(result.message);
          onSuccess();
          return result;
        },
        {
          loading: { title: 'Cancelando sesión...' },
          // Título neutro a propósito: el `message` del backend es lo único que
          // distingue un abandono grupal parcial de una cancelación completa.
          success: (result) => ({
            title: 'Listo',
            description: result.ok ? result.message : '',
            fill: '#2ecc71',
          }),
          error: (err) => ({
            title: 'No se pudo cancelar',
            description:
              err instanceof Error
                ? err.message
                : 'No se pudo cancelar la tutoría. Intenta de nuevo.',
            fill: '#f35761',
          }),
        }
      )
      .catch((err) => {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'No se pudo cancelar la tutoría. Intenta de nuevo.'
        );
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
            setWindowWarning(null);
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
            {windowWarning}
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