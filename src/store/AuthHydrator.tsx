// AuthHydrator.tsx
import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export default function AuthHydrator() {
    const setUser = useAuthStore((state) => state.setUser);
    const setHasHydrated = useAuthStore((state) => state.setHasHydrated); // ← nuevo

    useEffect(() => {
        const stored = sessionStorage.getItem("auth_user");
        console.log("Hidratando store:", stored);
        if (stored) {
            const { user, requiresPasswordChange, requiresProfileCompletion } = JSON.parse(stored);
            setUser({ ...user, requiresPasswordChange, requiresProfileCompletion });
        }
        setHasHydrated(true); // ← se llama siempre, haya o no usuario
    }, []);

    return null;
}
