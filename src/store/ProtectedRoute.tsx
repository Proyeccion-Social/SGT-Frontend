import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

type Props = {
    allowedRoles: Array<'ADMIN' | 'TUTOR' | 'STUDENT'>;
    children: React.ReactNode;
    redirectTo?: string;
};

export const ProtectedRoute = ({ allowedRoles, children, redirectTo = '/' }: Props) => {
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state._hasHydrated);

    if (!user) {
        window.location.href = redirectTo;
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        window.location.href = '/';
        return null;
    }

    return <>{children}</>;
}

export const AuthRedirect = () => {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state._hasHydrated);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Si en 2 segundos no hidrata, asume que no hay sesión
    const timer = setTimeout(() => setTimedOut(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated && !timedOut) return;
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user, isHydrated, timedOut]);

  return null;
};

