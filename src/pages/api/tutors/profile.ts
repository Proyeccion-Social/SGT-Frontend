import { getOwnTutorProfile } from "@/features/availability/services/availabilityService";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
    const token = cookies.get("access_token")?.value;

    if (!token) {
        return new Response(
            JSON.stringify({ message: 'No hay token de sesión. Por favor inicia sesión.' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const profile = await getOwnTutorProfile(token);
        return new Response(
            JSON.stringify(profile),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                message: error.message || 'Error interno del servidor',
                code: error.code || 'INTERNAL_01'
            }),
            {
                status: error.httpStatus || 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
