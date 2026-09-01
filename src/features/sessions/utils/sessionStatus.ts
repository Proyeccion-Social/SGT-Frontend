// sessionStatus.ts
// Derivaciones de estado y reglas de negocio de la card de información de sesión.
// Centraliza:
//  - Fase temporal de una sesión SCHEDULED (upcoming / in_progress / ended).
//  - Label visible del estado (incluye derivaciones temporales).
//  - Reglas SCHEDULING-40/41 (proponer modificación) y regla de 24h (cancelar).

import type { Session } from '../types/session.types';

/** SCHEDULING-41 — una modificación solo puede proponerse con MÁS de 3 días de antelación. */
export const MIN_PROPOSE_LEAD_DAYS = 3;
/** Regla de cancelación — solo se puede cancelar con 24 horas o más de antelación. */
export const MIN_CANCEL_LEAD_HOURS = 24;

const MS_PER_HOUR = 60 * 60 * 1000;

export type SessionTimePhase = 'upcoming' | 'in_progress' | 'ended';

const TERMINAL_STATUSES = [
  'COMPLETED',
  'REJECTED_BY_TUTOR',
  'CANCELLED',
  'CANCELLED_BY_STUDENT',
  'CANCELLED_BY_TUTOR',
  'CANCELLED_BY_ADMIN',
  'EXPIRED_UNCONFIRMED',
];

export const isTerminalStatus = (status: string): boolean =>
  TERMINAL_STATUSES.includes(String(status));

export const getSessionStart = (session: Session): Date =>
  new Date(`${session.scheduledDate}T${session.startTime}`);

export const getSessionEnd = (session: Session): Date =>
  new Date(`${session.scheduledDate}T${session.endTime}`);

/** Fase temporal respecto al inicio y fin programados (misma fecha de agenda). */
export const getSessionTimePhase = (
  scheduledDate: string,
  startTime: string,
  endTime: string,
  now: Date = new Date()
): SessionTimePhase => {
  const start = new Date(`${scheduledDate}T${startTime}`).getTime();
  const end = new Date(`${scheduledDate}T${endTime}`).getTime();
  const t = now.getTime();
  if (t < start) return 'upcoming';
  if (t < end) return 'in_progress';
  return 'ended';
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  PENDING_TUTOR_CONFIRMATION: 'Pendiente de confirmación',
  SCHEDULED: 'Programada',
  PENDING_MODIFICATION: 'Modificación pendiente',
  REJECTED_BY_TUTOR: 'Rechazada por tutor',
  CANCELLED_BY_STUDENT: 'Cancelada por estudiante',
  CANCELLED_BY_TUTOR: 'Cancelada por tutor',
  CANCELLED_BY_ADMIN: 'Cancelada por administrador',
  EXPIRED_UNCONFIRMED: 'Expirada sin confirmar',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  CONFIRMED: 'Confirmada',
};

/**
 * Label de estado para la card de información.
 * Una sesión SCHEDULED cambia su etiqueta según la hora actual:
 *  - En curso: now ∈ [start, end)
 *  - Esperando a que el tutor marque asistencia: now ≥ end
 */
export const getSessionDisplayStatus = (
  session: Session,
  now: Date = new Date()
): string => {
  const status = String(session.status);
  if (status === 'SCHEDULED') {
    const phase = getSessionTimePhase(
      session.scheduledDate,
      session.startTime,
      session.endTime,
      now
    );
    if (phase === 'in_progress') return 'En curso';
    if (phase === 'ended') return 'Esperando a que el tutor marque asistencia';
  }
  return SESSION_STATUS_LABELS[status] ?? status;
};

export interface ActionAvailability {
  /** Si el botón debe renderizarse. */
  visible: boolean;
  /** Si debe renderizarse deshabilitado (con tooltip explicativo). */
  disabled: boolean;
  /** Motivo del disabled — contenido del tooltip. */
  reason?: string;
}

/**
 * SCHEDULING-40 — solo se puede proponer modificación en estado SCHEDULED.
 * Además la sesión no debe haber iniciado (En curso / Esperando asistencia no la muestran).
 * SCHEDULING-41 — solo con MÁS de 3 días de antelación; si quedan 3 días o menos,
 * el botón se muestra deshabilitado con tooltip explicativo.
 */
export const canProposeModification = (
  session: Session,
  now: Date = new Date()
): ActionAvailability => {
  if (String(session.status) !== 'SCHEDULED') {
    return { visible: false, disabled: false };
  }

  const phase = getSessionTimePhase(
    session.scheduledDate,
    session.startTime,
    session.endTime,
    now
  );
  if (phase !== 'upcoming') {
    return { visible: false, disabled: false };
  }

  const msUntilStart = getSessionStart(session).getTime() - now.getTime();
  if (msUntilStart <= MIN_PROPOSE_LEAD_DAYS * 24 * MS_PER_HOUR) {
    return {
      visible: true,
      disabled: true,
      reason: `Solo puedes proponer cambios con más de ${MIN_PROPOSE_LEAD_DAYS} días de antelación.`,
    };
  }

  return { visible: true, disabled: false };
};

/**
 * Regla de cancelación — permitida con 24 horas o más de antelación.
 * Aplica a solicitudes PENDING_TUTOR_CONFIRMATION y sesiones SCHEDULED futuras.
 * Si la sesión está en curso o terminada (esperando asistencia), no se muestra.
 */
export const canCancelSession = (
  session: Session,
  now: Date = new Date()
): ActionAvailability => {
  const status = String(session.status);
  const isPendingConfirmation = status === 'PENDING_TUTOR_CONFIRMATION';
  const isScheduled = status === 'SCHEDULED';

  if (!isPendingConfirmation && !isScheduled) {
    return { visible: false, disabled: false };
  }

  if (isScheduled) {
    const phase = getSessionTimePhase(
      session.scheduledDate,
      session.startTime,
      session.endTime,
      now
    );
    if (phase !== 'upcoming') {
      return { visible: false, disabled: false };
    }
  }

  const msUntilStart = getSessionStart(session).getTime() - now.getTime();
  if (msUntilStart < MIN_CANCEL_LEAD_HOURS * MS_PER_HOUR) {
    return {
      visible: true,
      disabled: true,
      reason: `No es posible cancelar, faltan menos de ${MIN_CANCEL_LEAD_HOURS} horas para la sesión.`,
    };
  }

  return { visible: true, disabled: false };
};
