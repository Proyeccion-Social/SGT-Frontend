import type { APIRoute } from "astro";
import { login } from "@/features/auth/services/authService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    const result = await login(email, password);

    cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15 // 15 min
    });

    cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api", 
      maxAge: 60 * 60 * 24 * 7
    });

    return new Response(
      JSON.stringify({ user: result.user }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {

    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 401 }
    );

  }
};
