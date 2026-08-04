import type { APIRoute } from "astro";
import { getTutorRatings } from "@/features/search/services/getTutorRatings";

export const prerender = false;

export const GET: APIRoute = async ({ params, cookies }) => {
    try {
        const accessToken = cookies.get("access_token")?.value;

        if (!accessToken) {
            return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const tutorId = params.id;

        const ratings = await getTutorRatings(tutorId!, accessToken);

        return new Response(JSON.stringify(ratings), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tutor ratings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
