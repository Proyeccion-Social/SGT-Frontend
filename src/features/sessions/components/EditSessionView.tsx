// EditSessionView.tsx — Tutor only
// T014: 4 controlled inputs pre-populated with current session values
// T015: Connected to editSession service

import { useState } from 'react';
import { sileo } from 'sileo';
import type { Session, EditSessionBody } from '../types/session.types';
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

    if (session.modality === 'VIRT' && !virtualLink.trim()) {
      sileo.action({
        title: 'Error de validación',
        description: 'El link es obligatorio para sesiones virtuales.',
        fill: '#f35761',
        styles: { badge: '#ffffff' }
      });
      onSubmittingChange?.(false);
      return;
    }

    if (session.modality === 'PRES' && !location.trim()) {
      sileo.action({
        title: 'Error de validación',
        description: 'El salón es obligatorio para sesiones presenciales.',
        fill: '#f35761',
        styles: { badge: '#ffffff' }
      });
      onSubmittingChange?.(false);
      return;
    }

    const body: EditSessionBody = {
      title,
      description,
      ...(session.modality === 'VIRT' && virtualLink.trim() ? { virtualLink } : {}),
      ...(session.modality === 'PRES' && location.trim() ? { location } : {}),
    };

    await sileo.promise(
      async () => {
        const success = await editar(session.id, body);
        if (!success) throw new Error('No se pudieron guardar los cambios.');
        onSuccess();
      },
      {
        loading: { title: 'Guardando cambios...' },
        success: { title: 'Cambios guardados',  description: 'La sesión ha sido actualizada.', fill: '#2ecc71' },
        error:   { title: 'Error al guardar',   fill: '#f35761' },
      }
    ).finally(() => {
      onSubmittingChange?.(false);
    });
  };
 
  if (triggerSubmitRef) {
    triggerSubmitRef.current = handleConfirm;
  }
 
  return (
    <div className="pmf">

      {/* ── Fila 1: Título ── */}
      <div className="pmf__row pmf__row--full">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sdv-gray-dark, #475569)', marginLeft: '4px' }}>Título</label>
          <input
            id="edit-title"
            type="text"
            className="ef"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la sesión"
          />
        </div>
      </div>

      {/* ── Fila 2: Descripción ── */}
      <div className="pmf__row pmf__row--full">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sdv-gray-dark, #475569)', marginLeft: '4px' }}>Descripción</label>
          <textarea
            id="edit-description"
            className="ef ef--textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descripción de la sesión"
          />
        </div>
      </div>

      {/* ── Fila 3: Lugar o Link virtual ── */}
      <div className="pmf__row pmf__row--full">
        {session.modality === 'PRES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sdv-gray-dark, #475569)', marginLeft: '4px' }}>Salón / Lugar</label>
            <input
              id="edit-location"
              type="text"
              className="ef"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Sala 204, Biblioteca B"
            />
          </div>
        )}
        {session.modality === 'VIRT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sdv-gray-dark, #475569)', marginLeft: '4px' }}>Link de la reunión</label>
            <input
              id="edit-virtual-link"
              type="url"
              className="ef"
              value={virtualLink}
              onChange={(e) => setVirtualLink(e.target.value)}
              placeholder="https://meet.example.com/sesion"
            />
          </div>
        )}
      </div>

    </div>
  );
};
 
export default EditSessionForm;