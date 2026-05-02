import type { APIRoute } from "astro";
import {
    getStudentPreferences,
    updateStudentPreferences,
} from "@/features/profileSettings/services/settingsServices";
import type { UpdatePreferencesDto } from "@/features/profileSettings/services/settingsServices";

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
 * GET /api/settings/preferences
 * Obtiene la carrera y modalidad preferida del estudiante autenticado.
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

        const preferences = await getStudentPreferences(token);
        return new Response(JSON.stringify(preferences), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};

/**
 * PATCH /api/settings/preferences
 * Body: { career?: string; preferredModality?: "PRES" | "VIRT" }
 * Actualiza parcialmente las preferencias del estudiante.
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
        if (!body || typeof body !== "object") {
            return new Response(
                JSON.stringify({ code: "VALIDATION_01", message: "Cuerpo de solicitud inválido" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        const dto: UpdatePreferencesDto = {};
        if (typeof body.career === "string") dto.career = body.career;
        if (body.preferredModality === "PRES" || body.preferredModality === "VIRT") {
            dto.preferredModality = body.preferredModality;
        }

        const preferences = await updateStudentPreferences(dto, token);
        return new Response(JSON.stringify(preferences), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};
