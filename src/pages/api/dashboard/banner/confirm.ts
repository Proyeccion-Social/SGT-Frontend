import type { APIRoute } from "astro";
import { confirmDashboardBanner } from "@/features/dashboards/services/bannerService";
import type { ConfirmBannerPayload } from "@/features/dashboards/types/banner.types";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get("access_token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ message: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as Partial<ConfirmBannerPayload>;
    const { secure_url, public_id, targetUrl } = body;

    if (!secure_url || !public_id || !targetUrl) {
      return new Response(
        JSON.stringify({
          message: "secure_url, public_id y targetUrl son requeridos",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await confirmDashboardBanner(token, {
      secure_url,
      public_id,
      targetUrl,
    });

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
    console.error("[BFF] Error en POST dashboard/banner/confirm:", error);
    return new Response(JSON.stringify({ message }), {
      status: status >= 400 && status < 600 ? status : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
