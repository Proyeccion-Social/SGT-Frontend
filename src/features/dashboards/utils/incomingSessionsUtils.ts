import type { Session } from '../../sessions/types/session.types';

export const sessionPhase = {
    'upcoming': "Próxima",
    'in_progress': "En curso",
    'ended': "Finalizada"
}

export type SessionTimePhase = keyof typeof sessionPhase;

/** Fase temporal respecto a inicio y fin (misma fecha de agenda). */
export const getSessionTimePhase = (
  scheduledDate: string,
  startTime: string,
  endTime: string
): SessionTimePhase => {
  const start = new Date(`${scheduledDate}T${startTime}`);
  const end = new Date(`${scheduledDate}T${endTime}`);
  const t = Date.now();
  if (t < start.getTime()) return 'upcoming';
  if (t < end.getTime()) return 'in_progress';
  return 'ended';
};

export const formatTime = (time: string) => time.substring(0, 5); // "HH:mm:ss" → "HH:mm"

export const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};


export const getTimeLeft = (scheduledDate: string, startTime: string, endTime: string): string => {
  const phase = getSessionTimePhase(scheduledDate, startTime, endTime);
  if (phase === 'in_progress') return 'En curso';
  if (phase === 'ended') return 'Finalizada';

  const start = new Date(`${scheduledDate}T${startTime}`);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (diffDays > 0) return `En ${diffDays}d ${diffHours}h`;

  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) return `En ${diffHours}h ${diffMins}min`;
  if (diffMins > 0) return `En ${diffMins}min`;
  return 'En menos de 1 min';
};

/** Orden: finalizadas → en curso → próximas (próximas: de la más cercana a la más lejana). */
export function sortSessionsForDisplay(sessions: Session[]): Session[] {
  const startMs = (s: Session) =>
    new Date(`${s.scheduledDate}T${s.startTime}`).getTime();
  const endMs = (s: Session) =>
    new Date(`${s.scheduledDate}T${s.endTime}`).getTime();
  const rank = (s: Session) => {
    const p = getSessionTimePhase(s.scheduledDate, s.startTime, s.endTime);
    return p === 'ended' ? 0 : p === 'in_progress' ? 1 : 2;
  };

  if (!Array.isArray(sessions)) return [];

  return [...sessions].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;

    const pa = getSessionTimePhase(a.scheduledDate, a.startTime, a.endTime);
    if (pa === 'ended') return endMs(b) - endMs(a);
    if (pa === 'in_progress') return startMs(a) - startMs(b);
    return startMs(a) - startMs(b);
  });
}