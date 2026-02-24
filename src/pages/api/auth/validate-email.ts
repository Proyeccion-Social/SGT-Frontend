import { validateEmail } from "@/features/auth/services/authService";
import type { APIRoute } from "astro";

export const prerender = false; 

export const POST: APIRoute = async ({ request }) => {
    console.log("La petición llegó")
    try {
        const { email } = await request.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const isValid = await validateEmail(email);
        console.log("Email validado:", isValid)
        return new Response(JSON.stringify({ isValid }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
}