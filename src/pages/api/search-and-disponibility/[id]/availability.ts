import type { APIRoute } from "astro";
import { getTutorAvailability } from "@/features/search-and-disponibility/services/getTutorAvailability";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {

    try {
        const tutorId = params.id;

        const availability = await getTutorAvailability(tutorId!);

        return new Response(JSON.stringify(availability), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tutor availability' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};