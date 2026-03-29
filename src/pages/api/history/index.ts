import type { APIRoute } from "astro";
import { getHistory } from "@/features/history/services/getHistory";

export const GET: APIRoute = async ({ cookies, url }) => {
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

        // 🔥 Leer query params
        const page = url.searchParams.get("page");
        const limit = url.searchParams.get("limit");
        const status = url.searchParams.get("status");

        // 🔥 Llamar al service con params
        const history = await getHistory({
            token,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            status: status || undefined
        });

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