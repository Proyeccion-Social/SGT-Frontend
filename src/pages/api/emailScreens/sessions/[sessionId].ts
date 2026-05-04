// src/pages/api/emailScreens/sessions/[sessionId].ts
// BFF: reads HttpOnly cookie, calls getSessionDetail

import type { APIRoute } from 'astro';
import { getSessionDetail } from '@features/emailScreens/services/sessionService';

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionId = params.sessionId;
    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await getSessionDetail(sessionId, token);
    console.log(`[BFF] Datos de sesión ${sessionId} obtenidos:`, data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error: any) {
    console.error(`[BFF] ERROR en session detail para ${params.sessionId}:`, error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
