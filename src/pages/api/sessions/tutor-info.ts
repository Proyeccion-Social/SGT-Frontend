// src/pages/api/sessions/tutor-info.ts
// BFF: reads HttpOnly cookie, calls getTutorInfo

import type { APIRoute } from 'astro';
import { getTutorInfo } from '@features/sessions/services/sessionService';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url     = new URL(request.url);
    const tutorId = url.searchParams.get('tutorId');

    if (!tutorId) {
      return new Response(
        JSON.stringify({ message: 'tutorId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await getTutorInfo(tutorId, token);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en tutor-info:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};