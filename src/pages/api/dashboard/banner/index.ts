import type { APIRoute } from "astro";
import {
  deleteDashboardBanner,
  getDashboardBanner,
} from "@/features/dashboards/services/bannerService";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await getDashboardBanner(token);
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status)
        : 500;
    console.error("[BFF] Error en GET dashboard/banner:", error);
    return new Response(JSON.stringify({ message }), {
      status: status >= 400 && status < 600 ? status : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await deleteDashboardBanner(token);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status)
        : 500;
    console.error("[BFF] Error en DELETE dashboard/banner:", error);
    return new Response(JSON.stringify({ message }), {
      status: status >= 400 && status < 600 ? status : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
