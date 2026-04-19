// DashboardSessionManager.tsx
// React orchestration wrapper — owns all modal state
// Option B: listens to 'open-detail' CustomEvent dispatched by IncomingSessionsCard

import { useState, useEffect } from 'react';
import type { Session } from '@/features/sessions/types/session.types';
import { useSessionStore } from '@/store/sessionStore';
import { IncomingSessionsCard } from './IncomingSessionsCard';
import { SessionDetailModal } from '@/features/sessions/components/SessionDetailModal';
import { CancelSessionModal } from '@/features/sessions/components/CancelSessionModal';
import { UserRole } from '@/constants/roles';
import { cancelSession as cancelSessionSvc } from '@/features/sessions/services/sessionService';
import { fetchTutorDashboardBFF, fetchStudentDashboardBFF } from '../services/dashboardService';
import { mapDashboardSessions } from '../utils/dashboardMapper';
import { useAvailabilityStore } from '@/store/availabilityStore';

interface Props {
  role: UserRole;
}

export const DashboardSessionManager = ({ role }: Props) => {
  if (!role) return null;
  const { sessions, loading, error, setSessions } = useSessionStore();
  const { setDashboardMetrics } = useAvailabilityStore();

  const refetch = async () => {
    try {
      if (role === UserRole.TUTOR) {
        const data = await fetchTutorDashboardBFF();
        setSessions(mapDashboardSessions(data.upcomingSessions, role));
        setDashboardMetrics({
          weeklyHoursUsed: data.weeklyHoursUsed,
          weeklyHoursLimit: data.weeklyHoursLimit,
          weeklyHoursRemaining: data.weeklyHoursRemaining,
          totalStudentsReached: data.totalStudentsReached
        });
      } else {
        const data = await fetchStudentDashboardBFF();
        setSessions(mapDashboardSessions(data.upcomingSessions, role));
        setDashboardMetrics({
          weeklySessionsCount: data.weeklySessionsCount
        });
      }
    } catch (e) {}
  };

  const cancelar = async (id: string, reason: string) => {
    try {
      await cancelSessionSvc(id, reason);
      return true;
    } catch (e) {
      return false;
    }
  };

  const modificar = () => Promise.resolve(true); // Placeholder
  const editar = () => Promise.resolve(true); // Placeholder

  const canCancel = (session: Session) => true;
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
        viewerRole={role}
        onRefetch={() => refetch()}
      />

      {selectedSessionId && (
        <SessionDetailModal
          sessionId={selectedSessionId}
          role={role}
          onClose={() => setSelectedSessionId(null)}
          onRequestCancel={handleRequestCancel}
          modificar={modificar}
          editar={editar}
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