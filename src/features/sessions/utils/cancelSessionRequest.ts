// cancelSessionRequest.ts
// Puntos de entrada de cliente para cancelar una tutoría y para retirar una
// solicitud pendiente. Traducen la respuesta del BFF al contrato `CancelResult`:
//  - 200 `{ success, message }`      -> { ok: true, message }
//  - 400/403/404 `{ message, error }` -> { ok: false, status, message }
// El texto mostrado al usuario es SIEMPRE el `message` del backend.

import type { CancelResult } from '../types/session.types';

async function sendDelete(
  url: string,
  payload: Record<string, unknown>,
  fallbacks: { success: string; error: string }
): Promise<CancelResult> {
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    const rawMessage = (body as { message?: string | string[] })?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage;

    // `success: false` con HTTP 200 también es un fallo, no un éxito silencioso.
    if (!res.ok || (body as { success?: boolean })?.success === false) {
      return { ok: false, status: res.status, message: message ?? fallbacks.error };
    }

    return { ok: true, message: message ?? fallbacks.success };
  } catch {
    // Fallo de red: no llegó a haber respuesta del backend.
    return {
      ok: false,
      status: 0,
      message: 'Sin conexión con el servidor. Revisa tu red e intenta de nuevo.',
    };
  }
}

/** Cancela una sesión SCHEDULED (`DELETE /scheduling/sessions/:id`). */
export function cancelSessionRequest(
  sessionId: string,
  reason: string
): Promise<CancelResult> {
  return sendDelete(
    '/api/sessions/cancel-session',
    { sessionId, reason },
    { success: 'Sesión cancelada exitosamente.', error: 'No se pudo cancelar la tutoría.' }
  );
}

/**
 * Retira una solicitud PENDING_TUTOR_CONFIRMATION
 * (`DELETE /scheduling/sessions/:id/withdraw-request`, solo estudiante).
 * El motivo es opcional.
 */
export function withdrawSessionRequest(
  sessionId: string,
  reason?: string
): Promise<CancelResult> {
  return sendDelete(
    '/api/sessions/withdraw-request',
    reason ? { sessionId, reason } : { sessionId },
    { success: 'Solicitud retirada exitosamente.', error: 'No se pudo retirar la solicitud.' }
  );
}
