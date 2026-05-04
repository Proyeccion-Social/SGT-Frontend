import type { APIRoute } from 'astro';
import { cancelSession } from '@features/sessions/services/sessionService';
import { getErrorMessage } from '@/utils/errorMessages';

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, reason } = await request.json();
    if (!sessionId || !reason) {
      return new Response(
        JSON.stringify({ message: 'sessionId y reason son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await cancelSession(sessionId, reason, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en cancel-session:', error);
    return new Response(
      JSON.stringify({ message: getErrorMessage(error.message) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
