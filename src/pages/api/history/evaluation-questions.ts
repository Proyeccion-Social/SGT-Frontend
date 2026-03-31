import type { APIRoute } from "astro";
import { getEvaluationQuestions } from "@/features/history/services/getEvaluationQuestions";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;

    const data = await getEvaluationQuestions(token);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch evaluation questions"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
}
};