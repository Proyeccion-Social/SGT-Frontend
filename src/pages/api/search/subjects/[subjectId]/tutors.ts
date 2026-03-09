import type { APIRoute } from "astro";
import { getTutorsBySubject } from "@/features/search/services/getTutorsBySubject";

export const prerender = false;

export const GET: APIRoute = async ({ params, cookies }) => {
    try {
        const subjectId = params.subjectId;

        if (!subjectId) {
            return new Response(
                JSON.stringify({ message: "ID de materia es requerido" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const token = cookies.get("access_token")?.value;

        if (!token) {
            return new Response(
                JSON.stringify({ message: "Token de autenticación es requerido" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const result = await getTutorsBySubject(subjectId, token);

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
