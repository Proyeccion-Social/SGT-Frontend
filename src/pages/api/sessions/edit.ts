import type { APIRoute } from "astro";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, cookies }) => {
    try {
        const token = cookies.get("access_token")?.value;

        if (!token) {
            return new Response(
                JSON.stringify({ message: "No autenticado" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const { sessionId, ...body } = await request.json();

        if (!sessionId) {
            return new Response(
                JSON.stringify({ message: "Falta el sessionId" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const API_BASE = (
            import.meta.env.API_URL ??
            import.meta.env.PUBLIC_API_URL ??
            ""
        ).replace(/\/$/, "");

        const res = await fetch(`${API_BASE}/scheduling/sessions/${sessionId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            return new Response(
                JSON.stringify({ message: errorBody?.message ?? "Error en el backend al editar la sesión" }),
                { status: res.status, headers: { "Content-Type": "application/json" } }
            );
        }

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(
            JSON.stringify({ message: error.message ?? "Error interno del servidor" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
