import type { APIRoute } from "astro";
import { manageSlot } from "@/features/availability/services/availabilityService";
import type { ManageSlotDto } from "@/features/availability/services/availabilityService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const dto = (await request.json()) as ManageSlotDto;
    const result = await manageSlot(dto, token);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error al procesar la solicitud",
        code: error.code || "INTERNAL_01",
      }),
      {
        status: error.httpStatus ? parseInt(error.httpStatus) : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
