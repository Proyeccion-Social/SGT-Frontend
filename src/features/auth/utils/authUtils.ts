import { jwtDecode } from "jwt-decode";
import type { AstroCookies } from "astro";

/**
 * Extracts and decodes the user ID from the JWT access token in cookies.
 */
export function getUserIdFromCookie(cookies: AstroCookies): string {
    let userId = "";
    try {
        const token = cookies.get("access_token")?.value;
        if (token) {
            const decoded = jwtDecode(token) as any;
            // El campo 'sub' es el estándar para el ID de usuario en el JWT
            userId = decoded.sub || decoded.idUser || decoded.id || decoded.userId;
        }
    } catch (e) {
    }
    return userId;
}

/**
 * Validates whether the token is present in the cookies.
 */
export function validateSession(cookies: AstroCookies): boolean {
    return !!cookies.get("access_token")?.value;
}
