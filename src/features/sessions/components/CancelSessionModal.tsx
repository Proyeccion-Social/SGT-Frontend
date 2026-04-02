// CancelSessionModal.tsx
// T010: mandatory textarea, disabled button when empty
// T011: useCancelSession wiring — canCancel check, cancel call, success/error

import { useState } from 'react';
import type { Session } from '../types/session.types';
import { useCancelSession } from '../hooks/useCancelSession';

interface Props {
  session: Session;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelSessionModal = ({ session, onClose, onSuccess }: Props) => {
  const [reason, setReason]           = useState('');
  const [windowWarning, setWindowWarning] = useState(false);

  const { canCancel, cancel, isLoading, error } = useCancelSession();

  const handleCancel = async () => {
    if (!canCancel(session)) {
      setWindowWarning(true);
      return;
    }
    setWindowWarning(false);
    await cancel(session.id, reason);
    if (!error) onSuccess();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Cancel session">
      <div className="modal-card modal-card--cancel">
        <button className="modal-card__close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="cancel-modal__title">
          Antes de irte, explica por qué quieres cancelar esta tutoría
        </h2>

        <p className="cancel-modal__session-name">{session.title}</p>

        <textarea
          className="cancel-modal__textarea"
          placeholder="Escribe tu justificación aquí…"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setWindowWarning(false); }}
          rows={5}
          aria-label="Justificación de cancelación"
          aria-required="true"
        />

        {windowWarning && (
          <p className="cancel-modal__warning" role="alert">
            La ventana de cancelación para esta sesión ya expiró.
          </p>
        )}

        {error && (
          <p className="cancel-modal__error" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <div className="cancel-modal__footer">
          <button className="sdv-btn sdv-btn--propose" onClick={onClose} disabled={isLoading}>
            Volver
          </button>
          <button
            className="sdv-btn sdv-btn--cancel"
            onClick={handleCancel}
            disabled={reason.trim() === '' || isLoading}
          >
            {isLoading ? 'Cancelando…' : 'Cancelar tutoría'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSessionModal;