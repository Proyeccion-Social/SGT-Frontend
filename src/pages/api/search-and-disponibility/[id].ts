import type { APIRoute } from "astro";
import {getTutorProfile} from  "@/features/search-and-disponibility/services/getTutorProfile";

export const prerender = false;
export const GET: APIRoute = async ({ params }) => {
    
    try {
        const id = params.id;

        const tutor = await getTutorProfile(id!);

        return new Response(JSON.stringify(tutor), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {

        return new Response(JSON.stringify({ error: 'Failed to fetch tutor profile' }), 
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
