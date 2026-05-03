import type { APIRoute } from 'astro';
import { getSessionModifications, acceptModification } from '@features/sessions/services/sessionService';

export const prerender = false;

async function resolveRequestId(sessionId: string, token: string): Promise<string> {
  try {
    const raw = await getSessionModifications(sessionId, token);
    const arr: any[] = Array.isArray(raw)
      ? raw
      : (raw as any)?.modifications ?? (raw as any)?.requests ?? (raw as any)?.data ?? [];
    const pending = arr.find((m: any) => m.status === 'PENDING') ?? arr[0];
    return pending?.id ?? pending?.idRequest ?? '';
  } catch {
    return '';
  }
}

export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requestId = await resolveRequestId(sessionId, token);
    if (!requestId) {
      console.error('[BFF] accept-modification: no se encontró requestId para sessionId:', sessionId);
      return new Response(
        JSON.stringify({ message: 'No se encontró la solicitud de modificación pendiente' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await acceptModification(sessionId, requestId, token);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error en accept-modification:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
