import type { APIRoute } from 'astro';
import { confirmSession } from '@features/sessions/services/sessionService';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, ...body } = await request.json();
    console.log('[BFF] confirm-session request → sessionId:', sessionId, 'body:', JSON.stringify(body));
    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await confirmSession(sessionId, body, token);
    console.log('[BFF] confirm-session OK:', JSON.stringify(data));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en confirm-session:', error);
    console.error('[BFF] confirm-session message:', error?.message);
    console.error('[BFF] confirm-session stack:', error?.stack);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
