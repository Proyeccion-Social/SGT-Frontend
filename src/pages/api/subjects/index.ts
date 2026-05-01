import type { APIRoute } from "astro";
import { getAllSubjects } from "@/features/search/services/getAllSubjects";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
    const token = cookies.get("access_token")?.value;
    try {
        const result = await getAllSubjects(token);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message ?? "Error al obtener las materias" }), {
            status: error.status ?? 500,
        });
    }
};
