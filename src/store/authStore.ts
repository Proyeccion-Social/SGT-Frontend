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
    requiresPasswordChange: boolean;
    requiresProfileCompletion: boolean;
    _hasHydrated: boolean;
    setHasHydrated: (val: boolean) => void;
    setUser: (user: User) => void;
    setRequiresPasswordChange: (val: boolean) => void;
    setRequiresProfileCompletion: (val: boolean) => void;
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
            setRequiresPasswordChange: (val) => set({ requiresPasswordChange: val }),
            setRequiresProfileCompletion: (val) => set({ requiresProfileCompletion: val }),
            clearUser: () => set({ user: null, requiresPasswordChange: false, requiresProfileCompletion: false }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
