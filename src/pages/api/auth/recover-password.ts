import { recoverPassword } from "@/features/auth/services/recoverPassword";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email } = await request.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        await recoverPassword(email);
        return new Response(JSON.stringify({ message: "Password recovery email sent" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to recover password" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
