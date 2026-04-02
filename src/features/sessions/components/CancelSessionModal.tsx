// CancelSessionModal.tsx
// T010: Modal UI — mandatory textarea, disabled button when empty
// T011: useCancelSession wiring — canCancel check, cancel call, success/error handling

import { useState } from 'react';
import type { Session } from '../types/session.types';
import { useCancelSession } from '../hooks/useCancelSession';

interface Props {
  session: Session;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelSessionModal = ({ session, onClose, onSuccess }: Props) => {
  const [reason, setReason] = useState('');
  const [windowWarning, setWindowWarning] = useState(false);

  // T011: hook already exists — do not reimplement
  const { canCancel, cancel, isLoading, error } = useCancelSession();

  const handleCancel = async () => {
    // T011: 24h window check
    if (!canCancel(session)) {
      setWindowWarning(true);
      return;
    }

    setWindowWarning(false);
    await cancel(session.id, reason);
    // useCancelSession sets error on failure; on success we call onSuccess
    if (!error) {
      onSuccess();
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel session"
    >
      <div className="modal-card modal-card--cancel">
        {/* Close */}
        <button
          className="modal-card__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="cancel-modal__title">
          Before you go, explain why you want to cancel this tutoring session
        </h2>

        <p className="cancel-modal__session-name">{session.title}</p>

        {/* T010: Mandatory textarea */}
        <textarea
          className="cancel-modal__textarea"
          placeholder="Write your justification here…"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setWindowWarning(false);
          }}
          rows={5}
          aria-label="Cancellation justification"
          aria-required="true"
        />

        {/* T011: 24h window warning */}
        {windowWarning && (
          <p className="cancel-modal__warning" role="alert">
            The cancellation window for this session has already passed.
          </p>
        )}

        {/* T011: Server error */}
        {error && (
          <p className="cancel-modal__error" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        {/* Footer */}
        <div className="cancel-modal__footer">
          <button
            className="btn btn--ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Go Back
          </button>

          {/* T010: Disabled when textarea is empty */}
          <button
            className="btn btn--red"
            onClick={handleCancel}
            disabled={reason.trim() === '' || isLoading}
            aria-disabled={reason.trim() === '' || isLoading}
          >
            {isLoading ? 'Cancelling…' : 'Cancel Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSessionModal;