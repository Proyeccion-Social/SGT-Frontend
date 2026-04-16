// SessionDetailModal.tsx
// Modal shell — backdrop blur, ModalView state, Escape/backdrop close

import { useState, useEffect, useCallback } from 'react';
import './styles/SessionDetailModal.css';
import type { Session, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { UserRole } from '@/constants/roles';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { SessionDetailView } from './SessionDetaiView';
import { useTutorSlots } from '../hooks/useAvailability';

export type ModalView = 'detail' | 'propose' | 'edit';
 
interface Props {
  sessionId: string;
  role: UserRole;
  onClose: () => void;
  onRequestCancel: (session: Session) => void;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
}
 
export const SessionDetailModal = ({ sessionId, role, onClose, onRequestCancel, modificar, editar }: Props) => {
  const [view, setView] = useState<ModalView>('detail');
  const { session, tutorInfo, isLoading, error } = useSessionDetail(sessionId);
  const { slots: availabilitySlots } = useTutorSlots(session?.tutor?.id ?? null); 
 
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );
 
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);
 
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
 
  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Session detail"
    >
      <div className="modal-card">
        <button className="modal-card__close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>
 
        {isLoading && (
          <div className="modal-card__loading" aria-live="polite">
            <p>Cargando sesión…</p>
          </div>
        )}
 
        {!isLoading && error && (
          <div className="modal-card__error" role="alert">
            <p>Error al cargar la sesión: {error}</p>
            <button className="sdv-btn sdv-btn--propose" onClick={onClose}>Cerrar</button>
          </div>
        )}
 
        {!isLoading && !error && session && (
          <SessionDetailView
            session={session}
            tutorInfo={tutorInfo}
            role={role}
            isProposing={view === 'propose'}
            isEditing={view === 'edit'}
            availabilitySlots={availabilitySlots}
            onProposeModification={() => setView('propose')}
            onBack={() => setView('detail')}
            onEdit={() => setView('edit')}
            onCancel={() => onRequestCancel(session)}
            onProposeSuccess={onClose}
            onEditSuccess={onClose}
            modificar={modificar} 
            editar={editar}
          />
        )}
      </div>
    </div>
  );
};
 
export default SessionDetailModal;