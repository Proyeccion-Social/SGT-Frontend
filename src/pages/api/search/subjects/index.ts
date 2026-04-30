import type { APIRoute } from "astro";
import { getAllSubjects } from "@/features/search/services/getAllSubjects";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
    const accessToken = cookies.get("access_token")?.value;

    if (!accessToken) {
        return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const result = await getAllSubjects(accessToken);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        const status = error?.status ?? 500;
        return new Response(
            JSON.stringify({ message: error?.message ?? "Error interno del servidor" }),
            { status, headers: { "Content-Type": "application/json" } }
        );
    }
};
