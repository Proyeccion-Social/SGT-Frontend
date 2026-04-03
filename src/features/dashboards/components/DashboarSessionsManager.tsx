// DashboardSessionManager.tsx
// React orchestration wrapper — owns all modal state
// Option B: listens to 'open-detail' CustomEvent dispatched by IncomingSessionsCard

import { useState, useEffect } from 'react';
import type { Session } from '../../sessions/types/session.types';
import { useSession } from '../..//sessions/hooks/useSession';
import { IncomingSessionsCard } from './IncomingSessionsCard';
import { SessionDetailModal } from '@features/sessions/components/SessionDetailModal';
import { CancelSessionModal } from '@features/sessions/components/CancelSessionModal';

interface Props {
  role: 'tutor' | 'student';
}

export const DashboardSessionManager = ({ role }: Props) => {
  const { cancelar ,sessions, loading, error, fetchMySessions: refetch } = useSession(role);
  // canCancel es tu lógica de ventana de tiempo — ejemplo:
  const canCancel = (session: Session) => {
    // tu lógica aquí, ej: verificar que falten más de X horas
    return true;
  };
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
        isLoading={loading}
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
          session_id={sessionToCancel.id}
          onClose={handleCancelClose}
          onSuccess={handleCancelSuccess}
          cancelar={cancelar}
          canCancel={canCancel}
          isLoading={loading}
          error={error}
        />
      )}
    </>
  );
};

export default DashboardSessionManager;