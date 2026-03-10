import type { APIRoute } from "astro";
import { login } from "@/features/auth/services/authService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    const result = await login(email, password);

    cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15
    });

    cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    // Configuración de cookies
    headers.append("Set-Cookie", `access_token=${result.accessToken}; Path=/; Max-Age=900; SameSite=Lax`);
    headers.append("Set-Cookie", `refresh_token=${result.refreshToken}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax`);

    return new Response(
      JSON.stringify({
        user: result.user,
        accessToken: result.accessToken
      }),
      {
        status: 200,
        headers
      }
    );

  } catch (error: any) {

    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 401 }
    );

  }
};
