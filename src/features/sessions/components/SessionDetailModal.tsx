// SessionDetailModal.tsx
// Modal shell — backdrop blur, ModalView state, Escape/backdrop close

import { useState, useEffect, useCallback } from 'react';
import './styles/SessionDetailModal.css';
import type { Session, ModifySessionBody } from '../types/session.types';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { SessionDetailView } from './SessionDetaiView';

export type ModalView = 'detail' | 'propose' | 'edit';
 
interface Props {
  sessionId: string;
  role: 'tutor' | 'student';
  onClose: () => void;
  onRequestCancel: (session: Session) => void;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
}
 
export const SessionDetailModal = ({ sessionId, role, onClose, onRequestCancel, modificar }: Props) => {
  const [view, setView] = useState<ModalView>('detail');
  const { session, tutorInfo, isLoading, error } = useSessionDetail(sessionId);
 
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
            onProposeModification={() => setView('propose')}
            onBack={() => setView('detail')}
            onEdit={() => setView('edit')}
            onCancel={() => onRequestCancel(session)}
            onProposeSuccess={onClose}
            onEditSuccess={onClose}
            modificar={modificar} 
          />
        )}
      </div>
    </div>
  );
};
 
export default SessionDetailModal;