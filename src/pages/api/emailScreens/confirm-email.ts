import type { APIRoute } from 'astro';
import { fetchMe } from '@features/auth/services/authService';

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

    if (!res.ok) {
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (data.accessToken && data.refreshToken) {
      cookies.set("access_token", data.accessToken, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60,
      });
      cookies.set("refresh_token", data.refreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });

      // Fetch full user profile to get requiresProfileCompletion correctly
      // (same pattern as api/auth/login BFF)
      const me = await fetchMe(data.accessToken);

      return new Response(
        JSON.stringify({
          user: me.user,
          requiresProfileCompletion: me.requiresProfileCompletion ?? false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: return raw data if tokens are missing (shouldn't happen on success)
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
