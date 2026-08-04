// BFF: completa una sesión (PATCH /session-execution/sessions/:id/complete).
// Solo sessionId en path; sin body.

import type { APIRoute } from 'astro';
import {
  registerCompletedSession,
  SessionServiceError,
} from '@features/sessions/services/sessionService';

function errorResponse(
  status: number,
  message: string,
  errorCode?: string,
  description?: string
) {
  return new Response(
    JSON.stringify({ errorCode, message, description }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return errorResponse(401, 'No autenticado', 'AUTH_05');
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const sessionId =
      url.searchParams.get('sessionId') ??
      (typeof body.sessionId === 'string' ? body.sessionId : null);

    if (!sessionId) {
      return errorResponse(400, 'sessionId requerido', 'VALIDATION_01');
    }

    const data = await registerCompletedSession(sessionId, token);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    if (error instanceof SessionServiceError) {
      return errorResponse(
        error.status,
        error.message,
        error.errorCode,
        error.description
      );
    }
    console.error('[BFF] Error completando sesión:', error);
    return errorResponse(
      500,
      error instanceof Error ? error.message : 'Error interno del servidor',
      'INTERNAL_01'
    );
  }
};
