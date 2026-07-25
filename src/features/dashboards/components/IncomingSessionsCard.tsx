// IncomingSessionsCard.tsx
// Renders sessions fetched by DashboardSessionManager via useSessions
// Option B: Detalles button dispatches CustomEvent 'open-detail' to document

import { useMemo, useState } from 'react';
import '../styles/IncomingSessionsCard.css';
import type { Session } from '../../sessions/types/session.types';
import calendarIcon from '../assets/calendar.svg';
import clockIcon from '../assets/clock.svg';
import virtualIcon from '../assets/virtual.svg';
import presencialIcon from '../assets/presencial.svg';
import AttendancePostSession from '@features/sessions/components/AttendancePostSession';
import FinishSession from '@/features/sessions/components/FinishSession';
import { UserRole } from '@/constants/roles';
import { sessionPhase, getSessionTimePhase, formatTime, formatDate, type SessionTimePhase, sortSessionsForDisplay } from '../utils/incomingSessionsUtils';
import { useSubjectStore } from '@/store/subjectStore';
import { CloudinaryImage } from '@/components/CloudinaryImage';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');

const formatDuration = (hours: number) =>
  hours < 1 ? `${Math.round(hours * 60)}min` : `${hours}h`;

const formatModality = (modality: string) =>
  modality === 'VIRT' ? 'Virtual' : modality === 'PRES' ? 'Presencial' : '';

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
          <p style={{ color: '#8a2b2b', fontSize: 14 }}>{error}</p>
        )}

        {!isLoading && !error && displaySessions.length === 0 && (
          <p style={{ color: 'rgba(100, 80, 160, 0.7)', fontSize: 14 }}>
            No tienes sesiones próximas agendadas.
          </p>
        )}
 
        {!isLoading && !error && displaySessions.map((session) => {
          const subjectName = typeof session.subject === 'string' ? session.subject : session.subject?.name;
          const colors = colorMap[subjectName] || { color: 'transparent', borderColor: 'transparent' };
          const phase = getSessionTimePhase(session.scheduledDate, session.startTime, session.endTime);
          const isTutor = viewerRole === UserRole.TUTOR;

          const personName = isTutor
            ? (session.participants.find(p => p.role.toUpperCase() !== 'TUTOR')?.name ?? 'Estudiante')
            : session.tutor.name;
          const initials = getInitials(personName);
          const personPhoto = !isTutor ? session.tutor.photo : undefined;

          const avatarBg = 'var(--primary-100)';
          const avatarColor = 'var(--primary-600)';

          const handleCardClick = () => {
            if (phase === 'in_progress' && isTutor) setFinishingSession(session);
            else if (phase === 'ended' && isTutor) handleAttendanceOpen(session);
            else openDetail(session.id);
          };

          return (
            <div
              key={session.id}
              className="session-card"
              onClick={handleCardClick}
              role="button"
              tabIndex={0}
              aria-label={`Sesión: ${session.title}`}
            >
              <div className="card-avatar" style={{ background: avatarBg, color: avatarColor }}>
                {initials}
                {personPhoto && (
                  <CloudinaryImage
                    src={personPhoto}
                    size="avatarSm"
                    alt={personName}
                    className="card-avatar-img"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="card-body">
                <div className="card-top">
                  <span className="card-title">{session.title}</span>
                  <span className={`tag-status ${phase}`}>{sessionPhase[phase]}</span>
                </div>
                <p className="card-person">{personName}</p>
                <div className="card-meta">
                  <div className="meta-item">
                    <img src={calendarIcon.src} className="meta-icon" alt="" />
                    <span>
                      {formatDate(session.scheduledDate)}, { }
                      {formatTime(session.startTime)}
                    </span>
                  </div>
                  {session.duration > 0 && (
                    <div className="meta-item">
                      <img src={clockIcon.src} className="meta-icon meta-icon--dark" alt="" />
                      <span>
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  )}
                  {session.modality && (
                    <div className="meta-item">
                      <img
                        src={session.modality === 'VIRT' ? virtualIcon.src : presencialIcon.src}
                        className="meta-icon"
                        alt=""
                      />
                      <span>
                        {formatModality(session.modality)}
                      </span>
                    </div>
                  )}
                </div>
                {((phase === 'in_progress' && isTutor) || phase === 'ended') && (
                  <div className="card-action">
                    {phase === 'in_progress' && isTutor && (
                      <button
                        type="button"
                        className="btn-terminar"
                        aria-label={`Terminar sesión ${session.title}`}
                        onClick={e => { e.stopPropagation(); setFinishingSession(session); }}
                      >
                        Terminar
                      </button>
                    )}
                    {phase === 'ended' && isTutor && (
                      <button
                        type="button"
                        className="btn-asistencia"
                        aria-label={`Asistencia de ${session.title}`}
                        onClick={e => { e.stopPropagation(); handleAttendanceOpen(session); }}
                      >
                        Asistencia
                      </button>
                    )}
                    {phase === 'ended' && !isTutor && (
                      <button
                        type="button"
                        className="btn-calificar"
                        aria-label={`Calificar sesión ${session.title}`}
                        onClick={e => e.stopPropagation()}
                      >
                        Calificar
                      </button>
                    )}
                  </div>
                )}
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