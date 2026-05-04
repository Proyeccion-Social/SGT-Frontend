import type { APIRoute } from "astro";
import { getAllSubjects } from "@/features/search/services/getAllSubjects";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
    const accessToken = cookies.get("access_token")?.value;

    if (!accessToken) {
        return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const result = await getAllSubjects(accessToken);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message ?? "Error al obtener las materias" }), {
            status: error.status ?? 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
