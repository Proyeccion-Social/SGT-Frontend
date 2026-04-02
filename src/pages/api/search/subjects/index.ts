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
        const status = error?.status ?? 500;
        return new Response(
            JSON.stringify({ message: error?.message ?? "Error interno del servidor" }),
            { status, headers: { "Content-Type": "application/json" } }
        );
    }
};
