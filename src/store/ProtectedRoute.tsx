import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

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
};

export const AuthRedirect = () => {
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state._hasHydrated);

    useEffect(() => {
        if (!isHydrated) return;
        if (user) {
            window.location.href = '/dashboard';
        }
    }, [user, isHydrated]);

    return null;
};
