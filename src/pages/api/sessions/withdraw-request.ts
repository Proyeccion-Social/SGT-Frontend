import type { APIRoute } from 'astro';
import { withdrawSession, SessionServiceError } from '@features/sessions/services/sessionService';

/** Respuesta de error con la misma forma que emite NestJS. */
function errorResponse(status: number, message: string, error: string) {
  return new Response(
    JSON.stringify({ statusCode: status, message, error }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return errorResponse(401, 'No autenticado', 'Unauthorized');
    }

    const { sessionId, reason } = await request.json();
    if (!sessionId) {
      return errorResponse(400, 'sessionId es requerido', 'Bad Request');
    }

    // El motivo es opcional; la validación (10-500 caracteres) la hace el backend.
    const data = await withdrawSession(sessionId, token, reason || undefined);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en withdraw-request:', error);
    if (error instanceof SessionServiceError) {
      return errorResponse(
        error.status,
        error.message,
        error.errorCode ?? 'Error'
      );
    }
    return errorResponse(
      500,
      error?.message ?? 'Error interno del servidor',
      'Internal Server Error'
    );
  }
};
