// src/pages/api/sessions/my-sessions.ts
// BFF: reads HttpOnly cookie, calls sessionService, returns sessions to client

import type { APIRoute } from 'astro';
import { getSessions } from '@features/sessions/services/sessionService';
import { UserRole } from '@/constants/roles';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url  = new URL(request.url);
    const role = url.searchParams.get('role');

    if (!role || (role !== UserRole.STUDENT.toLowerCase() && role !== UserRole.TUTOR.toLowerCase())) {
      return new Response(
        JSON.stringify({ message: 'role inválido. Usa student o tutor.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await getSessions(role as UserRole, token);

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en my-sessions:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};