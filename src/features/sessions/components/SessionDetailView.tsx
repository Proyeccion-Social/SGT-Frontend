// SessionDetailView.tsx — styled to match design
import { useRef, useState } from 'react';
import { sileo } from 'sileo';

import './styles/SessionDetailView.css'
import { UserRole } from '@/constants/roles';
import compu from './icons/compu.svg'
import ubicacion from './icons/compu.svg'
import pin from './icons/Pin.svg'
import calendar from './icons/calendar-day.svg'
import time from './icons/timer.svg'
import { useSubjectStore } from '@/store/subjectStore';
import { useAuthStore } from '@/store/authStore';


import type { Session, ModifySessionBody, EditSessionBody, AvailabilitySlot } from '../types/session.types';
import { ProposeModificationForm } from './ProposeModificationView';
import { EditSessionForm } from './EditSessionView';
import { PendingModificationView } from './PendingModificationView';
import {
  canProposeModification,
  canCancelSession,
  getSessionDisplayStatus,
  getSessionTimePhase,
} from '../utils/sessionStatus';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { statusLabel } from '../utils/statusLabel';

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
  /** true mientras se carga la disponibilidad del tutor (vista de proponer). */
  slotsLoading?: boolean;
  onClose: () => void;
  onProposeModification: () => void;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onProposeSuccess: () => void;
  onEditSuccess: () => void;
  onConfirm: () => Promise<void>;
  onRequestReject: () => void;
  onAcceptModification: () => Promise<void>;
  onRejectModification: () => Promise<void>;
  onEvaluate?: () => void;
  /** Tutor: abrir registro de asistencia (sesión en curso o finalizada). */
  onMarkAttendance?: () => void;
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
    <img src={src} alt="Icono de modalidad" style={{ width: '40px', height: '40px' }} />
  );
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

// ─── Component ────────────────────────────────────────────────────────────────
 
export const SessionDetailView = ({
  session,
  tutorInfo,
  role,
  isProposing = false,
  isEditing   = false,
  availabilitySlots = [],
  slotsLoading = false,
  onClose,
  onProposeModification,
  onBack,
  onEdit,
  onCancel,
  onProposeSuccess,
  onEditSuccess,
  onConfirm,
  onRequestReject,
  onAcceptModification,
  onRejectModification,
  onEvaluate,
  onMarkAttendance,
  modificar,
  editar,
}: Props) => {
  const tutorName = tutorInfo?.name ?? session.tutor?.name ?? UserRole.TUTOR;
  const [dateStr, timeStr] = formatDate(session.scheduledDate, session.startTime).split('\n');
  const { colorMap } = useSubjectStore();
  const subjectColors = colorMap[String(session.subject.name)];
  const { user: currentUser } = useAuthStore();
 
  const submitRef      = useRef<(() => Promise<void>) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming]         = useState(false);
  const [showCurrentState, setShowCurrentState] = useState(false);
  const [isModificationAction, setIsModificationAction] = useState(false);
  // SCHEDULING-42 — el formulario de propuesta reporta si hay al menos un cambio.
  const [isProposeValid, setIsProposeValid]     = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleAcceptModification = async () => {
    setIsModificationAction(true);
    await sileo.promise(
      async () => {
        await onAcceptModification();
      },
      {
        loading: { title: 'Aceptando modificación…' },
        success: { title: 'Modificación aceptada', description: 'La sesión ha sido actualizada.', fill: '#2ecc71' },
        error:   { title: 'Error al aceptar', fill: '#f35761' },
      }
    ).finally(() => setIsModificationAction(false));
  };

  const handleRejectModification = async () => {
    setIsModificationAction(true);
    await sileo.promise(
      async () => {
        await onRejectModification();
      },
      {
        loading: { title: 'Rechazando modificación…' },
        success: { title: 'Modificación rechazada', description: 'Se ha notificado al proponente.', fill: '#2ecc71' },
        error:   { title: 'Error al rechazar', fill: '#f35761' },
      }
    ).finally(() => setIsModificationAction(false));
  };

  const isAltView = isProposing || isEditing;
  const isPendingConfirmation = String(session.status) === 'PENDING_TUTOR_CONFIRMATION';
  const isPendingModification = String(session.status) === 'PENDING_MODIFICATION';
  const displayStatus = getSessionDisplayStatus(session);
  const proposeAvailability = canProposeModification(session);
  const cancelAvailability  = canCancelSession(session);
  const showConfirmRejectButtons = isPendingConfirmation && role === UserRole.TUTOR && !isAltView;
  const showModificationView    = isPendingModification && !isAltView;
  // SCHEDULING-49: el solicitante no puede responder su propia propuesta.
  // proposedBy puede venir como string, number u objeto { id }.
  const proposedByRaw = session.pendingModification?.proposedBy as unknown;
  const proposedById =
    proposedByRaw == null
      ? ''
      : typeof proposedByRaw === 'object'
        ? String((proposedByRaw as { id?: string }).id ?? '')
        : String(proposedByRaw);
  const currentUserId = String(currentUser?.id ?? '');
  const isProposer =
    !!proposedById && !!currentUserId && proposedById === currentUserId;
  // Si el backend no manda proposedBy, no ofrecer aceptar/rechazar al estudiante
  // (caso más común: el estudiante propuso). El tutor sí puede responder.
  const canRespondToModification =
    showModificationView &&
    !isProposer &&
    (proposedById ? true : role === UserRole.TUTOR);
  const timePhase = getSessionTimePhase(
    session.scheduledDate,
    session.startTime,
    session.endTime
  );
  const isTutorScheduled =
    !isAltView &&
    !showModificationView &&
    role === UserRole.TUTOR &&
    String(session.status) === 'SCHEDULED';
  // Antes de la hora: Editar. En curso o ya pasó la hora: Marcar asistencia.
  const showEditButton = isTutorScheduled && timePhase === 'upcoming';
  const showAttendanceButton =
    isTutorScheduled && timePhase !== 'upcoming' && !!onMarkAttendance;
  // Las reglas de negocio (canPropose/canCancel) ya excluyen estados terminales,
  // PENDING_MODIFICATION y sesiones en curso/terminadas.
  const showActionButtons =
    proposeAvailability.visible ||
    cancelAvailability.visible ||
    showEditButton ||
    showAttendanceButton;
  const showFooter =
    isAltView ||
    (showModificationView && canRespondToModification) ||
    showConfirmRejectButtons ||
    showActionButtons ||
    !!onEvaluate;
 
  return (
    <>
      <div className="sdv">
        <button className="modal-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
 
        {/* ── Top: photo + title + description ── */}
        <div className="sdv__top">
          {tutorInfo?.photo ? (
            <CloudinaryImage
              src={tutorInfo.photo}
              size="avatarMd"
              alt={tutorName}
              className="sdv-avatar"
              lazy={false}
            />
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
          <span
            className="sdv-tag sdv-tag--subject"
            style={subjectColors?.color && subjectColors.color !== 'transparent' ? { backgroundColor: subjectColors.color, borderColor: subjectColors.borderColor } : undefined}
          >{String(session.subject.name)}</span>
          <span className="sdv-tag sdv-tag--tutor">
            <span className="sdv-tag__dot sdv-tag__dot--purple" />
            {tutorName}
          </span>
          <span className="sdv-tag sdv-tag--status">{statusLabel(session.status)}</span>
          {session.virtualLink?.trim() && (
            <a
              className="sdv-tag sdv-tag--link"
              href={session.virtualLink}
              target="_blank"
              rel="noopener noreferrer"
              title={session.virtualLink}
              style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {session.virtualLink}
            </a>
          )}
          {session.location?.trim() && (
            <span
              className="sdv-tag sdv-tag--link"
              title={session.location}
              style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {session.location}
            </span>
          )}
        </div>
 
        {/* ── Section title ── */}
        {(isAltView || showModificationView) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p className="sdv__section-title" style={{ margin: 0 }}>
              <span className="sdv__section-dot" />
              {isProposing
                ? 'Proponer modificación'
                : isEditing
                  ? 'Editando...'
                  : 'Propuesta de modificación'}
            </p>
            {showModificationView && (
              <button
                type="button"
                onClick={() => setShowCurrentState((v) => !v)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  border: '1px solid #9F74FF',
                  background: showCurrentState ? '#9F74FF' : 'transparent',
                  color: showCurrentState ? '#fff' : '#9F74FF',
                }}
              >
                Ver estado actual
              </button>
            )}
          </div>
          {showModificationView && !canRespondToModification && (
            <p style={{ margin: 0, fontSize: 13, color: '#3c3c3c', fontStyle: 'italic' }}>
              {session.tutor?.id === currentUser?.id ? 'El estudiante' : 'El tutor'} está revisando tu propuesta de modificación.
            </p>
          )}
          </div>
        )}

        {/* ── Cards / Propose form / Edit form / Reject form ── */}
        {isProposing ? (
          <ProposeModificationForm
            session={session}
            availabilitySlots={availabilitySlots}
            slotsLoading={slotsLoading}
            onSuccess={onProposeSuccess}
            onSubmittingChange={setIsSubmitting}
            onValidityChange={setIsProposeValid}
            triggerSubmitRef={submitRef}
            modificar={modificar}
          />
        ) : isEditing ? (
          <EditSessionForm
            session={session}
            onSuccess={onEditSuccess}
            onSubmittingChange={setIsSubmitting}
            triggerSubmitRef={submitRef}
            editar={editar}
          />
        ) : showModificationView && !showCurrentState ? (
          <PendingModificationView
            session={session}
            modification={session.pendingModification ?? null}
          />
        ) : (
          <div className="sdv__cards">

            <div className="sdv-card">
              <div className="sdv-card__icon">
                {modalityIcon(String(session.modality))}
              </div>
              <span className="sdv-card__label">
                {modalityLabel(String(session.modality))}
              </span>
            </div>

            <div className="sdv-card">
              <img src={time.src} alt="Icono de tiempo" style={{ width: '40px', height: '40px' }} />
              <span className="sdv-card__label">
                {formatDuration(session.startTime, session.endTime)}
              </span>
            </div>

            <div className="sdv-card">
              <img src={calendar.src} alt="Icono de calendario" style={{ width: '40px', height: '40px' }} />
              <span className="sdv-card__label">
                {dateStr}
                <br/>
                <span className="sdv-card__sublabel">{timeStr}</span>
              </span>
            </div>

            <div className="sdv-card">
              <img src={pin.src} alt="Icono de estado" style={{ width: '40px', height: '40px' }} />
              <span className="sdv-card__label">{statusLabel(session.status)}</span>
            </div>

          </div>

          {role === UserRole.TUTOR && session.participants.length > 0 && (
            <div style={{
              background: 'rgba(243, 237, 255, 0.5)',
              border: '1px dashed var(--neutral-200)',
              borderRadius: 16,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contacto del estudiante
              </p>
              {session.participants.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-600)' }}>{p.name}</span>
                  {p.email && (
                    <a
                      href={`mailto:${p.email}`}
                      style={{ fontSize: 14, color: 'var(--primary-default)', textDecoration: 'none', wordBreak: 'break-all' }}
                    >
                      {p.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        )}
 
        {/* ── Footer ── */}
        {showFooter && (
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
                  disabled={isSubmitting || (isProposing && !isProposeValid)}
                >
                  {isSubmitting ? 'Guardando…' : 'Confirmar'}
                </button>
              </>
            ) : showModificationView && canRespondToModification ? (
              <>
                <button
                  className="sdv-btn sdv-btn--edit"
                  onClick={handleAcceptModification}
                  disabled={isModificationAction}
                >
                  {isModificationAction ? 'Procesando…' : 'Aceptar modificación'}
                </button>
                <button
                  className="sdv-btn sdv-btn--cancel"
                  onClick={handleRejectModification}
                  disabled={isModificationAction}
                >
                  Rechazar modificación
                </button>
              </>
            ) : showConfirmRejectButtons ? (
              <>
                <button
                  className="sdv-btn sdv-btn--edit"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                >
                  {isConfirming ? 'Aceptando…' : 'Aceptar tutoría'}
                </button>
                <button
                  className="sdv-btn sdv-btn--cancel"
                  onClick={onRequestReject}
                  disabled={isConfirming}
                >
                  Rechazar tutoría
                </button>
              </>
            ) : showActionButtons ? (
              <>
                {proposeAvailability.visible && (
                  <span
                    className="sdv-btn-tooltip"
                    data-tooltip={proposeAvailability.disabled ? proposeAvailability.reason : undefined}
                  >
                    <button
                      className="sdv-btn sdv-btn--propose"
                      onClick={onProposeModification}
                      disabled={proposeAvailability.disabled}
                    >
                      Proponer modificación
                    </button>
                  </span>
                )}
                {showEditButton && (
                  <button className="sdv-btn sdv-btn--edit" onClick={onEdit}>
                    Editar
                  </button>
                )}
                {showAttendanceButton && (
                  <button
                    className="sdv-btn sdv-btn--edit"
                    onClick={onMarkAttendance}
                  >
                    Marcar asistencia
                  </button>
                )}
                {cancelAvailability.visible && (
                  <span
                    className="sdv-btn-tooltip"
                    data-tooltip={cancelAvailability.disabled ? cancelAvailability.reason : undefined}
                  >
                    <button
                      className="sdv-btn sdv-btn--cancel"
                      onClick={onCancel}
                      disabled={cancelAvailability.disabled}
                    >
                      Cancelar tutoría
                    </button>
                  </span>
                )}
              </>
            ) : onEvaluate ? (
              <button className="sdv-btn sdv-btn--edit" onClick={onEvaluate}>
                Calificar Sesión
              </button>
            ) : null}
          </div>
        )}
 
      </div>
    </>
  );
};
 
export default SessionDetailView;