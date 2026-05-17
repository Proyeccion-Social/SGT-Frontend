import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './styles/SessionDetailModal.css';
import type { Session, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { UserRole } from '@/constants/roles';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { SessionDetailView } from './SessionDetaiView';
import { useTutorSlots } from '../hooks/useAvailability';
import MultiStepDialog from '@/features/history/components/MultiStepRating';
import { useAuthStore } from '@/store/authStore';

export type ModalView = 'detail' | 'propose' | 'edit' | 'reject' | 'evaluate';

interface Props {
  sessionId: string;
  role: UserRole;
  onClose: () => void;
  onRequestCancel: (session: Session) => void;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
  confirmar: (sessionId: string) => Promise<boolean>;
  rechazar: (sessionId: string, reason: string) => Promise<boolean>;
  aceptarModificacion: (sessionId: string, requestId?: string) => Promise<boolean>;
  rechazarModificacion: (sessionId: string, requestId?: string) => Promise<boolean>;
}
 
export const SessionDetailModal = ({ sessionId, role, onClose, onRequestCancel, modificar, editar, confirmar, rechazar, aceptarModificacion, rechazarModificacion }: Props) => {
  const [view, setView] = useState<ModalView>('detail');
  const { session, tutorInfo, isLoading, error } = useSessionDetail(sessionId);
  const { slots: availabilitySlots } = useTutorSlots(view === 'propose' ? (session?.tutor?.id ?? null) : null);
  const user = useAuthStore((s) => s.user);
 
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );
 
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [handleKeyDown]);
 
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const participant = session?.participants?.find((p: any) => p.id === user?.id);
  const canEvaluate = session?.status === 'COMPLETED' && String(role).toLowerCase() === UserRole.STUDENT && participant?.status !== 'ABSENT';
 
  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Session detail"
    >
      <div>
 
        {isLoading && (
          <div className="modal-card__loading" aria-live="polite">
            <button className="modal-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
            <p>Cargando sesión…</p>
          </div>
        )}
 
        {!isLoading && error && (
          <div className="modal-card__error" role="alert">
            <p>Error al cargar la sesión</p>
            <button className="sdv-btn sdv-btn--propose" onClick={onClose}>Cerrar</button>
          </div>
        )}
 
        {!isLoading && !error && session && (
          view === 'evaluate' ? (
            <MultiStepDialog
              session={session}
              userId={user?.id}
              onClose={() => {
                setView('detail');
                onClose(); // Automatically close the whole modal when evaluation completes
              }}
            />
          ) : (
            <SessionDetailView
              session={session}
              tutorInfo={tutorInfo}
              role={role}
              isProposing={view === 'propose'}
              isEditing={view === 'edit'}
              isRejecting={view === 'reject'}
              availabilitySlots={availabilitySlots}
              onClose={onClose}
              onProposeModification={() => setView('propose')}
              onBack={() => setView('detail')}
              onEdit={() => setView('edit')}
              onCancel={() => onRequestCancel(session)}
              onProposeSuccess={onClose}
              onEditSuccess={onClose}
              onConfirm={async () => {
                const ok = await confirmar(session.id);
                if (ok) onClose();
              }}
              onRequestReject={() => setView('reject')}
              onRejectSubmit={async (reason) => {
                const ok = await rechazar(session.id, reason);
                if (ok) onClose();
              }}
              onAcceptModification={async () => {
                const ok = await aceptarModificacion(session.id);
                if (!ok) throw new Error('No se pudo aceptar la modificación.');
                onClose();
              }}
              onRejectModification={async () => {
                const ok = await rechazarModificacion(session.id);
                if (!ok) throw new Error('No se pudo rechazar la modificación.');
                onClose();
              }}
              onEvaluate={canEvaluate ? () => setView('evaluate') : undefined}
              modificar={modificar}
              editar={editar}
            />
          )
        )}
      </div>
    </div>,
    document.body
  );
};
 
export default SessionDetailModal;