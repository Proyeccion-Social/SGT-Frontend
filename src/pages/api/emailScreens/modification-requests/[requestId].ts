// src/pages/api/emailScreens/modification-requests/[requestId].ts
// BFF: reads HttpOnly cookie, calls getModificationRequest

import type { APIRoute } from 'astro';
import { getModificationRequest } from '@features/emailScreens/services/sessionService';

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requestId = params.requestId;
    if (!requestId) {
      return new Response(
        JSON.stringify({ message: 'requestId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await getModificationRequest(requestId, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en modification-request detail:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
