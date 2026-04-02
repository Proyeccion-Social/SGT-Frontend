// DashboardSessionManager.tsx
// T016: React orchestration wrapper — owns modal state
// Option B: NO renderiza IncomingSessionsCard (sigue siendo .astro)
//           Escucha el CustomEvent 'open-detail' despachado desde el componente Astro

import { useState, useEffect } from 'react';
import type { Session } from '../../sessions/types/session.types';
import { useSessions } from '../hooks/useSession';
import { SessionDetailModal } from './SessionDetailModal';
import { CancelSessionModal } from './CancelSessionModal';

interface Props {
  role: 'tutor' | 'student';
}
 
export const DashboardSessionManager = ({ role }: Props) => {
  const { refetch } = useSessions(role);
 
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal]     = useState(false);
  const [sessionToCancel, setSessionToCancel]     = useState<Session | null>(null);
 
  // Option B: escuchar el CustomEvent que despacha IncomingSessionsCard.astro
  useEffect(() => {
    const handler = (e: Event) => {
      const sessionId = (e as CustomEvent<{ sessionId: string }>).detail.sessionId;
      if (sessionId) setSelectedSessionId(sessionId);
    };
    document.addEventListener('open-detail', handler);
    return () => document.removeEventListener('open-detail', handler);
  }, []);
 
  const handleRequestCancel = (session: Session) => {
    setSessionToCancel(session);
    setSelectedSessionId(null);
    setShowCancelModal(true);
  };
 
  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSessionToCancel(null);
  };
 
  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    setSessionToCancel(null);
    refetch();
  };
 
  // Este componente no renderiza nada visible por sí mismo —
  // IncomingSessionsCard.astro ya está en el HTML del dashboard.
  // Solo monta los modales cuando corresponde.
  return (
    <>
      {selectedSessionId && (
        <SessionDetailModal
          sessionId={selectedSessionId}
          role={role}
          onClose={() => setSelectedSessionId(null)}
          onRequestCancel={handleRequestCancel}
        />
      )}
 
      {showCancelModal && sessionToCancel && (
        <CancelSessionModal
          session={sessionToCancel}
          onClose={handleCancelClose}
          onSuccess={handleCancelSuccess}
        />
      )}
    </>
  );
};
 
export default DashboardSessionManager;
 