// IncomingSessionsCard.tsx
// Renders sessions fetched by DashboardSessionManager via useSessions
// Option B: Detalles button dispatches CustomEvent 'open-detail' to document

import { useMemo, useState } from 'react';
import '../styles/IncomingSessionsCard.css';
import type { Session } from '../../sessions/types/session.types';
import AttendancePostSession from '@features/sessions/components/AttendancePostSession';
import FinishSession from '@/features/sessions/components/FinishSession';
import { UserRole } from '@/constants/roles';
import { sessionPhase, getTimeLeft, getSessionTimePhase, formatTime, formatDate, type SessionTimePhase, sortSessionsForDisplay } from '../utils/incomingSessionsUtils';
import { useSubjectStore } from '@/store/subjectStore';

interface Props {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  /** Quién ve la tarjeta: condiciona botones tutor (Terminar / Asistencia). */
  viewerRole: UserRole;
  onRefetch?: () => void;
}

// Helpers are now imported from incomingSessionsUtils.ts

const openDetail = (sessionId: string) => {
  document.dispatchEvent(
    new CustomEvent('open-detail', { detail: { sessionId } })
  );
};

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

export const IncomingSessionsCard = ({ sessions, isLoading, error, viewerRole, onRefetch }: Props) => {
  const displaySessions = useMemo(() => {
    // Show all sessions without status filtering as requested
    return sortSessionsForDisplay(sessions || []);
  }, [sessions]);

  const [attendanceSession, setAttendanceSession] = useState<Session | null>(null);
  const [finishingSession, setFinishingSession] = useState<Session | null>(null);

  const handleAttendanceOpen = (session: Session) => {
    setAttendanceSession(session);
  };

  const handleAttendanceClose = () => {
    setAttendanceSession(null);
  };

  const { colorMap } = useSubjectStore();

  return (
    <div className="session-container">
      <div className="session-container-header">
        <h2 className="main-title">Tus proximas sesiones</h2>
      </div>

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

        {!isLoading && !error && displaySessions.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            No tienes sesiones próximas agendadas.
          </p>
        )}
 
        {!isLoading && !error && sessions.map((session) => {
          const subjectName = typeof session.subject === 'string' ? session.subject : session.subject?.name;
          const colors = colorMap[subjectName] || { color: 'transparent', borderColor: 'transparent' };

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
                    <span 
                      className="tag-subject"
                      style={{ 
                        backgroundColor: colors.color, 
                        borderColor: colors.borderColor,
                        color: '#1a1a1a' // Ensure text is readable on light subject colors
                      }}
                    >
                      {subjectName}
                    </span>
                    <span className="tag-status">{session.status}</span>
                  </div>
                  <span className="time-label">
                    {formatDate(session.scheduledDate)} · {formatTime(session.startTime)}
                  </span>
                </div>
              </div>
  
              <div className="actions">
                <button
                  className="btn-details"
                  onClick={() => openDetail(session.id)}
                  aria-label={`Ver detalles de ${session.title}`}
                >
                  Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* <div className="bottom-overlay">
      </div> */}

      {attendanceSession && (
        <AttendancePostSession
          key={attendanceSession.id}
          session={attendanceSession}
          onClose={handleAttendanceClose}
          onRefetch={onRefetch}
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