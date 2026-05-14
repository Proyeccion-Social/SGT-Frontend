import type { APIRoute } from "astro";

export const prerender = false;

const API_URL = import.meta.env.API_URL;

export const GET: APIRoute = async ({ cookies }) => {
    const token = cookies.get("access_token")?.value;

    if (!token) {
        return new Response(JSON.stringify({ message: "No autorizado" }), { status: 401 });
    }

    try {
        // Fetch preferences and subjects in parallel
        const [prefRes, subjRes] = await Promise.all([
            fetch(`${API_URL}/students/me/preferences`, {
                headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`${API_URL}/students/me/interested-subjects`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
        ]);

        const preferences = await prefRes.json().catch(() => ({}));
        const subjectsData = await subjRes.json().catch(() => ({ subjects: [] }));

        console.log('[BFF preferences] Raw backend prefs:', JSON.stringify(preferences, null, 2));

        return new Response(JSON.stringify({
            preferredModality: preferences.preferredModality,
            career: preferences.career,
            subjects: subjectsData.subjects || []
        }), {
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
