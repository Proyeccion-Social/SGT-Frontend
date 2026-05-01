import type { APIRoute } from "astro";
import { getMyAvailability } from "@/features/tutorAvailability/services/getMyAvailability";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get("access_token")?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await getMyAvailability(accessToken);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error al obtener disponibilidad",
        code: error.code || "INTERNAL_01",
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
