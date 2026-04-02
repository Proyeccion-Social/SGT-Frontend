// ProposeModificationView.tsx
// T012: 3 controlled selectors — modality, schedule, duration (slot placeholder until T003 complete)
// T013: Connected to modifySession service
// Fix: body ahora usa los campos reales de ModifySessionBody

import { useState } from 'react';
import type { Session, ModifySessionBody } from '../../sessions/types/session.types';
import { modifySession } from '../services/sessionService';
import { useAuthStore } from '../../../store/authStore'; // adjust path as needed

interface Props {
  session: Session;
  onBack: () => void;
  onSuccess: () => void;
}

type Modality = 'virtual' | 'in-person' | '';

export const ProposeModificationView = ({ session, onBack, onSuccess }: Props) => {
  const [newModality, setNewModality]         = useState<Modality>('');
  const [newAvailabilityID, setNewAvailabilityID] = useState<string>('');
  const [newDurationHours, setNewDurationHours]   = useState<string>('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState(false);

  const token = useAuthStore((s) => s.token);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    // Construir body solo con los campos que el usuario modificó
    const body: ModifySessionBody = {
      ...(newModality        && { newModality }),
      ...(newAvailabilityID  && { newAvailabilityID }),
      ...(newDurationHours   && { newDurationHours: Number(newDurationHours) }),
    };

    try {
      await modifySession(session.id, body, token);
      setSuccess(true);
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to propose modification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-view modal-view--success" aria-live="polite">
        <p>✓ Modification proposed successfully.</p>
      </div>
    );
  }

  return (
    <div className="modal-view modal-view--propose">
      <h3 className="modal-view__title">Propose Modification</h3>

      {/* Modality selector */}
      <div className="form-field">
        <label htmlFor="modality-select" className="form-field__label">
          Modality
        </label>
        <select
          id="modality-select"
          className="form-field__select"
          value={newModality}
          onChange={(e) => setNewModality(e.target.value as Modality)}
        >
          <option value="">No change</option>
          <option value="virtual">Virtual</option>
          <option value="in-person">In-Person</option>
        </select>
      </div>

      {/* Duration selector */}
      <div className="form-field">
        <label htmlFor="duration-select" className="form-field__label">
          Duration (hours)
        </label>
        <select
          id="duration-select"
          className="form-field__select"
          value={newDurationHours}
          onChange={(e) => setNewDurationHours(e.target.value)}
        >
          <option value="">No change</option>
          <option value="1">1 hour</option>
          <option value="1.5">1.5 hours</option>
          <option value="2">2 hours</option>
          <option value="2.5">2.5 hours</option>
          <option value="3">3 hours</option>
        </select>
      </div>

      {/* Schedule selector — T003 stub: disabled hasta que AvailabilitySlot esté tipado */}
      <div className="form-field">
        <label htmlFor="slot-select" className="form-field__label">
          Schedule
        </label>
        <select
          id="slot-select"
          className="form-field__select"
          value={newAvailabilityID}
          onChange={(e) => setNewAvailabilityID(e.target.value)}
          disabled
          title="Schedule selector pending backend slot shape confirmation (T003)"
        >
          <option value="">Slot selection coming soon…</option>
        </select>
        <p className="form-field__hint">
          Schedule modification will be available once tutor availability is confirmed.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="modal-view__error" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="modal-view__footer">
        <button
          className="btn btn--ghost"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="btn btn--green"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

export default ProposeModificationView;