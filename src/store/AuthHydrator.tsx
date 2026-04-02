import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export default function AuthHydrator() {
    const setUser = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);
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

                const { user, token, requiresPasswordChange, requiresProfileCompletion } = await res.json();

                setUser(user);

                if (token) {
                    setToken(token);
                }

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