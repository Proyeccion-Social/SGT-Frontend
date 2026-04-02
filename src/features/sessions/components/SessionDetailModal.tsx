// SessionDetailModal.tsx
// T007: Modal shell — backdrop blur, ModalView state, Escape/backdrop close
import './styles/SessionsDetailModal.css'
import { useState, useEffect, useCallback } from 'react';
import type { Session } from '../types/session.types';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { SessionDetailView } from './SessionDetailView';
import { ProposeModificationView } from './ProposeModificationView';
import { EditSessionView } from './EditSessionView';

export type ModalView = 'detail' | 'propose' | 'edit';
 
interface Props {
  sessionId: string;
  role: 'tutor' | 'student';
  onClose: () => void;
  onRequestCancel: (session: Session) => void;
}
 
export const SessionDetailModal = ({ sessionId, role, onClose, onRequestCancel }: Props) => {
  const [view, setView] = useState<ModalView>('detail');
  const { session, tutorInfo, isLoading, error } = useSessionDetail(sessionId);
 
  // T007: Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );
 
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);
 
  // T007: Close on backdrop click
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
        {/* Close button */}
        <button
          className="modal-card__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
 
        {/* Loading state */}
        {isLoading && (
          <div className="modal-card__loading" aria-live="polite">
            <div className="spinner" />
            <p>Loading session details…</p>
          </div>
        )}
 
        {/* Error state */}
        {!isLoading && error && (
          <div className="modal-card__error" role="alert">
            <p>Failed to load session: {error}</p>
            <button className="btn btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
 
        {/* Content views */}
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
 
            {view === 'edit' && role === 'tutor' && (
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