import type { APIRoute } from "astro";
import { getInbox } from "@/features/notifications/services/getInbox"

export const prerender = false;

export const GET: APIRoute = async({ cookies }) => {

    try{
        const token = cookies.get("access_token")?.value;

    if (!token) {
            return new Response(JSON.stringify({
                error: "Token not found"
            }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }
        const notifications = await getInbox(token)

        return new Response(JSON.stringify(notifications), {status: 200, headers:{ 'Content-Type': 'application/json' }  });
    }
    catch (error: any) {
        console.error("[API Notifications Inbox Error]:", error); // Log real error to terminal
        return new Response(JSON.stringify({ error: 'Failed to fetch notifications', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }




}