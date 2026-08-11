import { useEffect, useRef } from 'react';
import { sileo } from 'sileo';
import { useDashboardData } from '../services/dashboardService';
import { UserRole } from '@/constants/roles';

interface Props {
  role: UserRole;
}

export const DashboardLoader = ({ role }: Props) => {
  const { loadTutorDashboard, loadStudentDashboard } = useDashboardData();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (role === UserRole.TUTOR) {
      loadTutorDashboard();
    } else if (role === UserRole.STUDENT) {
      loadStudentDashboard();
    }
  }, [role, loadTutorDashboard, loadStudentDashboard]);

  useEffect(() => {
    if (role !== UserRole.TUTOR || toastShownRef.current) return;
    toastShownRef.current = true;
    sileo.warning({
      title: "Recuerda...",
      description: "Revisa el correo, allí encontrarás todas las novedades de tus tutorías",
      duration: 5000,
      fill: "#f5a623",
      styles: { badge: "#ffffff" },
    });
  }, [role]);

  return null; // This is a logic-only component
};

export default DashboardLoader;
