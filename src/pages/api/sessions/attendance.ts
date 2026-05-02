// src/pages/api/sessions/attendance.ts
// BFF: lee cookie HttpOnly, llama a registerAttendance y reenvía resultado

import type { APIRoute } from 'astro';
import { registerAttendance, registerCompletedSession } from '@features/sessions/services/sessionService';
import type { RegisterAttendanceDTO, CompleteSessionBody } from '@features/sessions/types/session.types';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL(request.url);
    let sessionId = url.searchParams.get('sessionId');

    const body = await request.json();
    if (!sessionId && body.sessionId) {
      sessionId = body.sessionId;
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { attendances, tutorId, isCompletion } = body;
    if (!attendances) {
      return new Response(
        JSON.stringify({message: "Datos de asistencia faltantes"}),
        { status: 400, headers: { "Content-type": "application/json"}}
      )
    }

    const attendancePayload: RegisterAttendanceDTO = {attendances};
    const attendanceResult = await registerAttendance(sessionId, attendancePayload, token);

    // Si viene tutorId y no es solo registro de asistencia, intentamos completar
    let completionData = null;
    if (tutorId) {
      try {
        const completePayload: CompleteSessionBody = {tutorId};
        completionData = await registerCompletedSession(sessionId, completePayload, token);
      } catch (e: any) {
        console.warn('[BFF] Error al intentar completar sesión:', e.message);
        // Opcional: podrías decidir si fallar todo o solo advertir.
        // Dado que la asistencia ya se registró, devolvemos éxito parcial o informamos del error.
      }
    }


    return new Response(JSON.stringify({
      message: "Asistencia registrada exitosamente",
      attendance: attendanceResult,
      completion: completionData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error procesando asistencia:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

