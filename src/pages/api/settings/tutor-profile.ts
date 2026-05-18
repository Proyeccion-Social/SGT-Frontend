import type { APIRoute } from "astro";
import {
    getTutorProfileData,
    updateTutorProfile,
} from "@/features/profileSettings/services/settingsServices";
import type { UpdateTutorProfileDto } from "@/features/profileSettings/services/settingsServices";

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
 * GET /api/settings/tutor-profile
 * Obtiene el perfil del tutor autenticado (teléfono, etc.).
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

        const profile = await getTutorProfileData(token);
        return new Response(JSON.stringify(profile), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};

/**
 * PATCH /api/settings/tutor-profile
 * Body: { phone?: string }
 * Actualiza el perfil del tutor autenticado.
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

        const dto: UpdateTutorProfileDto = {};
        if (typeof body.phone === "string") dto.phone = body.phone;
        if (typeof body.max_weekly_hours === "number") dto.max_weekly_hours = body.max_weekly_hours;
        if (Array.isArray(body.subjectIds)) dto.subject_ids = body.subjectIds;

        await updateTutorProfile(dto, token);
        return new Response(null, { status: 204 });
    } catch (error) {
        return errorResponse(error);
    }
};
