import "@/features/sessions/styles/AttendancePostSession.css";
import "@/features/sessions/components/styles/SessionDetailModal.css";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { UserRole } from "@/constants/roles";
import { sileo } from "sileo";
import ToasterReact from "@/components/ui/ToasterReact";
import { useSessionDetail } from "../hooks/useSessionDetail";
import type {
    AttendanceStatus,
    AttendanceRecord,
    Session,
    SessionParticipant,
    AttendanceAndCompleteResult,
} from "@/features/sessions/types/session.types";

type Props = {
    session: Session;
    onClose?: () => void;
    onRefetch?: () => void;
};

/** Participantes a los que aplica registro de asistencia (excluye tutor y cancelados). */
function participantsForAttendance(session: Session): SessionParticipant[] {
    return session.participants.filter(
        (p) =>
            p.role?.toUpperCase() !== UserRole.TUTOR &&
            String(p.status).toUpperCase() !== "CANCELLED"
    );
}

type AttendanceMap = Record<string, AttendanceStatus | undefined>;
type ArrivalMap = Record<string, string>;

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: "ATTENDED", label: "Asistió" },
    { value: "LATE", label: "Tarde" },
    { value: "ABSENT", label: "Ausente" },
];

function toIsoArrival(timeHHmm: string, scheduledDate: string): string {
    // timeHHmm = "HH:mm" → ISO con la fecha de la sesión (hora local del cliente)
    const [h, m] = timeHHmm.split(":").map(Number);
    const d = new Date(`${scheduledDate}T00:00:00`);
    d.setHours(h || 0, m || 0, 0, 0);
    return d.toISOString();
}

export default function AttendancePostSession({
    session: initialSession,
    onClose,
    onRefetch,
}: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const [attendances, setAttendances] = useState<AttendanceMap>({});
    const [arrivalTimes, setArrivalTimes] = useState<ArrivalMap>({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmAbsent, setConfirmAbsent] = useState(false);

    const {
        session: fullSession,
        isLoading: isLoadingDetail,
        error: detailError,
    } = useSessionDetail(initialSession.id);

    const currentSession = fullSession ?? initialSession;

    const rows = useMemo(
        () => participantsForAttendance(currentSession),
        [currentSession]
    );

    const unresolvedCount = useMemo(
        () => rows.filter((p) => !attendances[p.id]).length,
        [rows, attendances]
    );

    const handleAttendanceClose = () => {
        if (isSaving) return;
        setIsOpen(false);
        onClose?.();
    };

    const setStatus = (participantId: string, status: AttendanceStatus) => {
        setAttendances((prev) => ({ ...prev, [participantId]: status }));
        if (status !== "LATE") {
            setArrivalTimes((prev) => {
                const next = { ...prev };
                delete next[participantId];
                return next;
            });
        }
        setConfirmAbsent(false);
        setError(null);
    };

    const setArrival = (participantId: string, time: string) => {
        setArrivalTimes((prev) => ({ ...prev, [participantId]: time }));
        setError(null);
    };

    const buildRecords = (): AttendanceRecord[] | null => {
        const records: AttendanceRecord[] = [];

        for (const p of rows) {
            const status = attendances[p.id] ?? "ABSENT";
            const record: AttendanceRecord = {
                studentId: p.id,
                status,
            };

            if (status === "LATE") {
                const time = arrivalTimes[p.id];
                if (!time) {
                    setError(
                        `Indica la hora de llegada de ${p.name} (estado Tarde).`
                    );
                    return null;
                }
                record.arrivalTime = toIsoArrival(
                    time,
                    currentSession.scheduledDate
                );
            }

            records.push(record);
        }

        return records;
    };

    const handleSave = async () => {
        if (isSaving || isLoadingDetail || rows.length === 0) return;

        if (unresolvedCount > 0 && !confirmAbsent) {
            setConfirmAbsent(true);
            setError(
                `${unresolvedCount} participante(s) sin marcar quedarán como Ausente. Confirma de nuevo para continuar.`
            );
            return;
        }

        const records = buildRecords();
        if (!records) return;

        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/sessions/attendance?sessionId=${encodeURIComponent(currentSession.id)}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ attendances: records }),
                }
            );

            const data = (await res.json().catch(() => ({}))) as
                | AttendanceAndCompleteResult
                | { errorCode?: string; message?: string };

            if (!res.ok) {
                const msg =
                    ("message" in data && data.message) ||
                    "Error al registrar asistencia";
                setError(msg);
                sileo.error({
                    title: "Error en el registro",
                    description: msg,
                    fill: "#f35761",
                });
                return;
            }

            const result = data as AttendanceAndCompleteResult;

            if (onRefetch) onRefetch();
            handleAttendanceClose();

            if (result.completionError) {
                sileo.error({
                    title: "Asistencia guardada",
                    description:
                        result.completionError.message ||
                        "No se pudo completar la sesión. Intenta de nuevo más tarde.",
                    fill: "#f59e0b",
                });
            } else {
                sileo.success({
                    title: "Sesión completada",
                    description:
                        "Asistencia registrada y sesión marcada como completada.",
                    fill: "#58d68d",
                });
            }
        } catch (e: unknown) {
            const msg =
                e instanceof Error
                    ? e.message
                    : "Error al registrar asistencia";
            setError(msg);
            sileo.error({
                title: "Error en el registro",
                description: msg,
                fill: "#f35761",
            });
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
            <ToasterReact isLocal />
            <div
                className="attendance-overlay"
                onClick={handleAttendanceClose}
            />
            <div
                className="attendance-container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="attendance-dialog-title"
            >
                <button
                    type="button"
                    className="modal-card__close"
                    onClick={handleAttendanceClose}
                    aria-label="Cerrar"
                >
                    ✕
                </button>
                <div className="attendance-session-meta">
                    <p className="attendance-session-title">
                        {currentSession.title}
                    </p>
                    <p className="attendance-session-subject">
                        {currentSession.subject?.name}
                    </p>
                </div>
                <div className="attendance-header" id="attendance-dialog-title">
                    <h6>Nombre</h6>
                    <h6>Asistencia</h6>
                </div>
                <div className="attendance-content">
                    {isLoadingDetail ? (
                        <div className="attendance-loading">
                            <p>Cargando lista de estudiantes…</p>
                        </div>
                    ) : detailError ? (
                        <p className="attendance-error" role="alert">
                            Error al cargar detalles de la sesión
                        </p>
                    ) : (
                        <div className="attendance-content-item">
                            {rows.length === 0 ? (
                                <p className="attendance-empty">
                                    No hay participantes para registrar
                                    asistencia en esta sesión.
                                </p>
                            ) : (
                                rows.map((participant) => {
                                    const status = attendances[participant.id];
                                    return (
                                        <div
                                            className="attendance-content-item-name"
                                            key={participant.id}
                                        >
                                            <p>{participant.name}</p>
                                            <div className="attendance-status-controls">
                                                <div
                                                    className="attendance-status-group"
                                                    role="radiogroup"
                                                    aria-label={`Asistencia de ${participant.name}`}
                                                >
                                                    {STATUS_OPTIONS.map(
                                                        (opt) => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                className={`attendance-status-btn${
                                                                    status ===
                                                                    opt.value
                                                                        ? " attendance-status-btn--active"
                                                                        : ""
                                                                }${
                                                                    opt.value ===
                                                                    "LATE"
                                                                        ? " attendance-status-btn--late"
                                                                        : ""
                                                                }${
                                                                    opt.value ===
                                                                    "ABSENT"
                                                                        ? " attendance-status-btn--absent"
                                                                        : ""
                                                                }`}
                                                                aria-pressed={
                                                                    status ===
                                                                    opt.value
                                                                }
                                                                onClick={() =>
                                                                    setStatus(
                                                                        participant.id,
                                                                        opt.value
                                                                    )
                                                                }
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                                {status === "LATE" && (
                                                    <label className="attendance-arrival">
                                                        <span>Hora de llegada</span>
                                                        <input
                                                            type="time"
                                                            className="attendance-arrival-input"
                                                            value={
                                                                arrivalTimes[
                                                                    participant
                                                                        .id
                                                                ] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                setArrival(
                                                                    participant.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                            aria-label={`Hora de llegada de ${participant.name}`}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
                <div className="attendance-footer">
                    <p className="attendance-error" role="alert">
                        { error && (error)}
                    </p>
                    <Button
                        className="attendance-button"
                        variant="default"
                        onClick={handleSave}
                        disabled={
                            isSaving || isLoadingDetail || rows.length === 0
                        }
                    >
                        {isSaving
                            ? "Guardando…"
                            : confirmAbsent
                              ? "Confirmar y guardar"
                              : "Guardar"}
                    </Button>
                </div>
            </div>
        </>,
        document.body
    );
}
