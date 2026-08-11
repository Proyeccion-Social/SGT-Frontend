import { useEffect } from 'react';
import { useDashboardData } from '../services/dashboardService';
import { UserRole } from '@/constants/roles';

interface Props {
  role: UserRole;
}

export const DashboardLoader = ({ role }: Props) => {
  const { loadTutorDashboard, loadStudentDashboard } = useDashboardData();

  useEffect(() => {
    if (role === UserRole.TUTOR) {
      loadTutorDashboard();
    } else if (role === UserRole.STUDENT) {
      loadStudentDashboard();
    }
  }, [role, loadTutorDashboard, loadStudentDashboard]);

  return null; // This is a logic-only component
};

export default DashboardLoader;
