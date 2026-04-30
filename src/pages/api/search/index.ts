import type { APIRoute } from "astro";
import { getAllTutors } from "@/features/search/services/getAllTutors";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
    try {
        const accessToken = cookies.get("access_token")?.value;

        if (!accessToken) {
            return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const tutors = await getAllTutors(accessToken);
        
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
