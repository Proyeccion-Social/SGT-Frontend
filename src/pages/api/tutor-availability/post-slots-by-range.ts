import type { APIRoute } from "astro";
import { postSlotsByRange } from "@/features/tutorAvailability/services/postSlotsByRange";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("access_token")?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ message: "Acceso no autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const result = await postSlotsByRange(accessToken, body);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error al crear franjas",
        code: error.code || "INTERNAL_01",
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
