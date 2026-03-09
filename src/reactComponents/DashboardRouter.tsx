import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function DashboardRouter() {
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state._hasHydrated);

    useEffect(() => {
        if (!isHydrated) return;

        if (!user) {
            window.location.href = '/';
            return;
        }

        switch (user.role) {
            case 'ADMIN':
                window.location.href = '/dashboards/admin';
                break;
            case 'TUTOR':
                window.location.href = '/dashboards/tutor';
                break;
            case 'STUDENT':
                window.location.href = '/dashboards/student';
                break;
            default:
                window.location.href = '/';
        }
    }, [user, isHydrated]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Redirigiendo...</p>
        </div>
    );
}
