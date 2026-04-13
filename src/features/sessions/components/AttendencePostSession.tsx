import "@/features/sessions/styles/AttendancePostSession.css";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@/features/sessions/images/CloseIcon.svg";
import { UserRole } from "@/constants/roles";
import type {
  AttendanceStatus,
  AttendanceRecord,
  Session,
  SessionParticipant,
} from "@/features/sessions/types/session.types";

type Props = {
  session: Session;
  onClose?: () => void;
};

/** Participantes a los que aplica registro de asistencia (excluye tutor en la lista). */
function participantsForAttendance(session: Session): SessionParticipant[] {
  return session.participants.filter(
    (p) => p.role?.toUpperCase() !== UserRole.TUTOR
  );
}

type AttendanceMap = Record<string, AttendanceStatus>;

export default function AttendencePostSession({ session, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [attendances, setAttendances] = useState<AttendanceMap>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = participantsForAttendance(session);

  const handleAttendanceClose = () => {
    if (isSaving) return;
    setIsOpen(false);
    onClose?.();
  };

  const toggleAttendance = (participantId: string) => {
    setAttendances(prev => {
      const current = prev[participantId];
      // Alterna entre ATTENDED y ABSENT (por defecto ABSENT si no existe)
      const next: AttendanceStatus =
        current === "ATTENDED" ? "ABSENT" : "ATTENDED";
      return { ...prev, [participantId]: next };
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      setError(null);

      const records: AttendanceRecord[] = rows.map((p) => ({
        studentId: p.id,
        status: attendances[p.id] ?? "ABSENT",
      }));

      const payload = {
        attendances: records,
        tutorId: session.tutor.id
      };

      const res = await fetch(
        `/api/sessions/attendance?sessionId=${encodeURIComponent(session.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }

      handleAttendanceClose();
    } catch (e: any) {
      setError(e?.message ?? "Error al registrar asistencia");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="attendance-overlay" aria-hidden />
      <div
        className="attendance-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-dialog-title"
      >
        <Button className="attendance-close" onClick={handleAttendanceClose}>
          <img src={CloseIcon.src} alt="Cerrar" />
        </Button>
        <div className="attendance-session-meta">
          <p className="attendance-session-title">{session.title}</p>
          <p className="attendance-session-subject">{session.subject?.name}</p>
        </div>
        <div className="attendance-header" id="attendance-dialog-title">
          <h6>Nombre</h6>
          <h6>Asistió</h6>
        </div>
        <div className="attendance-content">
          <div className="attendance-content-item">
            {rows.length === 0 ? (
              <p className="attendance-empty">
                No hay participantes para registrar asistencia en esta sesión.
              </p>
            ) : (
              rows.map((participant) => (
                <div
                  className="attendance-content-item-name"
                  key={participant.id}
                >
                  <p>{participant.name}</p>
                  <input
                    className="attendance-checkbox"
                    type="checkbox"
                    checked={attendances[participant.id] === "ATTENDED"}
                    onChange={() => toggleAttendance(participant.id)}
                    aria-label={`Asistió ${participant.name}`}
                  />
                </div>
              ))
            )}
          </div>
          {error && (
            <p className="attendance-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="attendance-footer">
          <Button
            className="attendance-button"
            variant="default"
            onClick={handleSave}
            disabled={isSaving || rows.length === 0}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
