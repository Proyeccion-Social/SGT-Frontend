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
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = await request.json();
    const { attendances, tutorId} = body;
    if (!attendances || !tutorId) {
      return new Response(
        JSON.stringify({message: "Datos de asistencia o tutorId faltantes"}),
        { status: 400, headers: { "Content-type": "application/json"}}
      )
    }

    const attendancePayload: RegisterAttendanceDTO = {attendances};
    await registerAttendance(sessionId, attendancePayload, token);

    const completePayload: CompleteSessionBody = {tutorId};
    const completionData = await registerCompletedSession(sessionId, completePayload, token);


    return new Response(JSON.stringify({
      message: "Asistencia registrada y sesión completada con éxito",
      data: completionData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error orquestando asistencia y completado:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

