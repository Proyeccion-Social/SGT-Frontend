import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export default function AuthHydrator() {
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const stored = sessionStorage.getItem("auth_user");
        if (stored) {
            const { user, requiresPasswordChange, requiresProfileCompletion } = JSON.parse(stored);
            setUser({ user, requiresPasswordChange, requiresProfileCompletion });
        }
    }, []);

    return null;
}
