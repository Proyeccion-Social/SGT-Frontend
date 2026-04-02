// SessionDetailView.tsx — styled to match design

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
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return `${start} – ${end}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h} hora${h > 1 ? 's' : ''}${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
};

const formatDate = (date: string, startTime: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const time = startTime.substring(0, 5);
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${day} de ${months[month - 1]}\n${h12}:${String(m).padStart(2,'0')}${ampm}`;
};

const modalityIcon = (modality: string) => {
  const m = String(modality).toLowerCase();
  if (m.includes('virtual') || m.includes('pres') === false) {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="14" rx="2"/>
        <path d="M8 20h8M12 18v2"/>
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    CONFIRMED: 'Confirmada',
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelada',
    CLOSED: 'Cerrada',
    IN_PROGRESS: 'En curso',
  };
  return map[status] ?? status;
};

const FallbackAvatar = ({ name }: { name: string }) => (
  <div className="sdv-avatar sdv-avatar--fallback">
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
  const tutorName = tutorInfo?.name ?? session.tutor?.name ?? 'Tutor';
  const [dateStr, timeStr] = formatDate(session.scheduledDate, session.startTime).split('\n');

  return (
    <div className="sdv">

      {/* ── Top: photo + title + description ── */}
      <div className="sdv__top">
        {tutorInfo?.photo ? (
          <img src={tutorInfo.photo} alt={tutorName} className="sdv-avatar" />
        ) : (
          <FallbackAvatar name={tutorName} />
        )}
        <div className="sdv__header-text">
          <h2 className="sdv__title">{session.title}</h2>
          <p className="sdv__description">{session.description}</p>
        </div>
      </div>

      {/* ── Tags row: subject, tutor, status, link ── */}
      <div className="sdv__tags">
        <span className="sdv-tag sdv-tag--subject">{String(session.subject)}</span>
        <span className="sdv-tag sdv-tag--tutor">
          <span className="sdv-tag__dot sdv-tag__dot--purple" />
          {tutorName}
        </span>
        <span className="sdv-tag sdv-tag--status">{statusLabel(String(session.status))}</span>
      </div>

      {/* ── 4 Info cards ── */}
      <div className="sdv__cards">

        <div className="sdv-card">
          <div className="sdv-card__icon sdv-card__icon--blue">
            {modalityIcon(String(session.modality))}
          </div>
          <span className="sdv-card__label">
            {String(session.modality).charAt(0).toUpperCase() + String(session.modality).slice(1).toLowerCase()}
          </span>
        </div>

        <div className="sdv-card">
          <div className="sdv-card__icon sdv-card__icon--purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <span className="sdv-card__label">
            {formatDuration(session.startTime, session.endTime)}
          </span>
        </div>

        <div className="sdv-card">
          <div className="sdv-card__icon sdv-card__icon--blue">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <span className="sdv-card__label">
            {dateStr}
            <br/>
            <span className="sdv-card__sublabel">{timeStr}</span>
          </span>
        </div>

        <div className="sdv-card">
          <div className="sdv-card__icon sdv-card__icon--purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <span className="sdv-card__label">{statusLabel(String(session.status))}</span>
        </div>

      </div>

      {/* ── Footer buttons ── */}
      <div className="sdv__footer">
        <button className="sdv-btn sdv-btn--propose" onClick={onProposeModification}>
          Proponer modificación
        </button>
        {role === 'tutor' && (
          <button className="sdv-btn sdv-btn--edit" onClick={onEdit}>
            Editar
          </button>
        )}
        <button className="sdv-btn sdv-btn--cancel" onClick={onCancel}>
          Cancelar tutoría
        </button>
      </div>

    </div>
  );
};

export default SessionDetailView;