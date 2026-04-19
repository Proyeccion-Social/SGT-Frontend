import { useAuthStore } from '@/store/authStore';
import { ROLE_PERMISSIONS } from '@/store/permissions';

/**
 * Evalúa si el usuario tiene permiso para una acción sobre un recurso.
 * Ejemplo: usePermission('create', 'sessions')
 */
export const usePermission = (action: string, resource: string): boolean => {
    const user = useAuthStore((state) => state.user);
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.role] ?? [];
    return permissions.includes(`${action}:${resource}`);
};
