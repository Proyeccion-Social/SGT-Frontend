// SessionDetailView.tsx — styled to match design
import { useRef, useState } from 'react';

import './styles/SessionDetailView.css'
import { UserRole } from '@/constants/roles';
import compu from './icons/compu.svg'
import ubicacion from './icons/compu.svg'
import pin from './icons/Pin.svg'
import calendar from './icons/calendar-day.svg'
import time from './icons/timer.svg'


import type { Session, ModifySessionBody, EditSessionBody, AvailabilitySlot } from '../types/session.types';
import { ProposeModificationForm } from './ProposeModificationView';
import { EditSessionForm } from './EditSessionView'

interface TutorInfo {
  id: string;
  name: string;
  photo?: string;
}
 
interface Props {
  session: Session;
  tutorInfo: TutorInfo | null;
  role: UserRole;
  isProposing?: boolean;
  isEditing?: boolean;
  availabilitySlots?: AvailabilitySlot[];
  onProposeModification: () => void;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onProposeSuccess: () => void;
  onEditSuccess: () => void;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
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
  const t = startTime.substring(0, 5);
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12  = h % 12 || 12;
  return `${day} de ${months[month - 1]}\n${h12}:${String(m).padStart(2,'0')}${ampm}`;
};
 
const modalityIcon = (modality: string) => {
  const mo = String(modality).toLowerCase();
  const iconAsset = (mo.includes('virt') || !mo.includes('pres')) ? compu : ubicacion;
  const src = typeof iconAsset === 'string' ? iconAsset : iconAsset.src;
  return (
    <a href={src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
      <img src={src} alt="Icono de modalidad" style={{ width: '40px', height: '40px' }} />
    </a>
  );
};
 
const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    PENDING_TUTOR_CONFIRMATION: 'Pendiente de confirmación',
    SCHEDULED:                  'Programada',
    PENDING_MODIFICATION:       'Modificación pendiente',
    REJECTED_BY_TUTOR:          'Rechazada por tutor',
    CANCELLED_BY_STUDENT:       'Cancelada por estudiante',
    CANCELLED_BY_TUTOR:         'Cancelada por tutor',
    CANCELLED_BY_ADMIN:         'Cancelada por administrador',
    COMPLETED:                  'Completada',
  };
  return map[status] ?? status;
};

const modalityLabel = (modality: string): string => {
  const map: Record<string, string> = {
    VIRT: 'Virtual',
    PRES: 'Presencial',
  };
  return map[String(modality).toUpperCase()] ?? modality;
};
 
const FallbackAvatar = ({ name }: { name: string }) => (
  <div className="sdv-avatar sdv-avatar--fallback">
    {name.charAt(0).toUpperCase()}
  </div>
);

const toProposeAvailabilitySlots = (
  slots: AvailabilitySlot[]
): { id: string; label: string }[] =>
  slots.map((slot) => {
    const slotData = slot as unknown as Record<string, unknown>;

    const id = String(slotData.id ?? slotData.slotId ?? '');
    const label = typeof slotData.label === 'string' ? slotData.label.trim() : '';

    const day =
      typeof slotData.day === 'string'
        ? slotData.day
        : typeof slotData.dayOfWeek === 'string'
          ? slotData.dayOfWeek
          : '';

    const start =
      typeof slotData.startTime === 'string'
        ? slotData.startTime
        : typeof slotData.start === 'string'
          ? slotData.start
          : '';

    const end =
      typeof slotData.endTime === 'string'
        ? slotData.endTime
        : typeof slotData.end === 'string'
          ? slotData.end
          : '';

    const generatedLabel = [day, start && end ? `${start} - ${end}` : start || end]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id,
      label: label || generatedLabel || id,
    };
  });
 
// ─── Component ────────────────────────────────────────────────────────────────
 
export const SessionDetailView = ({
  session,
  tutorInfo,
  role,
  isProposing = false,
  isEditing   = false,
  availabilitySlots = [],
  onProposeModification,
  onBack,
  onEdit,
  onCancel,
  onProposeSuccess,
  onEditSuccess,
  modificar,
  editar,
}: Props) => {
  const tutorName = tutorInfo?.name ?? session.tutor?.name ?? UserRole.TUTOR;
  const [dateStr, timeStr] = formatDate(session.scheduledDate, session.startTime).split('\n');
 
  const submitRef      = useRef<(() => Promise<void>) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const isAltView = isProposing || isEditing;
 
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
 
        {/* ── Tags ── */}
        <div className="sdv__tags">
          <span className="sdv-tag sdv-tag--subject">{String(session.subject.name)}</span>
          <span className="sdv-tag sdv-tag--tutor">
            <span className="sdv-tag__dot sdv-tag__dot--purple" />
            {tutorName}
          </span>
          <span className="sdv-tag sdv-tag--status">{statusLabel(String(session.status))}</span>
        </div>
 
        {/* ── Section title (only in alt views) ── */}
        {isAltView && (
          <p className="sdv__section-title">
            <span className="sdv__section-dot" />
            {isProposing ? 'Proponer modificación' : 'Editando...'}
          </p>
        )}
 
        {/* ── Cards / Propose form / Edit form ── */}
        {isProposing ? (
          <ProposeModificationForm
            session={session}
            availabilitySlots={toProposeAvailabilitySlots(availabilitySlots)}
            onSuccess={onProposeSuccess}
            onSubmittingChange={setIsSubmitting}
            triggerSubmitRef={submitRef}
            modificar={modificar}   // ← nuevo
          />
        ) : isEditing ? (
          <EditSessionForm
            session={session}
            onSuccess={onEditSuccess}
            onSubmittingChange={setIsSubmitting}
            triggerSubmitRef={submitRef}
            editar={editar}
          />
        ) : (
          <div className="sdv__cards">
 
            <div className="sdv-card">
              <div className="sdv-card__icon sdv-card__icon--blue">
                {modalityIcon(String(session.modality))}
              </div>
              <span className="sdv-card__label">
                {modalityLabel(String(session.modality))}
              </span>
            </div>
 
            <div className="sdv-card">
              <a href={time.src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                <img src={time.src} alt="Icono de tiempo" style={{ width: '40px', height: '40px' }} />
              </a>
              <span className="sdv-card__label">
                {formatDuration(session.startTime, session.endTime)}
              </span>
            </div>
 
            <div className="sdv-card">
              <a href={calendar.src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                <img src={calendar.src} alt="Icono de calendario" style={{ width: '40px', height: '40px' }} />
              </a>
              <span className="sdv-card__label">
                {dateStr}
                <br/>
                <span className="sdv-card__sublabel">{timeStr}</span>
              </span>
            </div>
 
            <div className="sdv-card">
              <a href={pin.src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                <img src={pin.src} alt="Icono de estado" style={{ width: '40px', height: '40px' }} />
              </a>
              <span className="sdv-card__label">{statusLabel(String(session.status))}</span>
            </div>
 
          </div>
        )}
 
        {/* ── Footer ── */}
        <div className="sdv__footer">
          {isAltView ? (
            <>
              <button
                className="sdv-btn sdv-btn--propose"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Volver
              </button>
              <button
                className="sdv-btn sdv-btn--edit"
                onClick={() => submitRef.current?.()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando…' : 'Confirmar'}
              </button>
            </>
          ) : (
            <>
              <button className="sdv-btn sdv-btn--propose" onClick={onProposeModification}>
                Proponer modificación
              </button>
              {role === UserRole.TUTOR && (
                <button className="sdv-btn sdv-btn--edit" onClick={onEdit}>
                  Editar
                </button>
              )}
              <button className="sdv-btn sdv-btn--cancel" onClick={onCancel}>
                Cancelar tutoría
              </button>
            </>
          )}
        </div>
 
      </div>

    </div>
  );
};
 
export default SessionDetailView;