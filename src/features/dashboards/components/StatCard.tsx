import { useAvailabilityStore } from '@/store/availabilityStore';
import littleMan from "./icons/little-man.png";
import '@/features/dashboards/styles/StatCard.css';

interface Props {
  type: 'tutor' | 'student';
}

export const StatCard = ({ type }: Props) => {
  const { totalStudentsReached, weeklySessionsCount } = useAvailabilityStore();

  const value = type === 'tutor' ? totalStudentsReached : weeklySessionsCount;
  const description = type === 'tutor' ? 'Estudiantes alcanzados' : 'Tutorías esta semana';

  return (
    <div className="stat-card">
      <div className="content">
        <span className="value">{value}</span>
        <p className="description">{description}</p>
      </div>
      
      <div className="decorative-avatar">
        <img src={littleMan.src} alt="decoración" />
      </div>
    </div>
  );
};

export default StatCard;
