import type { APIRoute } from "astro";
import {
    getStudentSubjects,
    updateStudentSubjects,
} from "@/features/profileSettings/services/settingsServices";

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
 * GET /api/settings/subjects
 * Obtiene las materias de interés del estudiante autenticado.
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

        const subjects = await getStudentSubjects(token);
        return new Response(JSON.stringify({ subjects }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};

/**
 * PATCH /api/settings/subjects
 * Body: { subjectIds: string[] }
 * Reemplaza la lista completa de materias de interés del estudiante.
 */
export const PATCH: APIRoute = async ({ request }) => {
    try {
        const token = extractToken(request);
        if (!token) {
            return new Response(
                JSON.stringify({ code: "AUTH_05", message: "No hay token de sesión" }),
                { status: 401, headers: { "Content-Type": "application/json" } },
            );
        }

        const body = await request.json().catch(() => null);
        if (!body || !Array.isArray(body.subjectIds)) {
            return new Response(
                JSON.stringify({ code: "VALIDATION_01", message: "subjectIds debe ser un array" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        const subjects = await updateStudentSubjects(body.subjectIds as string[], token);
        return new Response(JSON.stringify({ subjects }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};
