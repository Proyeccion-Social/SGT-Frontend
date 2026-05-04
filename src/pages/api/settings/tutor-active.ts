import type { APIRoute } from "astro";
import { toggleTutorActive } from "@/features/profileSettings/services/settingsServices";

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
 * PATCH /api/settings/tutor-active
 * Body: { isActive: boolean }
 * Activa o desactiva la cuenta del tutor autenticado.
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
        if (!body || typeof body.isActive !== "boolean") {
            return new Response(
                JSON.stringify({ code: "VALIDATION_01", message: "isActive (boolean) es requerido" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        await toggleTutorActive(body.isActive, token);
        return new Response(JSON.stringify({ message: "Tutor status updated successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
};
