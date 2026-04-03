// SessionDetailView.tsx — styled to match design

import './styles/SessionDetailView.css'
import compu from './icons/compu.svg'
import ubicacion from './icons/compu.svg'
import pin from './icons/Pin.svg'
import calendar from './icons/calendar-day.svg'
import time from './icons/timer.svg'
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
  
  // Aquí seleccionamos el objeto completo del import
  const iconAsset = (m.includes('virt') || !m.includes('pres')) 
    ? compu 
    : ubicacion;

  // Extraemos la URL. Si 'iconAsset' es un objeto, usamos .src
  // Si por alguna razón fuera ya un string, lo usamos directamente
  const src = typeof iconAsset === 'string' ? iconAsset : iconAsset.src;

  return (
    <a href={src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
      <img 
        src={src} 
        alt="Icono de modalidad" 
        style={{ width: '40px', height: '40px' }} 
      />
    </a>
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
    <div className='sdv-overlay'>
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
          <a href={time.src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
            <img 
              src={time.src} 
              alt="Icono de tiempo" 
              style={{ width: '40px', height: '40px' }} 
            />
          </a>
          <span className="sdv-card__label">
            {formatDuration(session.startTime, session.endTime)}
          </span>
        </div>

        <div className="sdv-card">
          <a href={calendar.src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
            <img 
              src={calendar.src} 
              alt="Icono de modalidad" 
              style={{ width: '40px', height: '40px' }} 
            />
          </a>
          <span className="sdv-card__label">
            {dateStr}
            <br/>
            <span className="sdv-card__sublabel">{timeStr}</span>
          </span>
        </div>

        <div className="sdv-card">
          <a href={pin.src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
            <img 
              src={pin.src} 
              alt="Icono de modalidad" 
              style={{ width: '40px', height: '40px' }} 
            />
          </a>
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
    </div>
    
  );
};

export default SessionDetailView;