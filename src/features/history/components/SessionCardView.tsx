import { CloudinaryImage } from "@/components/CloudinaryImage";

import { statusLabel } from '@/features/sessions/utils/statusLabel';
import { canEvaluateSession } from '@/features/sessions/utils/canEvaluate';

interface SessionCardViewProps {
  session: any;
  userId: string;
  onClose: () => void;
  onEvaluate: () => void;
}

export default function SessionCardView({ session, userId, onClose, onEvaluate }: SessionCardViewProps) {
  const participant = session.participants?.find((p: any) => p.id === userId);
  const participantStatus = participant?.status;

  // --- Helpers para estado ---
  // El texto del enum lo da el helper compartido tipado; el override por ABSENT deriva de
  // participants (no del status) y se queda acá (reporte §4.3).
  function getStatusText() {
    if (participantStatus === "ABSENT") return "No asistió";
    return statusLabel(session.status);
  }

  function getStatusClass() {
    const s = session.status;
    if (participantStatus === "ABSENT") return "status-no_show";
    if (s === "CANCELLED_BY_STUDENT" || s === "CANCELLED_BY_TUTOR" || s === "CANCELLED_BY_ADMIN") return "status-cancelled";
    if (s === "COMPLETED") return "status-completed";
    if (s === "SCHEDULED") return "status-scheduled";
    return "";
  }

  const canEvaluate = canEvaluateSession(session, participant).canEvaluate;

  return (
    <div className="sc-card">
      <button className="sc-close-btn" onClick={onClose} type="button" aria-label="Cerrar">✕</button>

      <div className="sc-info">
        {/* Columna izquierda */}
        <div className="sc-col-left">
          {/* Estado */}
          <div className="sc-status-wrapper">
            <p className={`sc-status ${getStatusClass()}`}>{getStatusText()}</p>
          </div>

          {/* Fecha y hora */}
          <div className="sc-date-time">
            <p>{session.scheduledDate}<br />{session.startTime}</p>
            {session.status === "SCHEDULED" && (
              <>
                <hr />
                <p className="sc-countdown">Empieza en {session.timeUntilSession}</p>
              </>
            )}
          </div>

          {/* Duración */}
          <div className="sc-duration">
            <p><strong>Duración:</strong> {session.duration} h</p>
          </div>

          {/* Rating existente */}
          {session.status === "COMPLETED" && session.rating?.overall !== undefined && (
            <div className="sc-rating">
              <p><strong>Tu calificación:</strong> {session.rating.overall} ⭐</p>
            </div>
          )}

          {/* Botón calificar */}
          {canEvaluate && (
            <button className="sc-btn-eval" onClick={onEvaluate}>
              <strong>Calificar Sesión</strong>
            </button>
          )}
        </div>

        {/* Columna central */}
        <div className="sc-col-center">
          {session.title && <h3 className="sc-title">{session.title}</h3>}
          {session.description && (
            <p><strong>Descripcion:</strong> {session.description}</p>
          )}
          <p><strong>Materia:</strong> {session.subject?.name}{session.subject?.code && ` (${session.subject.code})`}</p>
          <p><strong>Modalidad:</strong> {session.modality}</p>
          {session.modality === "PRES" && session.location && (
            <p><strong>Ubicación:</strong> {session.location}</p>
          )}
          {session.modality === "VIRT" && session.virtualLink && (
            <p><strong>Enlace:</strong> {session.virtualLink}</p>
          )}
        </div>

        {/* Columna derecha - Tutor */}
        <div className="sc-col-tutor">
          <CloudinaryImage
            src={session.tutor?.photo}
            size="avatarXl"
            alt={session.tutor?.name ? `Tutor: ${session.tutor.name}` : "Tutor"}
            className="sc-avatar"
          />
          <p><strong>Tutor:</strong> {session.tutor?.name}</p>
        </div>
      </div>
    </div>
  );
}
