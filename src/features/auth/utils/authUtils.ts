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
            userId = decoded.id || decoded.sub || decoded.userId;
        }
    } catch (e) {
        console.error("Failed to decode token from cookie", e);
    }
    return userId;
}

/**
 * Validates whether the token is present in the cookies.
 */
export function validateSession(cookies: AstroCookies): boolean {
    return !!cookies.get("access_token")?.value;
}
