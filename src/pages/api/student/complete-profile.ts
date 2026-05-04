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
        const { subjectIds, preferredModality, career } = body;

        // 1. Update Preferences (Modality and Career)
        const prefRes = await fetch(`${API_URL}/students/me/preferences`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ preferredModality, career })
        });

        if (!prefRes.ok) {
            const err = await prefRes.json().catch(() => ({}));
            throw new Error(err.message || "Error al actualizar preferencias");
        }

        // 2. Update Interested Subjects
        const subjRes = await fetch(`${API_URL}/students/me/interested-subjects`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ subjectIds })
        });

        if (!subjRes.ok) {
            const err = await subjRes.json().catch(() => ({}));
            throw new Error(err.message || "Error al actualizar materias de interés");
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
