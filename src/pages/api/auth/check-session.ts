import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('access_token')?.value;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 >= Date.now()) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {}
  }

  const refreshToken = cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    cookies.delete('access_token', { path: '/' });
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const API_URL = import.meta.env.API_URL;
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      cookies.delete('access_token', { path: '/' });
      cookies.delete('refresh_token', { path: '/' });
      return new Response(JSON.stringify({ ok: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    cookies.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60,
    });
    cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[check-session] Error al renovar el token:', err);
    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
