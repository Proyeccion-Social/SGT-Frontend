import { patchMyLimits } from "@/features/tutorAvailability/services/patchMyLimits";

import type { APIRoute } from "astro";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, cookies }) => {
    try {
        const accessToken = cookies.get("access_token")?.value;
        if (!accessToken) {
            return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await request.json();
        const result = await patchMyLimits(accessToken, body);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                message: error.message || "Error al actualizar limites",
                code: error.code || "INTERNAL_01",
            }),
            {
                status: error.status || 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
