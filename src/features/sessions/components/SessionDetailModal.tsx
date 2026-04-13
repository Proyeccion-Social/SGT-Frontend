// SessionDetailModal.tsx
// Modal shell — backdrop blur, ModalView state, Escape/backdrop close

import { useState, useEffect, useCallback } from 'react';
import './styles/SessionDetailModal.css';
import type { Session } from '../types/session.types';
import { UserRole } from '@/constants/roles';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { SessionDetailView } from './SessionDetaiView';
import { ProposeModificationView } from './ProposeModificationView';
import { EditSessionView } from './EditSessionView';

export type ModalView = 'detail' | 'propose' | 'edit';

interface Props {
  sessionId: string;
  role: UserRole;
  onClose: () => void;
  onRequestCancel: (session: Session) => void;
}

export const SessionDetailModal = ({ sessionId, role, onClose, onRequestCancel }: Props) => {
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
          <>
            {view === 'detail' && (
              <SessionDetailView
                session={session}
                tutorInfo={tutorInfo}
                role={role}
                onProposeModification={() => setView('propose')}
                onEdit={() => setView('edit')}
                onCancel={() => onRequestCancel(session)}
              />
            )}
            {view === 'propose' && (
              <ProposeModificationView
                session={session}
                onBack={() => setView('detail')}
                onSuccess={onClose}
              />
            )}
            {view === 'edit' && role === UserRole.TUTOR && (
              <EditSessionView
                session={session}
                onBack={() => setView('detail')}
                onSuccess={onClose}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionDetailModal;