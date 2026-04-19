import { useAuthStore } from '@/store/authStore';
import { RoleBadge } from './RoleBadge';
import '../../../styles/badge.css';
import { UserRole } from '@/constants/roles';

export const WelcomeBanner = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <div className="welcome-container" style={{ minHeight: '72px' }} />;

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className={`welcome-container ${isAdmin ? 'welcome-container--admin' : ''}`}>
      <div className="welcome-text">¡Hola de nuevo<RoleBadge name={user.name} role={user.role} />!</div>
    </div>
  );
};
