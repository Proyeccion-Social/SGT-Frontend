import type { APIRoute } from "astro";
import { login, fetchMe } from "@/features/auth/services/authService";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    const result = await login(email, password);

    cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60
    });

    cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    const me = await fetchMe(result.accessToken);

    return new Response(
      JSON.stringify({
        user: me.user,
        requiresPasswordChange: me.requiresPasswordChange ?? false,
        requiresProfileCompletion: me.requiresProfileCompletion ?? false,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 401 }
    );
  }
};
