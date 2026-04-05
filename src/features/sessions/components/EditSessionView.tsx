// EditSessionView.tsx — Tutor only
// T014: 4 controlled inputs pre-populated with current session values
// T015: Connected to editSession service

import { useState } from 'react';
import type { Session, EditSessionBody } from '../types/session.types';

interface Props {
  session: Session;
  onSuccess: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
  triggerSubmitRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
}
 
export const EditSessionForm = ({
  session,
  onSuccess,
  onSubmittingChange,
  triggerSubmitRef,
  editar,
}: Props) => {
  const [title,       setTitle]       = useState(session.title);
  const [description, setDescription] = useState(session.description);
  const [location,    setLocation]    = useState('');
  const [virtualLink, setVirtualLink] = useState('');
  const [error,       setError]       = useState<string | null>(null);
 
  const handleConfirm = async () => {
    setError(null);
    onSubmittingChange?.(true);
 
    const body: EditSessionBody = {
      title,
      description,
      ...(virtualLink.trim() && { virtualLink }),
      ...(location.trim()    && { location }),
    };
 
    try {
      const success = await editar(session.id, body);
      if (!success) throw new Error('No se pudieron guardar los cambios.');
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar cambios.');
    } finally {
      onSubmittingChange?.(false);
    }
  };
 
  if (triggerSubmitRef) {
    triggerSubmitRef.current = handleConfirm;
  }
 
  return (
    <div className="pmf">
 
      {/* ── Fila 1: Título + Descripción ── */}
      <div className="pmf__row">
 
        <div className="pmf__card pmf__card--unratio">
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
        </div>
 
        <div className="pmf__card pmf__card--unratio">
          <div className="form-field">
            <label htmlFor="edit-description" className="form-field__label">Descripción</label>
            <textarea
              id="edit-description"
              className="form-field__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descripción de la sesión"
            />
          </div>
        </div>
 
      </div>
 
      {/* ── Fila 2: Lugar + Link virtual ── */}
      <div className="pmf__row">
 
        <div className="pmf__card pmf__card--unratio">
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
        </div>
 
        <div className="pmf__card pmf__card--unratio">
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
        </div>
 
      </div>
 
      {error && <p className="pmf__error" role="alert">{error}</p>}
 
    </div>
  );
};
 
export default EditSessionForm;