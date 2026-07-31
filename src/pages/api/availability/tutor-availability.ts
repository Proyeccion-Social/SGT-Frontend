import type { APIRoute } from "astro";
import { getTutorSlots } from "@/features/availability/services/availabilityService";
import type { GetAvailabilityQueryDto, Modality } from "@/features/availability/services/availabilityService";

export const prerender = false;

/**
 * GET /api/availability/tutor-availability?tutorId=...&onlyAvailable=...&onlyFuture=...&modality=...
 *
 * BFF autenticado: reenvía el JWT de la cookie al backend.
 * Usado por el flujo de propuesta de modificación (useTutorSlots).
 *
 * Query params:
 * - tutorId       (requerido) UUID del tutor
 * - onlyAvailable (opcional) true/false — solo franjas sin reserva
 * - onlyFuture    (opcional) true/false — solo franjas futuras
 * - modality      (opcional) PRES | VIRT
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({
          code: "AUTH_05",
          message: "No hay token de sesión",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const tutorId = url.searchParams.get("tutorId");

    if (!tutorId) {
      return new Response(
        JSON.stringify({
          code: "VALIDATION_01",
          message: "El parámetro tutorId es requerido",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const query: GetAvailabilityQueryDto = {};

    const onlyAvailable = url.searchParams.get("onlyAvailable");
    if (onlyAvailable !== null) {
      query.onlyAvailable = onlyAvailable === "true";
    }

    const onlyFuture = url.searchParams.get("onlyFuture");
    if (onlyFuture !== null) {
      query.onlyFuture = onlyFuture === "true";
    }

    const modality = url.searchParams.get("modality");
    if (modality !== null) {
      query.modality = modality as Modality;
    }

    const slots = await getTutorSlots(tutorId, query, token);

    return new Response(JSON.stringify({ slots }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error.code && error.httpStatus) {
      return new Response(
        JSON.stringify({
          code: error.code,
          message: error.message,
          description: error.description,
        }),
        {
          status: parseInt(error.httpStatus, 10) || 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.error("[tutor-availability BFF] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        code: "INTERNAL_01",
        message: "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
