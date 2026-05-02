import type { APIRoute } from "astro";
import { getTutorHoursStatus } from "@/features/profileSettings/services/settingsServices";

export const prerender = false;

function errorResponse(error: unknown): Response {
    const e = error as any;
    if (e?.code && e?.httpStatus) {
        return new Response(
            JSON.stringify({ code: e.code, message: e.message, description: e.description }),
            { status: Number(e.httpStatus), headers: { "Content-Type": "application/json" } },
        );
    }
    if (typeof e?.statusCode === "number") {
        return new Response(
            JSON.stringify({ code: e.error ?? "ERROR", message: e.message }),
            { status: e.statusCode, headers: { "Content-Type": "application/json" } },
        );
    }
    return new Response(
        JSON.stringify({ code: "INTERNAL_01", message: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
    );
}

function extractToken(request: Request): string | null {
    return request.headers.get("cookie")?.match(/access_token=([^;]+)/)?.[1] ?? null;
}

/**
 * GET /api/settings/tutor-hours?tutorId=uuid
 * Obtiene el estado de horas semanales del tutor autenticado.
 */
export const GET: APIRoute = async ({ request }) => {
    try {
        const token = extractToken(request);
        if (!token) {
            return new Response(
                JSON.stringify({ code: "AUTH_05", message: "No hay token de sesión" }),
                { status: 401, headers: { "Content-Type": "application/json" } },
            );
        }

        const { searchParams } = new URL(request.url);
        const tutorId = searchParams.get("tutorId");
        if (!tutorId) {
            return new Response(
                JSON.stringify({ code: "VALIDATION_01", message: "tutorId es requerido" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        const status = await getTutorHoursStatus(tutorId, token);
        return new Response(JSON.stringify(status), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};
