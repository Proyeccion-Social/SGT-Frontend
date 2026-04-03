// IncomingSessionsCard.tsx
// Renders sessions fetched by DashboardSessionManager via useSessions
// Option B: Detalles button dispatches CustomEvent 'open-detail' to document

import { useMemo, useState } from 'react';
import '../styles/IncomingSessionsCard.css';
import type { Session } from '../../sessions/types/session.types';
import AttendencePostSession from '@features/sessions/components/AttendencePostSession';
import FinishSession from '@/features/sessions/components/FinishSession';

interface Props {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  /** Quién ve la tarjeta: condiciona botones tutor (Terminar / Asistencia). */
  viewerRole: 'tutor' | 'student';
}

export type SessionTimePhase = 'upcoming' | 'in_progress' | 'ended';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (time: string) => time.substring(0, 5); // "HH:mm:ss" → "HH:mm"

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

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

const getTimeLeft = (scheduledDate: string, startTime: string, endTime: string): string => {
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

const openDetail = (sessionId: string) => {
  document.dispatchEvent(
    new CustomEvent('open-detail', { detail: { sessionId } })
  );
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="session-card" aria-hidden="true">
    <div className="card-content">
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '40%' }} />
    </div>
    <div className="actions">
      <div className="skeleton" style={{ height: 34, width: 80, borderRadius: 10 }} />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const IncomingSessionsCard = ({ sessions, isLoading, error, viewerRole }: Props) => {
  const sortedSessions = useMemo(() => sortSessionsForDisplay(sessions), [sessions]);

  const [attendanceSession, setAttendanceSession] = useState<Session | null>(
    null
  );
  const [finishingSession, setFinishingSession] = useState<Session | null>(null);

  const handleAttendanceOpen = (session: Session) => {
    setAttendanceSession(session);
  };

  const handleAttendanceClose = () => {
    setAttendanceSession(null);
  };

  return (
    <div className="session-container">
      <h2 className="main-title">Tus proximas sesiones</h2>

      <div className="cards-stack">
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isLoading && error && (
          <p style={{ color: 'white', fontSize: 14 }}>{error}</p>
        )}

        {!isLoading && !error && sortedSessions.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            No tienes sesiones próximas agendadas.
          </p>
        )}

        {!isLoading && !error && sortedSessions.map((session) => {
          const phase = getSessionTimePhase(
            session.scheduledDate,
            session.startTime,
            session.endTime
          );
          const isTutor = viewerRole === 'tutor';

          return (
          <div key={session.id} className="session-card">
            <div className="card-content">
              <div className="card-header">
                <span>{session.title}</span>
                <span className="badge-time">
                  {getTimeLeft(session.scheduledDate, session.startTime, session.endTime)}
                </span>
              </div>

              <p className="description">{session.description}</p>

              <div className="card-footer">
                <div className="tags">
                  <span className="tag-subject">{String(session.subject)}</span>
                  <span className="tag-status">{String(session.status)}</span>
                </div>
                <span className="time-label">
                  {formatDate(session.scheduledDate)} · {formatTime(session.startTime)}
                </span>
              </div>
            </div>

            <div className="actions">
              {phase === 'upcoming' && (
                <button
                  type="button"
                  className="btn-details"
                  onClick={() => openDetail(session.id)}
                  aria-label={`Ver detalles de ${session.title}`}
                >
                  Detalles
                </button>
              )}

              {phase === 'in_progress' && isTutor && (
                <button
                  type="button"
                  className="btn-terminar"
                  aria-label={`Terminar sesión ${session.title}`}
                  onClick={() => setFinishingSession(session)}
                >
                  Terminar
                </button>
              )}

              {phase === 'in_progress' && !isTutor && (
                <button
                  type="button"
                  className="btn-details-disabled"
                  onClick={() => openDetail(session.id)}
                  aria-label={`Ver detalles de ${session.title}`}
                >
                  Detalles
                </button>
              )}

              {phase === 'ended' && isTutor && (
                <button
                  type="button"
                  className="btn-asistencia"
                  aria-label={`Asistencia de ${session.title}`}
                  onClick={() => handleAttendanceOpen(session)}
                >
                  Asistencia
                </button>
              )}

              {phase === 'ended' && !isTutor && (
                <button
                  type="button"
                  className="btn-calificar"
                  aria-label={`Calificar sesión ${session.title}`}
                >
                  Calificar
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      <div className="bottom-overlay">
        <span className="view-more">Ver más</span>
      </div>

      {attendanceSession && (
        <AttendencePostSession
          key={attendanceSession.id}
          session={attendanceSession}
          onClose={handleAttendanceClose}
        />
      )}

      {finishingSession && (
        <FinishSession
          session={finishingSession}
          onClose={() => setFinishingSession(null)}
          onConfirm={() => {
            setFinishingSession(null);
            setAttendanceSession(finishingSession);
          }}
        />
      )}
    </div>
  );
};

export default IncomingSessionsCard;