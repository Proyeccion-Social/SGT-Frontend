import type { Session, SessionParticipant } from '../types/session.types';

/** Ventana de evaluación: 7 días desde scheduledDate hasta 23:59:59.999 UTC. */
export const EVALUATION_WINDOW_DAYS = 7;

const EVALUABLE_PARTICIPANT_STATUSES = new Set(['ATTENDED', 'LATE']);

function endOfEvaluationWindowUtc(scheduledDate: string): Date {
  // scheduledDate = "YYYY-MM-DD" → fin del día + 6 días en UTC
  const [y, m, d] = scheduledDate.split('-').map(Number);
  const end = new Date(Date.UTC(y, m - 1, d + (EVALUATION_WINDOW_DAYS - 1), 23, 59, 59, 999));
  return end;
}

export interface CanEvaluateResult {
  canEvaluate: boolean;
  reason?: string;
}

/**
 * Reglas de elegibilidad para POST /sessions/:id/evaluation:
 * - sesión COMPLETED
 * - rol estudiante (el caller filtra por rol)
 * - participante ATTENDED o LATE (notificados por el backend)
 * - dentro de 7 días desde scheduledDate (hasta 23:59:59.999 UTC)
 */
export function canEvaluateSession(
  session: Session,
  participant: SessionParticipant | undefined | null,
  now: Date = new Date()
): CanEvaluateResult {
  if (String(session.status) !== 'COMPLETED') {
    return { canEvaluate: false, reason: 'La sesión aún no está completada.' };
  }

  if (!participant) {
    return { canEvaluate: false, reason: 'No eres participante de esta sesión.' };
  }

  const pStatus = String(participant.status).toUpperCase();
  if (!EVALUABLE_PARTICIPANT_STATUSES.has(pStatus)) {
    if (pStatus === 'ABSENT') {
      return { canEvaluate: false, reason: 'No puedes calificar una sesión a la que no asististe.' };
    }
    return { canEvaluate: false, reason: 'Tu asistencia no permite calificar esta sesión.' };
  }

  if (!session.scheduledDate) {
    return { canEvaluate: false, reason: 'Fecha de sesión no disponible.' };
  }

  const windowEnd = endOfEvaluationWindowUtc(session.scheduledDate);
  if (now.getTime() > windowEnd.getTime()) {
    return {
      canEvaluate: false,
      reason: 'El plazo de 7 días para calificar esta sesión ha expirado.',
    };
  }

  return { canEvaluate: true };
}
