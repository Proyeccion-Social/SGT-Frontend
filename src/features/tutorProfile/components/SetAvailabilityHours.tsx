import "../styles/SetAvailabilityHours.css";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────
interface TimeSlot {
    id: number;
    start: string;
    end: string;
}

interface DaySchedule {
    day: string;
    slots: TimeSlot[];
}

// ── Constants ──────────────────────────────────────────────────────────
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const MAX_HOURS_PER_DAY = 4;
const MAX_HOURS_PER_WEEK = 10;

let nextId = 1;

// ── Helpers ────────────────────────────────────────────────────────────
function parseHours(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h + (m || 0) / 60;
}

function slotDuration(slot: TimeSlot): number {
    if (!slot.start || !slot.end) return 0;
    const diff = parseHours(slot.end) - parseHours(slot.start);
    return diff > 0 ? diff : 0;
}

function dayTotal(slots: TimeSlot[]): number {
    return slots.reduce((acc, s) => acc + slotDuration(s), 0);
}

function weekTotal(schedule: DaySchedule[]): number {
    return schedule.reduce((acc, d) => acc + dayTotal(d.slots), 0);
}

function fmt(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

// ── Time options: 06:00 → 20:00, step 30 min ──────────────────────────
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 20; h++) {
    for (const m of [0, 30]) {
        if (h === 20 && m === 30) break; // 20:30 out of range
        TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
}

// ── Component ──────────────────────────────────────────────────────────
const DAY_MAP: Record<string, string> = {
    "Lunes": "MONDAY",
    "Martes": "TUESDAY",
    "Miércoles": "WEDNESDAY",
    "Jueves": "THURSDAY",
    "Viernes": "FRIDAY",
    "Sábado": "SATURDAY",
};

export default function SetAvailabilityHours({ onNext, onSkip, isMandatory, isSubmitting }: { onNext: (data: { availabilities: any[], max_weekly_hours: number }) => void; onSkip: () => void; isMandatory?: boolean; isSubmitting?: boolean }) {
    const [schedule, setSchedule] = useState<DaySchedule[]>(
        DAYS.map((day) => ({ day, slots: [] }))
    );
    const totalWeekHours = weekTotal(schedule);
    const [openDay, setOpenDay] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleNext = () => {
        const availabilities: any[] = [];
        schedule.forEach(d => {
            d.slots.forEach(s => {
                if (s.start && s.end) {
                    availabilities.push({
                        day: DAY_MAP[d.day],
                        start_time: s.start,
                        end_time: s.end,
                        modality: 'VIRTUAL', // Default
                    });
                }
            });
        });
        onNext({ availabilities, max_weekly_hours: Math.ceil(totalWeekHours) });
    };

    const weekProgress = Math.min((totalWeekHours / MAX_HOURS_PER_WEEK) * 100, 100);
    const progressClass =
        weekProgress >= 100
            ? "weekly-progress-fill--full"
            : weekProgress >= 70
            ? "weekly-progress-fill--warn"
            : "";

    const toggleDay = (day: string) => {
        setOpenDay((prev) => (prev === day ? null : day));
    };

    const addSlot = (day: string) => {
        setErrors({});
        setSchedule((prev) =>
            prev.map((d) => {
                if (d.day !== day) return d;
                return {
                    ...d,
                    slots: [...d.slots, { id: nextId++, start: "", end: "" }],
                };
            })
        );
    };

    const removeSlot = (day: string, slotId: number) => {
        setErrors({});
        setSchedule((prev) =>
            prev.map((d) => {
                if (d.day !== day) return d;
                return { ...d, slots: d.slots.filter((s) => s.id !== slotId) };
            })
        );
    };

    const updateSlot = (
        day: string,
        slotId: number,
        field: "start" | "end",
        value: string
    ) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[`${slotId}-${field}`];
            delete next[`${slotId}`];
            delete next[`${day}-day`];
            delete next["week"];
            return next;
        });

        setSchedule((prev) => {
            const next = prev.map((d) => {
                if (d.day !== day) return d;
                return {
                    ...d,
                    slots: d.slots.map((s) =>
                        s.id === slotId ? { ...s, [field]: value } : s
                    ),
                };
            });

            // Validate after update
            const dayData = next.find((d) => d.day === day)!;
            const updatedSlot = dayData.slots.find((s) => s.id === slotId)!;

            const newErrors: Record<string, string> = {};

            if (updatedSlot.start && updatedSlot.end) {
                if (parseHours(updatedSlot.end) <= parseHours(updatedSlot.start)) {
                    newErrors[`${slotId}`] = "La hora de fin debe ser posterior a la de inicio.";
                }
            }

            const dayHours = dayTotal(dayData.slots.map((s) =>
                s.id === slotId ? { ...s, [field]: value } : s
            ));
            if (dayHours > MAX_HOURS_PER_DAY) {
                newErrors[`${day}-day`] = `Límite diario: ${MAX_HOURS_PER_DAY}h (llevas ${fmt(dayHours)}).`;
            }

            const weekHours = weekTotal(next);
            if (weekHours > MAX_HOURS_PER_WEEK) {
                newErrors["week"] = `Límite semanal: ${MAX_HOURS_PER_WEEK}h (llevas ${fmt(weekHours)}).`;
            }

            if (Object.keys(newErrors).length) {
                setErrors((e) => ({ ...e, ...newErrors }));
            }

            return next;
        });
    };

    const canAddSlot = (day: string): boolean => {
        const d = schedule.find((d) => d.day === day)!;
        return dayTotal(d.slots) < MAX_HOURS_PER_DAY && totalWeekHours < MAX_HOURS_PER_WEEK;
    };

    const hasErrors = Object.keys(errors).length > 0;
    const canContinue = !hasErrors && totalWeekHours > 0;

    return (
        <>
            <div className="drawer-body">
                <div className="body-header">
                    <p className="body-header-title">Configura tus horas semanales</p>
                    <p className="body-header-subtitle">
                        Selecciona un día y agrega los espacios de disponibilidad. Máx.{" "}
                        {MAX_HOURS_PER_DAY}h/día · {MAX_HOURS_PER_WEEK}h/semana.
                    </p>
                </div>

                {/* ── Weekly progress ── */}
                <div className="weekly-summary">
                    <p className="weekly-summary-text">
                        Horas semanales: <strong>{fmt(totalWeekHours)}</strong> /{" "}
                        {MAX_HOURS_PER_WEEK}h
                    </p>
                    <div className="weekly-progress-bar">
                        <div
                            className={`weekly-progress-fill ${progressClass}`}
                            style={{ width: `${weekProgress}%` }}
                        />
                    </div>
                </div>

                {errors["week"] && (
                    <p className="slot-error" style={{ margin: "0 3.375rem 1rem" }}>
                        ⚠ {errors["week"]}
                    </p>
                )}

                {/* ── Days ── */}
                <div className="availability-grid">
                    {schedule.map(({ day, slots }) => {
                        const isOpen = openDay === day;
                        const hours = dayTotal(slots);

                        return (
                            <div
                                key={day}
                                className={`day-row${isOpen ? " day-row--open" : ""}`}
                            >
                                {/* Day header */}
                                <button
                                    className="day-header"
                                    onClick={() => toggleDay(day)}
                                >
                                    <span className="day-header-left">
                                        <span className="day-name">{day}</span>
                                        {hours > 0 && (
                                            <span className="day-badge">{fmt(hours)}</span>
                                        )}
                                    </span>
                                    {/* Chevron icon */}
                                    <svg
                                        className="day-chevron"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                    >
                                        <path
                                            d="M5 7.5l5 5 5-5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                {/* Expanded panel */}
                                {isOpen && (
                                    <div className="day-panel">
                                        {slots.map((slot) => (
                                            <div key={slot.id}>
                                                <div className="slot-row">
                                                    <span className="slot-label">Inicio</span>
                                                    <select
                                                        className="slot-input"
                                                        value={slot.start}
                                                        onChange={(e) =>
                                                            updateSlot(day, slot.id, "start", e.target.value)
                                                        }
                                                    >
                                                        <option value="">--:--</option>
                                                        {TIME_OPTIONS.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                    <span className="slot-separator">→</span>
                                                    <span className="slot-label">Fin</span>
                                                    <select
                                                        className="slot-input"
                                                        value={slot.end}
                                                        onChange={(e) =>
                                                            updateSlot(day, slot.id, "end", e.target.value)
                                                        }
                                                    >
                                                        <option value="">--:--</option>
                                                        {TIME_OPTIONS.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="slot-delete-btn"
                                                        onClick={() => removeSlot(day, slot.id)}
                                                        title="Eliminar espacio"
                                                    >
                                                        {/* Trash icon */}
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 20 20"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={1.7}
                                                        >
                                                            <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {errors[`${slot.id}`] && (
                                                    <p className="slot-error">⚠ {errors[`${slot.id}`]}</p>
                                                )}
                                            </div>
                                        ))}

                                        {errors[`${day}-day`] && (
                                            <p className="slot-error">⚠ {errors[`${day}-day`]}</p>
                                        )}

                                        <button
                                            className="add-slot-btn"
                                            onClick={() => addSlot(day)}
                                            disabled={!canAddSlot(day)}
                                            title={
                                                !canAddSlot(day)
                                                    ? "Límite de horas alcanzado"
                                                    : "Agregar espacio"
                                            }
                                        >
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                                            </svg>
                                            Agregar espacio
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="button-row">
                    <Button className="skip-button" onClick={onSkip} disabled={isMandatory || isSubmitting}>
                        Omitir
                    </Button>
                    <Button
                        className="next-button"
                        onClick={handleNext}
                        disabled={!canContinue || isSubmitting}
                    >
                        {isSubmitting ? "Cargando..." : "Continuar"}
                    </Button>
                </div>
            </div>
        </>
    );
}