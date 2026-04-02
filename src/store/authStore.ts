import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Role = 'ADMIN' | 'TUTOR' | 'STUDENT';
type Status = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    emailVerified: boolean;
    status: Status;
};

interface AuthStore {
    user: User | null;
    token: string;
    requiresPasswordChange: boolean;
    requiresProfileCompletion: boolean;
    _hasHydrated: boolean;
    setHasHydrated: (val: boolean) => void;
    setUser: (user: User) => void;
    clearUser: () => void;
    setToken: (token: string) => void;
}


export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: "",
            requiresPasswordChange: false,
            requiresProfileCompletion: false,
            _hasHydrated: false,
            setHasHydrated: (val) => set({ _hasHydrated: val }),
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
            setToken: (token) => set({ token }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
