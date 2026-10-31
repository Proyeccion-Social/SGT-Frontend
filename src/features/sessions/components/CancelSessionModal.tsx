// CancelSessionModal.tsx
import './styles/SessionDetailView.css';
import './styles/CancelSessionModal.css';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { sileo, Toaster } from 'sileo';
import type { UserRole } from '@/constants/roles';
import type { CancelResult, Session } from '../types/session.types';
import { canCancelSession, canWithdrawRequest } from '../utils/sessionStatus';

const REASON_MAX = 500;
/** Mínimo del motivo al retirar (si se escribe), igual que `WithdrawSessionDto`. */
const WITHDRAW_REASON_MIN = 10;

// Textos por modo. "withdraw" = retirar una solicitud PENDING_TUTOR_CONFIRMATION.
const COPY = {
  cancel: {
    dialogLabel: 'Cancelar tutoría',
    title: 'Antes de irte, explica por qué quieres cancelar esta tutoría',
    placeholder: 'Escribe tu justificación aquí…',
    loading: 'Cancelando sesión...',
    errorTitle: 'No se pudo cancelar',
    errorFallback: 'No se pudo cancelar la tutoría. Intenta de nuevo.',
    blocked: 'Esta tutoría ya no se puede cancelar.',
    submit: 'Cancelar tutoría',
    submitting: 'Cancelando…',
  },
  withdraw: {
    dialogLabel: 'Retirar solicitud',
    title: '¿Quieres retirar esta solicitud de tutoría?',
    placeholder: 'Motivo (opcional)…',
    loading: 'Retirando solicitud...',
    errorTitle: 'No se pudo retirar',
    errorFallback: 'No se pudo retirar la solicitud. Intenta de nuevo.',
    blocked: 'Esta solicitud ya no se puede retirar.',
    submit: 'Retirar solicitud',
    submitting: 'Retirando…',
  },
} as const;

interface Props {
  session: Session;
  session_id: string;
  role: UserRole;
  onClose: () => void;
  onSuccess: () => void;
  cancelar: (sessionId: string, reason: string) => Promise<CancelResult>;
  /** Retira una solicitud pendiente; el motivo es opcional. */
  retirar: (sessionId: string, reason?: string) => Promise<CancelResult>;
  isLoading: boolean;
  error: string | null;
}

export const CancelSessionModal = ({
  session,
  role,
  onClose,
  onSuccess,
  cancelar,
  retirar,
}: Props) => {
  // El modo sale del estado: el backend tiene un endpoint distinto para cada caso.
  const mode =
    String(session.status) === 'PENDING_TUTOR_CONFIRMATION' ? 'withdraw' : 'cancel';
  const copy = COPY[mode];
  const [reason, setReason] = useState('');
  const [windowWarning, setWindowWarning] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    const trimmed = reason.trim();
    if (mode === 'cancel' && !trimmed) {
      setValidationError('El motivo de cancelación es obligatorio.');
      return;
    }
    if (mode === 'withdraw' && trimmed && trimmed.length < WITHDRAW_REASON_MIN) {
      setValidationError(
        `Si escribes un motivo, debe tener al menos ${WITHDRAW_REASON_MIN} caracteres.`
      );
      return;
    }

    // Fuente única de las reglas: sessionStatus (24h para cancelar, admin exento;
    // retiro solo para el estudiante). El backend sigue validando los permisos.
    const availability =
      mode === 'withdraw'
        ? canWithdrawRequest(session, role)
        : canCancelSession(session, role);
    if (!availability.visible || availability.disabled) {
      setWindowWarning(availability.reason ?? copy.blocked);
      return;
    }

    setWindowWarning(null);
    setValidationError(null);
    setSubmitError(null);
    setIsCancelling(true);
    await sileo
      .promise<CancelResult>(
        async () => {
          const result =
            mode === 'withdraw'
              ? await retirar(session.id, trimmed || undefined)
              : await cancelar(session.id, trimmed);
          // El backend responde 200 con `{ success, message }` y los errores de
          // negocio con `{ statusCode, message, error }`; en ambos casos el
          // texto que se muestra es el suyo, no uno inventado en el frontend.
          if (!result.ok) throw new Error(result.message);
          onSuccess();
          return result;
        },
        {
          loading: { title: copy.loading },
          // Título neutro a propósito: el `message` del backend es lo único que
          // distingue un abandono grupal parcial de una cancelación completa.
          success: (result) => ({
            title: 'Listo',
            description: result.ok ? result.message : '',
            fill: '#2ecc71',
          }),
          error: (err) => ({
            title: copy.errorTitle,
            description: err instanceof Error ? err.message : copy.errorFallback,
            fill: '#f35761',
          }),
        }
      )
      .catch((err) => {
        setSubmitError(err instanceof Error ? err.message : copy.errorFallback);
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
      aria-label={copy.dialogLabel}
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

        <h2 className="cancel-modal__title">{copy.title}</h2>

        <textarea
          className="cancel-modal__textarea"
          placeholder={copy.placeholder}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value.slice(0, REASON_MAX));
            setWindowWarning(null);
            setValidationError(null);
            setSubmitError(null);
          }}
          rows={5}
          maxLength={REASON_MAX}
          aria-label={mode === 'withdraw' ? 'Motivo del retiro (opcional)' : 'Justificación de cancelación'}
          aria-required={mode === 'cancel'}
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
            {isCancelling ? copy.submitting : copy.submit}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CancelSessionModal;