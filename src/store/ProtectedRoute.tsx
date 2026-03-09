import { useAuthStore } from '@/store/authStore';

type Props = {
    allowedRoles: Array<'ADMIN' | 'TUTOR' | 'STUDENT'>;
    children: React.ReactNode;
    redirectTo?: string;
};

export const ProtectedRoute = ({ allowedRoles, children, redirectTo = '/' }: Props) => {
    const user = useAuthStore((state) => state.user);

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
