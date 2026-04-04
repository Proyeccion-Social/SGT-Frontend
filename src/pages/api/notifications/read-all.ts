import type { APIRoute } from "astro";
import { patchAllAsRead } from "@/features/notifications/services/patchAllAsRead"

export const prerender = false;

export const PATCH: APIRoute = async({ cookies }) => {

    try{
        const token = cookies.get("access_token")?.value;
        await patchAllAsRead(token!)

        return new Response(JSON.stringify({message: "All notifications marked as read"}), {status: 200, headers:{ 'Content-Type': 'application/json' }  });
    }
    catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to mark all notifications as read' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }




}