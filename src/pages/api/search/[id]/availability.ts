import type { APIRoute } from "astro";
import { getTutorAvailability } from "@/features/search/services/getTutorAvailability";

export const prerender = false;

export const GET: APIRoute = async ({ params, cookies }) => {

    try {
        const tutorId = params.id;
        const accessToken = cookies.get("access_token")?.value;

        const availability = await getTutorAvailability(tutorId!, accessToken);

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