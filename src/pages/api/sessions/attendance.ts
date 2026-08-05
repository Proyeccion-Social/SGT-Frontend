// BFF: registra asistencia y, si tiene éxito, intenta completar la sesión.
// Si el complete falla, se informa (no se traga el error) manteniendo la asistencia ya registrada.

import type { APIRoute } from 'astro';
import {
  registerAttendance,
  registerCompletedSession,
  SessionServiceError,
} from '@features/sessions/services/sessionService';
import type {
  RegisterAttendanceDTO,
  AttendanceAndCompleteResult,
} from '@features/sessions/types/session.types';

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

    const attendances = body.attendances;
    if (!Array.isArray(attendances) || attendances.length === 0) {
      return errorResponse(
        400,
        'Se requiere al menos un registro de asistencia',
        'VALIDATION_01'
      );
    }

    const attendancePayload: RegisterAttendanceDTO = { attendances };
    const attendanceResult = await registerAttendance(
      sessionId,
      attendancePayload,
      token
    );

    let completion: AttendanceAndCompleteResult['completion'] = null;
    let completionError: AttendanceAndCompleteResult['completionError'];

    try {
      completion = await registerCompletedSession(sessionId, token);
    } catch (e: unknown) {
      if (e instanceof SessionServiceError) {
        completionError = {
          errorCode: e.errorCode,
          message: e.message,
        };
      } else {
        completionError = {
          message:
            e instanceof Error
              ? e.message
              : 'No se pudo completar la sesión tras registrar la asistencia',
        };
      }
    }

    const result: AttendanceAndCompleteResult = {
      message: completion
        ? 'Asistencia registrada y sesión completada'
        : 'Asistencia registrada; la sesión no pudo completarse',
      attendance: attendanceResult,
      completion,
      ...(completionError ? { completionError } : {}),
    };

    return new Response(JSON.stringify(result), {
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
    console.error('[BFF] Error procesando asistencia:', error);
    return errorResponse(
      500,
      error instanceof Error ? error.message : 'Error interno del servidor',
      'INTERNAL_01'
    );
  }
};
