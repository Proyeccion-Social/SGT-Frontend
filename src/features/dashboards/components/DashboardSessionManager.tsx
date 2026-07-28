// DashboardSessionManager.tsx
// Manages incoming sessions card list and listens for dashboard-refetch events

import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { IncomingSessionsCard } from './IncomingSessionsCard';
import { UserRole } from '@/constants/roles';
import { useDashboardData } from '../services/dashboardService';

interface Props {
  role: UserRole;
}

export const DashboardSessionManager = ({ role }: Props) => {
  if (!role) return null;
  const { sessions, loading, error } = useSessionStore();
  const { loadTutorDashboard, loadStudentDashboard } = useDashboardData();

  const refetch = role === UserRole.TUTOR ? loadTutorDashboard : loadStudentDashboard;

  useEffect(() => {
    const handler = () => refetch();
    document.addEventListener('dashboard-refetch', handler);
    return () => document.removeEventListener('dashboard-refetch', handler);
  }, [refetch]);

  return (
    <>
      <IncomingSessionsCard
        sessions={sessions}
        isLoading={loading}
        error={error}
        viewerRole={role}
        onRefetch={() => refetch()}
      />
    </>
  );
};

export default DashboardSessionManager;