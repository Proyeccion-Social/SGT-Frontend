// src/pages/api/modification-requests/accept.ts
// BFF: reads HttpOnly cookie, calls acceptModificationRequest

import type { APIRoute } from 'astro';
import { acceptModificationRequest } from '@features/emailScreens/services/sessionService';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { requestId, sessionId } = await request.json();
    if (!requestId || !sessionId) {
      return new Response(
        JSON.stringify({ message: 'requestId y sessionId son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await acceptModificationRequest(sessionId, requestId, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en accept modification:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
