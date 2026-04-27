import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Token requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiUrl = new URL(`${import.meta.env.API_URL}/auth/password/reset`);
    apiUrl.searchParams.set('token', token);

    const res = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await res.json().catch(() => ({}));

    // Devolvemos el estado original del backend para que sileo.promise funcione correctamente
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
