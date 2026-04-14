import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export default function AuthHydrator() {
    const setUser = useAuthStore((state) => state.setUser);
    const setHasHydrated = useAuthStore((state) => state.setHasHydrated);

    useEffect(() => {
        async function hydrate() {
            try {
                // El navegador enviará automáticamente la cookie HTTP-only
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include", // 👈 clave para enviar cookies
                });

                if (!res.ok) {
                    setHasHydrated(true);
                    return;
                }

                const { user, requiresPasswordChange, requiresProfileCompletion } = await res.json();

                setUser(user);

            } catch (err) {
                console.error("Error al hidratar sesión:", err);
            } finally {
                setHasHydrated(true);
            }
        }

        hydrate();
    }, []);

    return null;
}