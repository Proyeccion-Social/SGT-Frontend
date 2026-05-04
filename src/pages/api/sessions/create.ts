import type { APIRoute } from "astro";
import { createSession } from "@/features/sessions/services/sessionService";
import { getErrorMessage } from "@/utils/errorMessages";

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

    const data = await request.json();
    const createdSession = await createSession(data, token);

    return new Response(JSON.stringify(createdSession), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: getErrorMessage(error.message) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
