import type { APIRoute } from "astro";
import { patchOneAsRead } from "@/features/notifications/services/patchAsRead"

export const prerender = false;

export const PATCH: APIRoute = async({ request, cookies }) => {

    try{
        const token = cookies.get("access_token")?.value;
        const { id } = await request.json();
        await patchOneAsRead(id, token!)

        return new Response(JSON.stringify({message: "Notification marked as read"}), {status: 200, headers:{ 'Content-Type': 'application/json' }  });
    }
    catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to mark notification as read' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }




}