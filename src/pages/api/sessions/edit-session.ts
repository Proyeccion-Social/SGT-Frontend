import type { APIRoute } from 'astro';
import { editSession } from '@features/sessions/services/sessionService';
import { getErrorMessage } from '@/utils/errorMessages';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, ...body } = await request.json();
    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await editSession(sessionId, body, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en edit-session:', error);
    return new Response(
      JSON.stringify({ message: getErrorMessage(error.message) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
