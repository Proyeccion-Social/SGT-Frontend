// EditSessionView.tsx — Tutor only
// T014: 4 controlled inputs pre-populated with current session values
// T015: Connected to editSession service

import { useState } from 'react';
import { sileo } from 'sileo';
import type { Session, EditSessionBody } from '../types/session.types';
import { useSessionStore } from '@/store/sessionStore';
import './styles/EditField.css';


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
 
  const handleConfirm = async () => {
    onSubmittingChange?.(true);

    const body: EditSessionBody = {
      title,
      description,
      ...(virtualLink.trim() && { virtualLink }),
      ...(location.trim()    && { location }),
    };

    const success = await editar(session.id, body);

    if (success) {
      sileo.action({
        title: 'Cambios guardados',
        description: 'La sesión ha sido actualizada.',
        fill: '#2ecc71',
      });
      onSuccess();
    } else {
      const errorMsg = useSessionStore.getState().error ?? 'Error al guardar los cambios';
      sileo.action({
        title: 'Error al guardar',
        description: errorMsg,
        fill: '#f35761',
      });
    }

    onSubmittingChange?.(false);
  };
 
  if (triggerSubmitRef) {
    triggerSubmitRef.current = handleConfirm;
  }
 
  return (
    <div className="pmf">

      {/* ── Fila 1: Título ── */}
      <div className="pmf__row pmf__row--full">
        <input
          id="edit-title"
          type="text"
          className="ef"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la sesión"
        />
      </div>

      {/* ── Fila 2: Descripción ── */}
      <div className="pmf__row pmf__row--full">
        <textarea
          id="edit-description"
          className="ef ef--textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descripción de la sesión"
        />
      </div>

      {/* ── Fila 3: Lugar + Link virtual ── */}
      <div className="pmf__row">
        <input
          id="edit-location"
          type="text"
          className="ef"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej. Sala 204, Biblioteca B"
        />
        <input
          id="edit-virtual-link"
          type="url"
          className="ef"
          value={virtualLink}
          onChange={(e) => setVirtualLink(e.target.value)}
          placeholder="https://meet.example.com/sesion"
        />
      </div>



    </div>
  );
};
 
export default EditSessionForm;