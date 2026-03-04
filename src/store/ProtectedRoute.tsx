import { useAuthStore } from '@/store/authStore';

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
