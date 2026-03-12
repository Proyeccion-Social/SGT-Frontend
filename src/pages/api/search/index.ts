import type { APIRoute } from "astro";
import { getAllTutors } from "@/features/search/services/getAllTutors";

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const tutors = await getAllTutors();

        return new Response(JSON.stringify(tutors), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tutors' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}