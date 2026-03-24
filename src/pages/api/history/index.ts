import type { APIRoute } from "astro";
import { getHistory } from "@/features/history/services/getHistory";


export const GET: APIRoute = async ({ cookies }) => {
    try {
        const token = cookies.get("access_token")?.value;

        if (!token) {
            return new Response(JSON.stringify({
                error: "Token not found"
            }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const history = await getHistory(token);

        return new Response(JSON.stringify(history), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Failed to fetch history"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};