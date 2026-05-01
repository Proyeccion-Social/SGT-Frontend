import "@/features/sessions/styles/AttendancePostSession.css";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@/features/sessions/images/CloseIcon.svg";
import { UserRole } from "@/constants/roles";
import { registerAttendance } from "@/features/sessions/services/sessionService";
import { sileo } from "sileo";
import ToasterReact from "@/components/ui/ToasterReact";
import { useSessionDetail } from "../hooks/useSessionDetail";
import type {
    AttendanceStatus,
    AttendanceRecord,
    Session,
    SessionParticipant,
} from "@/features/sessions/types/session.types";

type Props = {
    session: Session;
    onClose?: () => void;
    onRefetch?: () => void;
};

/** Participantes a los que aplica registro de asistencia (excluye tutor en la lista). */
function participantsForAttendance(session: Session): SessionParticipant[] {
    return session.participants.filter(
        (p) => p.role?.toUpperCase() !== UserRole.TUTOR
    );
}

type AttendanceMap = Record<string, AttendanceStatus>;

export default function AttendancePostSession({ session: initialSession, onClose, onRefetch }: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const [attendances, setAttendances] = useState<AttendanceMap>({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch full session details to get real participant IDs and the complete list
    const { session: fullSession, isLoading: isLoadingDetail, error: detailError } = useSessionDetail(initialSession.id);

    // Use fullSession if available, otherwise fallback to initialSession (which might be incomplete)
    const currentSession = fullSession ?? initialSession;

    const rows = useMemo(() => {
        return participantsForAttendance(currentSession);
    }, [currentSession]);

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
        
        const records: AttendanceRecord[] = rows.map((p) => ({
            studentId: p.id,
            status: attendances[p.id] ?? "ABSENT",
        }));

        await sileo.promise(
            async () => {
                setIsSaving(true);
                setError(null);
                
                await registerAttendance(currentSession.id, {
                    attendances: records,
                    tutorId: currentSession.tutor.id
                });

                if (onRefetch) onRefetch();
                handleAttendanceClose();
            },
            {
                loading: { title: "Registrando asistencia...", fill: "#8751ff" },
                success: { title: "Asistencia registrada", description: "Recargando sesiones...", fill: "#58d68d" },
                error: { title: "Error en el registro", fill: "#f35761" },
            }
        ).catch((e: any) => {
            setError(e?.message ?? "Error al registrar asistencia");
        }).finally(() => {
            setIsSaving(false);
        });
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
            <ToasterReact isLocal />
            <div className="attendance-overlay" onClick={handleAttendanceClose}></div>
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
                    <p className="attendance-session-title">{currentSession.title}</p>
                    <p className="attendance-session-subject">{currentSession.subject?.name}</p>
                </div>
                <div className="attendance-header" id="attendance-dialog-title">
                    <h6>Nombre</h6>
                    <h6>Asistió</h6>
                </div>
                <div className="attendance-content">
                    {isLoadingDetail ? (
                        <div className="attendance-loading">
                            <p>Cargando lista de estudiantes...</p>
                        </div>
                    ) : detailError ? (
                        <p className="attendance-error" role="alert">
                            Error al cargar detalles de la sesión
                        </p>
                    ) : (
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
                    )}
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
                        disabled={isSaving || isLoadingDetail || rows.length === 0}
                    >
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </div>
        </>,
        document.body
    );
}

