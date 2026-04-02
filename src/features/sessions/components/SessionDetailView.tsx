// SessionDetailView.tsx
// T008: Read-only session info layout
// T009: Footer buttons wired to parent callbacks

import type { Session } from '../types/session.types';

interface TutorInfo {
  id: string;
  name: string;
  photo?: string;
}
 
interface Props {
  session: Session;
  tutorInfo: TutorInfo | null;
  role: 'tutor' | 'student';
  onProposeModification: () => void;
  onEdit: () => void;
  onCancel: () => void;
}
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
const formatDuration = (start: string, end: string): string => {
  // Expects "HH:MM" strings
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return `${start} – ${end}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0
    ? `${h}h${m > 0 ? ` ${m}min` : ''}`
    : `${m}min`;
};
 
const FallbackAvatar = ({ name }: { name: string }) => (
  <div className="tutor-avatar tutor-avatar--fallback" aria-label={`${name} avatar`}>
    {name.charAt(0).toUpperCase()}
  </div>
);
 
// ─── Component ────────────────────────────────────────────────────────────────
 
export const SessionDetailView = ({
  session,
  tutorInfo,
  role,
  onProposeModification,
  onEdit,
  onCancel,
}: Props) => {
  const tutorName = tutorInfo?.name ?? session.tutor.name;
 
  return (
    <div className="session-detail">
      {/* ── Top Section: Tutor photo + Title/Description ── */}
      <div className="session-detail__top">
        <div className="session-detail__tutor-photo">
          {tutorInfo?.photo ? (
            <img
              src={tutorInfo.photo}
              alt={`${tutorName} photo`}
              className="tutor-avatar"
            />
          ) : (
            <FallbackAvatar name={tutorName} />
          )}
        </div>
        <div className="session-detail__header-text">
          <h2 className="session-detail__title">{session.title}</h2>
          <p className="session-detail__description">{session.description}</p>
        </div>
      </div>
 
      {/* ── Middle Section: Subject + Tutor name ── */}
      <div className="session-detail__middle">
        <div className="session-detail__info-row">
          <span className="session-detail__label">Subject</span>
          <span className="session-detail__value">{String(session.subject)}</span>
        </div>
        <div className="session-detail__info-row">
          <span className="session-detail__label">Tutor</span>
          <span className="session-detail__value">{tutorName}</span>
        </div>
      </div>
 
      {/* ── Bottom Section: 4 Info Cards ── */}
      <div className="session-detail__info-cards">
        <div className="info-card">
          <span className="info-card__label">Modality</span>
          <span className="info-card__value">{session.modality}</span>
        </div>
        <div className="info-card">
          <span className="info-card__label">Duration</span>
          <span className="info-card__value">
            {formatDuration(session.startTime, session.endTime)}
          </span>
        </div>
        <div className="info-card">
          <span className="info-card__label">Date</span>
          <span className="info-card__value">{session.scheduledDate}</span>
        </div>
        <div className="info-card">
          <span className="info-card__label">Status</span>
          <span className={`info-card__value info-card__value--status info-card__value--${session.status}`}>
            {session.status}
          </span>
        </div>
      </div>
 
      {/* ── Footer: Action Buttons ── */}
      <div className="session-detail__footer">
        {/* T009: Propose Modification — both roles */}
        <button
          className="btn btn--green"
          onClick={onProposeModification}
        >
          Propose Modification
        </button>
 
        {/* T009: Edit — tutor only */}
        {role === 'tutor' && (
          <button
            className="btn btn--purple"
            onClick={onEdit}
          >
            Edit
          </button>
        )}
 
        {/* T009: Cancel — both roles, triggers CancelSessionModal */}
        <button
          className="btn btn--red"
          onClick={onCancel}
        >
          Cancel Session
        </button>
      </div>
    </div>
  );
};
 
export default SessionDetailView;