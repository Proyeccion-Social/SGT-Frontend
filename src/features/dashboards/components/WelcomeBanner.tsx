import { useAuthStore } from '@/store/authStore';
import { RoleBadge } from './RoleBadge';
import '../styles/badge.css';

export const WelcomeBanner = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <div className="welcome-container"/>;

  const isAdmin = user.role.toLowerCase() === 'admin';
  const protocol = user.role.toLowerCase() === 'student' ? '¡Hola de nuevo' : '¡Bienvenido';

  return (
    <div className={`welcome-container ${isAdmin ? 'welcome-container--admin' : ''}`}>
      <span>{protocol}<RoleBadge name={user.name} role={user.role} />!</span>
    </div>
  );
};
