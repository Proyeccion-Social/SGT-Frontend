// src/pages/api/emailScreens/modification-requests/[requestId].ts
// BFF: reads HttpOnly cookie, calls getModificationRequest

import type { APIRoute } from 'astro';
import { getModificationRequest, getSessionDetail } from '@features/emailScreens/services/sessionService';

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

    // 1. Obtener la solicitud de modificación
    const modData = await getModificationRequest(requestId, token);
    
    // 2. Obtener los detalles de la sesión original
    const sessionData = await getSessionDetail(modData.idSession, token);

    // 3. Mapear y combinar los datos para el frontend
    const combinedData = {
      id: modData.idRequest,
      sessionId: modData.idSession,
      sessionTitle: sessionData.title,
      sessionDescription: sessionData.description,
      
      // Datos actuales (de la sesión)
      currentModality: sessionData.modality,
      currentDurationHours: sessionData.duration,
      currentSchedule: `${sessionData.scheduledDate} ${sessionData.startTime}`,
      
      // Datos propuestos (de la solicitud)
      newModality: modData.newModality,
      newDurationHours: parseFloat(modData.newDurationHours),
      newSchedule: modData.newScheduledDate && modData.newStartTime 
        ? `${modData.newScheduledDate} ${modData.newStartTime}`
        : null,
      
      status: modData.status,
      proposedBy: sessionData.tutor?.name || 'Usuario',
      expiresAt: modData.expiresAt,
    };

    console.log('[BFF] Datos combinados enviados al Front:', JSON.stringify(combinedData, null, 2));

    return new Response(JSON.stringify(combinedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[BFF] Error al combinar datos de modificación:', error);
    return new Response(
      JSON.stringify({ message: error.message ?? 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
