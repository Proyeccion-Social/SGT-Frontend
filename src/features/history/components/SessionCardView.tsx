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
  function getStatusText() {
    if (session.status === "CANCELLED") return "Cancelada";
    if (session.status === "CANCELLED_BY_STUDENT") return "Cancelada por el estudiante";
    if (session.status === "CANCELLED_BY_TUTOR") return "Cancelada por el tutor";
    if (participantStatus === "ABSENT") return "No asistió";
    if (session.status === "COMPLETED") return "Completada";
    if (session.status === "SCHEDULED") return "Programada";
    if (session.status === "PENDING_TUTOR_CONFIRMATION") return "Pendiente de confirmación por el tutor";
    if (session.status === "PENDING_STUDENT_CONFIRMATION") return "Pendiente de confirmación por el estudiante";
    return session.status;
  }

  function getStatusClass() {
    if (participantStatus === "ABSENT") return "status-no_show";
    if (["CANCELLED", "CANCELLED_BY_STUDENT", "CANCELLED_BY_TUTOR"].includes(session.status)) return "status-cancelled";
    if (session.status === "COMPLETED") return "status-completed";
    if (session.status === "SCHEDULED") return "status-scheduled";
    return "";
  }

  const canEvaluate = session.status === "COMPLETED" && participantStatus === "ATTENDED";

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
          <img
            src={session.tutor?.photo ?? "/default-avatar.png"}
            alt="Tutor"
            className="sc-avatar"
            loading="lazy"
          />
          <p><strong>Tutor:</strong> {session.tutor?.name}</p>
        </div>
      </div>
    </div>
  );
}
