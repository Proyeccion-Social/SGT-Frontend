import type { APIRoute } from "astro";
import { getSessionEvaluationStatus } from "@/features/emailScreens/services/getSessionEvaluationStatus";

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Token not found",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    const studentId = url.searchParams.get("studentId");

    if (!sessionId || !studentId) {
      return new Response(
        JSON.stringify({
          error: "sessionId and studentId are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await getSessionEvaluationStatus(sessionId, studentId, token);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch evaluation status",
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
