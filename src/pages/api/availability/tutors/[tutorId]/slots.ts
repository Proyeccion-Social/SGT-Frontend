import type { APIRoute } from "astro";
import { getTutorSlots } from "@/features/availability/services/availabilityService";
import type { GetAvailabilityQueryDto, Modality } from "@/features/availability/services/availabilityService";

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { tutorId } = params;

    if (!tutorId) {
      return new Response(
        JSON.stringify({
          code: "VALIDATION_01",
          message: "El parámetro tutorId es requerido",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construir query params
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

    const slots = await getTutorSlots(tutorId, query);

    return new Response(
      JSON.stringify({ slots }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    if (error.code && error.httpStatus) {
      return new Response(
        JSON.stringify({
          code: error.code,
          message: error.message,
          description: error.description,
        }),
        {
          status: parseInt(error.httpStatus),
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        code: "INTERNAL_01",
        message: error.message || "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
