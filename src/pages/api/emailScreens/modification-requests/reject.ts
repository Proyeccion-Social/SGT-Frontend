// src/pages/api/modification-requests/reject.ts
// BFF: reads HttpOnly cookie, calls rejectModificationRequest

import type { APIRoute } from 'astro';
import { rejectModificationRequest } from '@features/emailScreens/services/sessionService';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return new Response(
        JSON.stringify({ message: 'requestId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await rejectModificationRequest(requestId, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en reject modification:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
