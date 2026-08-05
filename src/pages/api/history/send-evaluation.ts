import type { APIRoute } from "astro";
import { sendSessionEvaluation } from "@/features/history/services/sendSessionEvaluation";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({
          errorCode: "AUTH_05",
          message: "No autenticado",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { sessionId, ...payload } = body;

    if (!sessionId) {
      return new Response(
        JSON.stringify({
          errorCode: "VALIDATION_01",
          message: "sessionId requerido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await sendSessionEvaluation(sessionId, payload, token);

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        errorCode: error.errorCode,
        message: error.message || "Error al enviar la evaluación",
        error: error.message,
      }),
      {
        status: error.status || 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
