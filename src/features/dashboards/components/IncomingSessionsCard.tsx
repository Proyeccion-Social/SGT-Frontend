// IncomingSessionsCard.tsx
// Renderiza las tarjetas en cliente (React) para poder consumir useSessions
// Option B se mantiene: el botón Detalles despacha CustomEvent hacia DashboardSessionManager

import '../styles/IncomingSessionsCard.css'
import type { Session } from '../..//sessions/types/session.types';

interface Props {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
}
 
const openDetail = (sessionId: string) => {
  document.dispatchEvent(
    new CustomEvent('open-detail', { detail: { sessionId } })
  );
};
 
const formatTime = (time: string) =>
  time.substring(0, 5); // "HH:mm:ss" → "HH:mm"
 
const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const getTimeLeft = (scheduledDate: string, startTime: string): string => {
  const sessionDate = new Date(`${scheduledDate}T${startTime}`);
  const now = new Date();
  const diffMs = sessionDate.getTime() - now.getTime();
  if (diffMs <= 0) return 'En curso';
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (diffDays > 0) return `En ${diffDays}d ${diffHours}h`;
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) return `En ${diffHours}h ${diffMins}min`;
  return `En ${diffMins}min`;
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
 
export const IncomingSessionsCard = ({ sessions, isLoading, error }: Props) => {
  return (
    <div className="session-container">
      <h2 className="main-title">Upcoming Sessions</h2>
 
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
 
        {!isLoading && !error && sessions.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            No tienes sesiones próximas agendadas.
          </p>
        )}
 
        {!isLoading && !error && sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="card-content">
              <div className="card-header">
                <span>{session.title}</span>
                <span className="badge-time">
                  {getTimeLeft(session.scheduledDate, session.startTime)}
                </span>
              </div>
 
              <p className="description">{session.description}</p>
 
              <div className="card-footer">
                <div className="tags">
                  <span className="tag-subject">{String(session.subject)}</span>
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
        ))}
      </div>
 
      <div className="bottom-overlay">
        <span className="view-more">Ver más</span>
      </div>
    </div>
  );
};
 
export default IncomingSessionsCard;

