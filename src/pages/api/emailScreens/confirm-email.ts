import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Token requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiUrl = new URL(`${import.meta.env.API_URL}/auth/confirm-email`);

    const res = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.accessToken && data.refreshToken) {
      cookies.set("access_token", data.accessToken, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60, // 1h matches JWT expiry
      });
      cookies.set("refresh_token", data.refreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message ?? 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
