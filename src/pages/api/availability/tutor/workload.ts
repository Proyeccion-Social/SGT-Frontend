import type { APIRoute } from "astro";
import { getTutorWorkload } from "@/features/availability/services/availabilityService";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const workload = await getTutorWorkload(token);

    return new Response(JSON.stringify(workload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: error.message || "Error al obtener la carga de trabajo",
        code: error.code || "INTERNAL_01",
      }),
      {
        status: error.httpStatus ? parseInt(error.httpStatus) : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
