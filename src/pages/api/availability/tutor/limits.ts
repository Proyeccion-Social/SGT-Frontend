import type { APIRoute } from "astro";
import { setWeeklyLimit } from "@/features/availability/services/availabilityService";

export const prerender = false;

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { maxHours } = await request.json();
    await setWeeklyLimit(maxHours, token);

    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error al actualizar el límite semanal",
        code: error.code || "INTERNAL_01",
      }),
      {
        status: error.httpStatus ? parseInt(error.httpStatus) : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
