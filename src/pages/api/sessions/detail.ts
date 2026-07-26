// src/pages/api/sessions/detail.ts
import type { APIRoute } from 'astro';
import { getSessionDetail, getSessionModifications } from '@features/sessions/services/sessionService';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('access_token')?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
      return new Response(
        JSON.stringify({ message: 'sessionId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await getSessionDetail(sessionId, token);

    // Si hay modificación pendiente, inyectar los datos de la solicitud
    if ((data as any).status === 'PENDING_MODIFICATION') {
      try {
        const mods = await getSessionModifications(sessionId, token);
        const modsArray: any[] = Array.isArray(mods)
          ? mods
          : (mods as any)?.modifications ?? (mods as any)?.data ?? [];
        const pending = modsArray.find((m: any) => m.status === 'PENDING') ?? modsArray[0];
        if (pending) {
          const rawProposer =
            pending.proposedBy ??
            pending.requestedBy ??
            pending.proposerId ??
            pending.createdBy ??
            pending.userId ??
            pending.proposedByUserId ??
            pending.requesterId;
          const proposedBy =
            rawProposer != null && typeof rawProposer === 'object'
              ? (rawProposer.id ?? rawProposer.userId ?? undefined)
              : rawProposer;
          (data as any).pendingModification = {
            ...pending,
            id: pending.id ?? pending.idRequest,
            proposedBy: proposedBy != null ? String(proposedBy) : undefined,
          };
        }
      } catch (modErr: any) {
        console.error('[BFF] detail: fallo al obtener modificaciones:', modErr?.message ?? modErr);
      }
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[BFF] Error en session detail:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};