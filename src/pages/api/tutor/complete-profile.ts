import type { APIRoute } from "astro";
import { completeTutorProfile } from "@/features/tutorProfile/services/tutorService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    const accessToken = cookies.get("access_token")?.value;

    if (!accessToken) {
        return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const data = await request.json();

    try {
        const result = await completeTutorProfile(data, accessToken);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        const status = error.status || 500;
        return new Response(JSON.stringify({ message: error.message ?? "Error al completar el perfil" }), {
            status,
            headers: { "Content-Type": "application/json" },
        });
    }
};
