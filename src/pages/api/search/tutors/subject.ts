import type { APIRoute } from "astro";
import { getTutorsBySubject } from "@/features/search/services/getTutorsBySubject";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
    try {
        const subjectId = url.searchParams.get("subjectId") ?? undefined;
        const subjectName = url.searchParams.get("subjectName") ?? undefined;

        if (!subjectId && !subjectName) {
            return new Response(
                JSON.stringify({ message: "Debe proporcionar subjectId o subjectName" }),
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

        const modality = url.searchParams.get("modality") ?? undefined;
        const onlyAvailableParam = url.searchParams.get("onlyAvailable");
        const onlyAvailable = onlyAvailableParam !== null ? onlyAvailableParam === "true" : undefined;

        const result = await getTutorsBySubject(
            { subjectId, subjectName, modality, onlyAvailable },
            token,
        );

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
