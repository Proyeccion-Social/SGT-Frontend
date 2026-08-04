import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './styles/SessionDetailModal.css';
import type { Session, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { UserRole } from '@/constants/roles';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { SessionDetailView } from './SessionDetailView';
import { RejectSessionModal } from './RejectSessionModal';
import { useTutorSlots } from '../hooks/useAvailability';
import MultiStepDialog from '@/features/history/components/MultiStepRating';
import { useAuthStore } from '@/store/authStore';
import { canEvaluateSession } from '../utils/canEvaluate';
import { isSessionEvaluated } from '../utils/checkSessionEvaluated';
import AttendancePostSession from './AttendancePostSession';
import { sileo } from 'sileo';

export type ModalView = 'detail' | 'propose' | 'edit' | 'reject' | 'evaluate' | 'attendance';

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
  const { slots: availabilitySlots, loading: slotsLoading } = useTutorSlots(view === 'propose' ? (session?.tutor?.id ?? null) : null);
  const user = useAuthStore((s) => s.user);
  
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (view === 'reject' || view === 'attendance') {
        setView('detail');
        return;
      }
      onClose();
    },
    [onClose, view]
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

  const participant = session?.participants?.find((p) => p.id === user?.id);
  const canEvaluate =
    String(role).toLowerCase() === UserRole.STUDENT &&
    !!session &&
    canEvaluateSession(session, participant).canEvaluate;

  /** Abre la evaluación solo si el estudiante aún no calificó; si ya lo hizo, toast. */
  const handleEvaluate = async () => {
    if (session && user?.id) {
      const alreadyEvaluated = await isSessionEvaluated(session.id, user.id);
      if (alreadyEvaluated === true) {
        sileo.info({
          title: 'Ya calificada',
          description: 'Ya calificaste esta sesión.',
          fill: '#9f74ff',
        });
        return;
      }
    }
    setView('evaluate');
  };

  // Solo asistencia: no renderizar el overlay del detalle (evita superposición).
  if (view === 'attendance' && session) {
    return createPortal(
      <AttendancePostSession
        session={session}
        onClose={onClose}
        onRefetch={onClose}
      />,
      document.body
    );
  }
  
  return createPortal(
    <>
      <div
        className="modal-overlay"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Session detail"
      >
        <div className="modal-card__container">
 
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
                apiBase="/api/history"
                onClose={() => {
                  setView('detail');
                  onClose();
                }}
              />
            ) : (
              <SessionDetailView
                session={session}
                tutorInfo={tutorInfo}
                role={role}
                isProposing={view === 'propose'}
                isEditing={view === 'edit'}
                availabilitySlots={availabilitySlots}
                slotsLoading={slotsLoading}
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
                onEvaluate={canEvaluate ? handleEvaluate : undefined}
                onMarkAttendance={() => setView('attendance')}
                modificar={modificar}
                editar={editar}
              />
            )
          )}
        </div>
      </div>

      {view === 'reject' && session && (
        <RejectSessionModal
          session={session}
          onClose={() => setView('detail')}
          onSuccess={onClose}
          rechazar={rechazar}
        />
      )}
    </>,
    document.body
  );
};
 
export default SessionDetailModal;
