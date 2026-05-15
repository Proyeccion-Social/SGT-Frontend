import type { APIRoute } from "astro";

export const prerender = false;

const API_URL = import.meta.env.API_URL;

export const POST: APIRoute = async ({ request, cookies }) => {
    const token = cookies.get("access_token")?.value;

    if (!token) {
        return new Response(JSON.stringify({ message: "No autorizado" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const res = await fetch(`${API_URL}/students/me/complete-profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Error al completar perfil del estudiante");
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
