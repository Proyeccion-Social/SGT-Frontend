import type { APIRoute } from "astro";
import { getAllSubjects } from "@/features/search/services/getAllSubjects";

export const GET: APIRoute = async () => {
    try {
        const subjects = await getAllSubjects();

        return new Response(JSON.stringify(subjects), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch subjects' }), {
            status: error.status || 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
