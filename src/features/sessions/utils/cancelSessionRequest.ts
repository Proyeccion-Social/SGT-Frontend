// cancelSessionRequest.ts
// Único punto de entrada de cliente para cancelar una tutoría.
// Traduce la respuesta del BFF al contrato `CancelResult` que consume la UI:
//  - 200 `{ success, message }`      -> { ok: true, message }
//  - 400/403/404 `{ message, error }` -> { ok: false, status, message }
// El texto mostrado al usuario es SIEMPRE el `message` del backend.

import type { CancelResult } from '../types/session.types';

export async function cancelSessionRequest(
  sessionId: string,
  reason: string
): Promise<CancelResult> {
  try {
    const res = await fetch('/api/sessions/cancel-session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, reason }),
    });

    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    const rawMessage = (body as { message?: string | string[] })?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage;

    // `success: false` con HTTP 200 también es un fallo, no un éxito silencioso.
    if (!res.ok || (body as { success?: boolean })?.success === false) {
      return {
        ok: false,
        status: res.status,
        message: message ?? 'No se pudo cancelar la tutoría.',
      };
    }

    return { ok: true, message: message ?? 'Sesión cancelada exitosamente.' };
  } catch {
    // Fallo de red: no llegó a haber respuesta del backend.
    return {
      ok: false,
      status: 0,
      message: 'Sin conexión con el servidor. Revisa tu red e intenta de nuevo.',
    };
  }
}
