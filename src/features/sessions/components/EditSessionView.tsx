// EditSessionView.tsx
// T014: 4 controlled inputs — title, description, location, virtualLink
// T015: Connected to editSession service

import { useState } from 'react';
import type { Session, EditSessionBody } from '../types/session.types';
import { editSession } from '../services/sessionService';
import { useAuthStore } from '../../../store/authStore'; // adjust path as needed

interface Props {
  session: Session;
  onBack: () => void;
  onSuccess: () => void;
}

export const EditSessionView = ({ session, onBack, onSuccess }: Props) => {
  // T014: Pre-populate with current session values
  const [title, setTitle]               = useState(session.title);
  const [description, setDescription]   = useState(session.description);
  const [location, setLocation]         = useState('');
  const [virtualLink, setVirtualLink]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);

  const token = useAuthStore((s) => s.token);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    const body: EditSessionBody = {
      title,
      description,
      ...(virtualLink.trim() && { virtualLink }),
      ...(location.trim()    && { location }),
    };

    try {
      await editSession(session.id, body, token);
      setSuccess(true);
      // T015: On success close and reopen is simplest; here we notify parent
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-view modal-view--success" aria-live="polite">
        <p>✓ Session updated successfully.</p>
      </div>
    );
  }

  return (
    <div className="modal-view modal-view--edit">
      <h3 className="modal-view__title">Edit Session</h3>

      {/* Title */}
      <div className="form-field">
        <label htmlFor="edit-title" className="form-field__label">
          Title
        </label>
        <input
          id="edit-title"
          type="text"
          className="form-field__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session title"
        />
      </div>

      {/* Description */}
      <div className="form-field">
        <label htmlFor="edit-description" className="form-field__label">
          Description
        </label>
        <textarea
          id="edit-description"
          className="form-field__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Session description"
        />
      </div>

      {/* Meeting Location */}
      <div className="form-field">
        <label htmlFor="edit-location" className="form-field__label">
          Meeting Location
        </label>
        <input
          id="edit-location"
          type="text"
          className="form-field__input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Room 204, Library B"
        />
      </div>

      {/* Virtual Link — T002 confirmed field */}
      <div className="form-field">
        <label htmlFor="edit-virtual-link" className="form-field__label">
          Virtual Link
        </label>
        <input
          id="edit-virtual-link"
          type="url"
          className="form-field__input"
          value={virtualLink}
          onChange={(e) => setVirtualLink(e.target.value)}
          placeholder="https://meet.example.com/session"
        />
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
          className="btn btn--purple"
          onClick={handleConfirm}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Saving…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

export default EditSessionView;