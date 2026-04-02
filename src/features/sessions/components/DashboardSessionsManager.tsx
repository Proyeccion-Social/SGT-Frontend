// DashboardSessionManager.tsx
// T016: React orchestration wrapper — owns modal state
// Option B: NO renderiza IncomingSessionsCard (sigue siendo .astro)
//           Escucha el CustomEvent 'open-detail' despachado desde el componente Astro

import { useState, useEffect } from 'react';
import type { Session } from '../../sessions/types/session.types';
import { useSessions } from '../hooks/useSession';
import { SessionDetailModal } from './SessionDetailModal';
import { CancelSessionModal } from './CancelSessionModal';
import { IncomingSessionsCard } from '@features/dashboards/components/IncomingSessionsCard';

interface Props {
  role: 'tutor' | 'student';
}
 
export const DashboardSessionManager = ({ role }: Props) => {
  const { sessions, isLoading, error, refetch } = useSessions(role);
 
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal]     = useState(false);
  const [sessionToCancel, setSessionToCancel]     = useState<Session | null>(null);
 
  useEffect(() => {
    const handler = (e: Event) => {
        console.log('[DashboardSessionManager] open-detail recibido:', e);
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

  console.log('[DashboardSessionManager] selectedSessionId:', selectedSessionId);
 
  return (
    <>
      <IncomingSessionsCard
        sessions={sessions}
        isLoading={isLoading}
        error={error}
      />
 
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