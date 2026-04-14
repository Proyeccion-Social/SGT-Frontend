import type { APIRoute } from "astro";
import { createSession } from "@/features/sessions/services/sessionService";

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
    
    // As per sessionService, createSession can take token as an argument.
    // Wait, we removed the token argument from the client-side createSession,
    // but we can call the nested one or fetch directly here.
    // Let's implement fetch directly to the backend here:
    const API_BASE = (
      import.meta.env.API_URL ??
      import.meta.env.PUBLIC_API_URL ??
      ""
    ).replace(/\/$/, "");

    const res = await fetch(`${API_BASE}/scheduling/sessions/individual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ message: errorBody?.message ?? "Error del servidor backend" }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const createdSession = await res.json();

    return new Response(JSON.stringify(createdSession), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: error.message ?? "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
