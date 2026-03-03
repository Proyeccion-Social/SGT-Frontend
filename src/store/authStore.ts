// src/store/authStore.ts
import { create } from 'zustand';
type Role = 'Admin' | 'Tutor' | 'Estudiante';
type Status = 'Activo' | 'Inactivo' | 'Suspuesto';

type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    emailVerified: boolean;
    status: Status;
};

type AuthStore = {
    user: User | null;
    requiresPasswordChange: boolean;
    requiresProfileCompletion: boolean;
    setUser: (payload: { user: User; requiresPasswordChange?: boolean; requiresProfileCompletion?: boolean }) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    requiresPasswordChange: false,
    requiresProfileCompletion: false,
    setUser: ({ user, requiresPasswordChange = false, requiresProfileCompletion = false }) =>
        set({ user, requiresPasswordChange, requiresProfileCompletion }),
    clearUser: () => set({ user: null, requiresPasswordChange: false, requiresProfileCompletion: false }),
}));