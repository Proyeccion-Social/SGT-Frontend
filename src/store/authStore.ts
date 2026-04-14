import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/constants/roles';

type Status = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    status: Status;
};

interface AuthStore {
    user: User | null;
    requiresPasswordChange: boolean;
    requiresProfileCompletion: boolean;
    _hasHydrated: boolean;
    setHasHydrated: (val: boolean) => void;
    setUser: (user: User) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            requiresPasswordChange: false,
            requiresProfileCompletion: false,
            _hasHydrated: false,
            setHasHydrated: (val) => set({ _hasHydrated: val }),
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);