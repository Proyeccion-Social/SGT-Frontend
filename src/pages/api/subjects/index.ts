import type { APIRoute } from "astro";
import { getAllSubjects } from "@/features/search/services/getAllSubjects";

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const result = await getAllSubjects();

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
