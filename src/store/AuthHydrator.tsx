import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export default function AuthHydrator() {
  const setUser        = useAuthStore((state) => state.setUser);
  const setToken       = useAuthStore((state) => state.setToken);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);

  useEffect(() => {
    // Leer token desde cookie
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='))
      ?.split('=')[1];

    const stored = sessionStorage.getItem("auth_user");
    if (stored) {
      const { user, requiresPasswordChange, requiresProfileCompletion } = JSON.parse(stored);
      setUser({ ...user, requiresPasswordChange, requiresProfileCompletion });
    }

    if (token) setToken(token);

    setHasHydrated(true);
  }, []);

  return null;
}