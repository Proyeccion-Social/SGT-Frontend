import type { APIRoute } from "astro";
import { getAllTutors } from "@/features/search/services/getAllTutors";

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const modality = url.searchParams.get('modality');
        const onlyAvailable = url.searchParams.get('onlyAvailable');

        const tutors = await getAllTutors({
            modality: modality ?? undefined,
            onlyAvailable: onlyAvailable === 'true' 
        });

        return new Response(JSON.stringify(tutors), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

        } 
    catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tutors' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}