// DashboardSessionManager.tsx
// React orchestration wrapper — owns all modal state
// Option B: listens to 'open-detail' CustomEvent dispatched by IncomingSessionsCard

import { useState, useEffect } from 'react';
import type { Session } from '../../sessions/types/session.types';
import { useSession } from '../..//sessions/hooks/useSession';
import { IncomingSessionsCard } from './IncomingSessionsCard';
import { SessionDetailModal } from '../../sessions/SessionDetailModal';
import { CancelSessionModal } from '../../sessions/CancelSessionModal';

interface Props {
  role: 'tutor' | 'student';
}

export const DashboardSessionManager = ({ role }: Props) => {
  const { sessions, loading, error, refetch } = useSession(role);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal]     = useState(false);
  const [sessionToCancel, setSessionToCancel]     = useState<Session | null>(null);

  // Option B: listen to CustomEvent dispatched by IncomingSessionsCard
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