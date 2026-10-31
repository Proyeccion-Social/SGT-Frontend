import type { APIRoute } from 'astro';
import { cancelSession, SessionServiceError } from '@features/sessions/services/sessionService';

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
    if (!sessionId || !reason) {
      return errorResponse(400, 'sessionId y reason son requeridos', 'Bad Request');
    }

    // El body de éxito (`{ success, message }`) se reenvía intacto: su `message`
    // es lo único que distingue el abandono grupal de la cancelación completa.
    const data = await cancelSession(sessionId, reason, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en cancel-session:', error);
    // Los errores de negocio del backend (400/403/404) conservan su status y su
    // mensaje; solo lo inesperado cae a 500.
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
