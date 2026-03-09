import { useAuthStore } from '@/store/authStore';
import { RoleBadge } from './RoleBadge';
import '../../../styles/badge.css';

export const WelcomeBanner = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const isAdmin = user.role.toLowerCase() === 'admin';

  return (
    <div className={`welcome-container ${isAdmin ? 'welcome-container--admin' : ''}`}>
      <p>¡Hola de nuevo<RoleBadge name={user.name} role={user.role} />!</p>
    </div>
  );
};
