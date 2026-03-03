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
    cambioClaveRequerido: boolean;
    perfilCompletoRequerido: boolean;
    setUser: (payload: { user: User; cambioClaveRequerido?: boolean; perfilCompletoRequerido?: boolean }) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    cambioClaveRequerido: false,
    perfilCompletoRequerido: false,
    setUser: ({ user, cambioClaveRequerido = false, perfilCompletoRequerido = false }) =>
        set({ user, cambioClaveRequerido, perfilCompletoRequerido }),
    clearUser: () => set({ user: null, cambioClaveRequerido: false, perfilCompletoRequerido: false }),
}));