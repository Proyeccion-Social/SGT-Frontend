import type { APIRoute } from "astro";
import { sendSessionEvaluation } from "@/features/history/services/sendSessionEvaluation";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    const { sessionId, ...payload } = await request.json();

    const data = await sendSessionEvaluation(sessionId, payload, token);

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
  return new Response(
    JSON.stringify({
      error: error.message,
    }),
    {
      status: error.status || 400,
      headers: { "Content-Type": "application/json" }
    }
  );
}
};