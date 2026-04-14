// EditSessionView.tsx — Tutor only
// T014: 4 controlled inputs pre-populated with current session values
// T015: Connected to editSession service

import { useState } from 'react';
import type { Session, EditSessionBody } from '../types/session.types';
import { editSession } from '../services/sessionService';


interface Props {
  session: Session;
  onBack: () => void;
  onSuccess: () => void;
}

export const EditSessionView = ({ session, onBack, onSuccess }: Props) => {
  const [title, setTitle]             = useState(session.title);
  const [description, setDescription] = useState(session.description);
  const [location, setLocation]       = useState(session.location || '');
  const [virtualLink, setVirtualLink] = useState(session.virtualLink || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

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
      await editSession(session.id, body);
      setSuccess(true);
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar cambios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-view modal-view--success" aria-live="polite">
        <p>✓ Sesión actualizada exitosamente.</p>
      </div>
    );
  }

  return (
    <div className="modal-view modal-view--edit">
      <h3 className="modal-view__title">Editar sesión</h3>

      <div className="form-field">
        <label htmlFor="edit-title" className="form-field__label">Título</label>
        <input
          id="edit-title"
          type="text"
          className="form-field__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la sesión"
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-description" className="form-field__label">Descripción</label>
        <textarea
          id="edit-description"
          className="form-field__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Descripción de la sesión"
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-location" className="form-field__label">Lugar de encuentro</label>
        <input
          id="edit-location"
          type="text"
          className="form-field__input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej. Sala 204, Biblioteca B"
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-virtual-link" className="form-field__label">Link virtual</label>
        <input
          id="edit-virtual-link"
          type="url"
          className="form-field__input"
          value={virtualLink}
          onChange={(e) => setVirtualLink(e.target.value)}
          placeholder="https://meet.example.com/sesion"
        />
      </div>

      {error && <p className="modal-view__error" role="alert">{error}</p>}

      <div className="modal-view__footer">
        <button className="sdv-btn sdv-btn--propose" onClick={onBack} disabled={isSubmitting}>
          Cancelar
        </button>
        <button
          className="sdv-btn sdv-btn--edit"
          onClick={handleConfirm}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Guardando…' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
};

export default EditSessionView;