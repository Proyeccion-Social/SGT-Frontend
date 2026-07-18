// IncomingSessionsCard.tsx
// Renders sessions fetched by DashboardSessionManager via useSessions
// Option B: Detalles button dispatches CustomEvent 'open-detail' to document

import { useMemo, useState } from 'react';
import '../styles/IncomingSessionsCard.css';
import type { Session, SessionStatus } from '../../sessions/types/session.types';
import AttendancePostSession from '@features/sessions/components/AttendancePostSession';
import FinishSession from '@/features/sessions/components/FinishSession';
import { UserRole } from '@/constants/roles';
import { getSessionTimePhase, formatDate, sortSessionsForDisplay } from '../utils/incomingSessionsUtils';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');

/**
 * Estados que se muestran en la tarjeta de próximas sesiones, con su etiqueta y clase de color (D1/D2).
 * El tag pasó de mostrar el tiempo restante a mostrar el estado de la sesión.
 * Un estado ausente de este mapa no se renderiza (y su sesión se filtra vía `isVisibleInCard`).
 */
const STATUS_TAG: Partial<Record<SessionStatus, { label: string; cls: string }>> = {
  SCHEDULED:                  { label: 'Programada',                cls: 'scheduled' },
  COMPLETED:                  { label: 'Completada',                cls: 'completed' },
  PENDING_TUTOR_CONFIRMATION: { label: 'Pendiente de confirmación', cls: 'pending'   },
  PENDING_MODIFICATION:       { label: 'Modificación pendiente',    cls: 'pending'   },
};

/** ¿La sesión aparece en la tarjeta? Solo los estados de `STATUS_TAG`; COMPLETED únicamente para tutores. */
const isVisibleInCard = (status: SessionStatus, isTutor: boolean): boolean =>
  status === 'COMPLETED' ? isTutor : status in STATUS_TAG;

/** Timestamp ambiental (esquina inferior derecha), ej. "Hoy 3:00 PM". */
const formatAmbientTimestamp = (scheduledDate: string, startTime: string): string => {
  const [h, m] = startTime.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const timeLabel = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, mo, d] = scheduledDate.split('-').map(Number);
  const target = new Date(y, mo - 1, d);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  const dayLabel = diffDays === 0 ? 'Hoy' : diffDays === 1 ? 'Mañana' : formatDate(scheduledDate);
  return `${dayLabel} ${timeLabel}`;
};

/** Individual → "Cerrada", grupal → "Abierta" (ver session.types SessionType). */
const sessionTypeLabel = (type?: 'INDIVIDUAL' | 'GROUP'): string | null =>
  type === 'INDIVIDUAL' ? 'Cerrada' : type === 'GROUP' ? 'Abierta' : null;

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
  const isTutor = viewerRole === UserRole.TUTOR;

  const displaySessions = useMemo(() => {
    // D2: solo se muestran SCHEDULED / PENDING_* (todos los roles) y COMPLETED (solo tutor).
    // Canceladas, rechazada y expirada quedan fuera de la tarjeta de próximas sesiones.
    const visible = (sessions || []).filter((s) => isVisibleInCard(s.status, isTutor));
    return sortSessionsForDisplay(visible);
  }, [sessions, isTutor]);

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
          const statusTag = STATUS_TAG[session.status];

          const personName = isTutor
            ? (session.participants.find(p => p.role.toUpperCase() !== 'TUTOR')?.name ?? 'Estudiante')
            : session.tutor.name;
          const initials = getInitials(personName);
          const personPhoto = !isTutor ? session.tutor.photo : undefined;
          const typeLabel = sessionTypeLabel(session.sessionType);

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
                  <img
                    src={personPhoto}
                    alt={personName}
                    className="card-avatar-img"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="card-body">
                <div className="card-top">
                  <span className="card-title">{session.title}</span>
                  {statusTag && (
                    <span className={`tag-status ${statusTag.cls}`}>{statusTag.label}</span>
                  )}
                </div>
                <p className="card-person">{personName}</p>
                <div className="card-tags-row">
                  <div className="card-tags">
                    {subjectName && (
                      <span
                        className="card-badge card-badge--subject"
                        style={
                          colors.color !== 'transparent'
                            ? { backgroundColor: colors.color, borderColor: colors.borderColor }
                            : undefined
                        }
                      >
                        {subjectName}
                      </span>
                    )}
                    {typeLabel && (
                      <span className="card-badge card-badge--type">{typeLabel}</span>
                    )}
                  </div>
                  <span className="card-timestamp">
                    {formatAmbientTimestamp(session.scheduledDate, session.startTime)}
                  </span>
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