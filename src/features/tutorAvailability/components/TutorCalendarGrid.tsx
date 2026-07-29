    'use client';

    import { useState, useEffect, useCallback, useRef } from 'react';
    import {
        DAYS,
        DAY_COLORS,
        HOUR_HEIGHT,
        HOUR_START,
        HOURS_ARRAY,
    } from '../utils/calendarConstants';
    import {
        timeToMinutes,
        formatDuration,
        getSlotsByDay,
        getWeekDates,
    } from '../utils/calendarUtils';
    import type { Slot, DayOfWeek } from '../utils/calendarUtils';
    import { normalizeModality } from '../utils/calendarUtils';
    import styles from '../css/TutorCalendarGrid.module.css';
    import { sileo } from 'sileo';

    // =============================================
    // Mapa español ↔ inglés
    // =============================================
    const DAY_TO_ENGLISH: Record<string, string> = {
        LUNES: 'MONDAY',
        MARTES: 'TUESDAY',
        MIERCOLES: 'WEDNESDAY',
        JUEVES: 'THURSDAY',
        VIERNES: 'FRIDAY',
        SABADO: 'SATURDAY',
    };

    const DAY_FROM_ENGLISH: Record<string, string> = {
        MONDAY: 'LUNES',
        TUESDAY: 'MARTES',
        WEDNESDAY: 'MIERCOLES',
        THURSDAY: 'JUEVES',
        FRIDAY: 'VIERNES',
        SATURDAY: 'SABADO',
    };

    const SLOT_INTERVAL = 30;

    // =============================================
    // Helpers
    // =============================================
    function minutesToTime(minutes: number): string {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    function pixelsToMinutes(px: number): number {
        return (px / HOUR_HEIGHT) * 60;
    }

    // =============================================
    // Componente
    // =============================================
    export default function TutorCalendarGrid() {
        const [slots, setSlots] = useState<Slot[]>([]);
        const weekDates = getWeekDates(new Date());
        const today = new Date();

        const isSameDay = (date: Date | undefined) =>
            !!date &&
            today.getFullYear() === date.getFullYear() &&
            today.getMonth() === date.getMonth() &&
            today.getDate() === date.getDate();

        // En móvil sólo se muestra un día a la vez: se abre en hoy, y si la
        // semana mostrada no lo contiene, en el primero.
        const [activeDayKey, setActiveDayKey] = useState<string>(
            () => (DAYS.find((d) => isSameDay(weekDates[d.key])) ?? DAYS[0]).key,
        );

        // ---- Fetch slots ----
        const fetchSlots = useCallback(async () => {
            try {
                const res = await fetch('/api/tutor-availability/get-my-availability');
                if (res.status === 401) {
                    window.location.replace('/');
                    return;
                }
                if (!res.ok) {
                    if (res.status === 404 || res.status === 204) {
                        // setSlots([]);
                        // return; 
                    }
                    throw new Error("Failed to fetch slots");
                }

                const data = await res.json();
                const groupedByDay = data?.groupedByDay || {};
                const allSlots: Slot[] = [];

                Object.entries(groupedByDay).forEach(([dayEn, daySlots]) => {
                    const dayEs = DAY_FROM_ENGLISH[dayEn] || dayEn;
                    (daySlots as any[]).forEach((s) => {
                        allSlots.push({
                            ...s,
                            id: s.slotId || s.id,
                            dayOfWeek: dayEs as DayOfWeek,
                            startTime: s.startTime?.substring(0, 5),
                            endTime: s.endTime?.substring(0, 5),
                            modality: Array.isArray(s.modality)
                                ? s.modality.map((m: string) => m.toUpperCase())
                                : s.modality
                                    ? String(s.modality).toUpperCase()
                                    : s.modality,
                            isBooked:
                                s.isAvailable === false
                                    ? true
                                    : Boolean(s.isBooked),
                        });
                    });
                });

                setSlots(allSlots);
            } catch (error) {
                console.error('Error al cargar slots:', error);
            }
        }, []);

        useEffect(() => {
            fetchSlots();

            const handler = () => fetchSlots();
            window.addEventListener('refresh-slots', handler);
            return () => window.removeEventListener('refresh-slots', handler);
        }, [fetchSlots]);

        // ---- Render ----
        return (
            <div className={styles.calendarOuter}>
                <div className={styles.calendarWrapper}>
                    {/* Selector de día — sólo visible en móvil */}
                    <div className={styles.mobileDaySelector}>
                        {DAYS.map((day) => {
                            const date = weekDates[day.key];
                            const isActive = day.key === activeDayKey;
                            return (
                                <button
                                    key={day.key}
                                    type='button'
                                    aria-pressed={isActive}
                                    className={`${styles.mobileDayBtn}${isActive ? ` ${styles.mobileDayBtnActive}` : ''}${isSameDay(date) ? ` ${styles.mobileDayBtnToday}` : ''}`}
                                    onClick={() => setActiveDayKey(day.key)}
                                >
                                    <span className={styles.mobileDayBtnAbbr}>
                                        {day.label.slice(0, 3)}
                                    </span>
                                    <span className={styles.mobileDayBtnNum}>
                                        {date?.getDate().toString().padStart(2, '0')}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Header */}
                    <div className={styles.calendarHeader}>
                        <div className={styles.timeGutter} />
                        {DAYS.map((day) => {
                            const date = weekDates[day.key];
                            const isToday =
                                date &&
                                today.getFullYear() === date.getFullYear() &&
                                today.getMonth() === date.getMonth() &&
                                today.getDate() === date.getDate();

                            return (
                                <div
                                    key={day.key}
                                    className={`${styles.dayHeader}`}
                                >
                                    <span className={styles.dayName}>{day.label}</span>

                                </div>
                            );
                        })}
                    </div>

                    {/* Body */}
                    <div className={styles.calendarBody}>
                        <div className={styles.timeColumn}>
                            {HOURS_ARRAY.map((hour) => (
                                <div key={hour} className={styles.timeCell}>
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {DAYS.map((day) => (
                            <DayColumn
                                key={day.key}
                                dayKey={day.key}
                                slots={slots}
                                onSlotCreated={fetchSlots}
                                isMobileActive={day.key === activeDayKey}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // =============================================
    // DayColumn — columna de un día con drag + slots
    // =============================================
    interface DayColumnProps {
        dayKey: string;
        slots: Slot[];
        onSlotCreated: () => void;
        isMobileActive: boolean;
    }

    function DayColumn({ dayKey, slots, onSlotCreated, isMobileActive }: DayColumnProps) {
        const columnRef = useRef<HTMLDivElement>(null);
        const [dragState, setDragState] = useState<{
            startMin: number;
            endMin: number;
        } | null>(null);

        // Usar getSlotsByDay de calendarUtils directamente
        const mergedSlots = getSlotsByDay(slots, dayKey);

        // ---- Drag handlers ----
        const handleMouseDown = (e: React.MouseEvent) => {
            const target = e.target as HTMLElement;
            // Solo iniciar drag en celdas vacías
            if (!target.classList.contains(styles.hourCell)) return;

            e.preventDefault();
            const col = columnRef.current;
            if (!col) return;

            const rect = col.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            const clickedMin = pixelsToMinutes(relativeY) + HOUR_START * 60;
            const startMin = Math.floor(clickedMin / SLOT_INTERVAL) * SLOT_INTERVAL;

            setDragState({ startMin, endMin: startMin + SLOT_INTERVAL });

            const onMove = (ev: MouseEvent) => {
                const relY = ev.clientY - rect.top;
                const currentMin = pixelsToMinutes(relY) + HOUR_START * 60;
                const rounded = Math.ceil(currentMin / SLOT_INTERVAL) * SLOT_INTERVAL;
                const clamped = Math.min(Math.max(startMin + SLOT_INTERVAL, rounded), 19 * 60);
                setDragState({ startMin, endMin: clamped });
            };

            const onUp = async () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);

                setDragState((prev) => {
                    if (!prev || prev.endMin <= prev.startMin) return null;

                    const startTime = minutesToTime(prev.startMin);
                    const endTime = minutesToTime(prev.endMin);
                    const dayEn = DAY_TO_ENGLISH[dayKey] || dayKey;

                    // POST al backend
                    fetch('/api/tutor-availability/post-slots-by-range', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dayOfWeek: dayEn,
                            startTime,
                            endTime,
                            modality: ['PRES', 'VIRT'],
                        }),
                    })
                    .then((res) => {
                            if (res.status === 401) {
                                window.location.replace('/');
                                return;
                            }
                            if (res.ok) {
                                sileo.success({
                                    title: "Franja creada",
                                    fill: "#58d68d",
                                    duration: 2000
                                });
                                window.dispatchEvent(new CustomEvent('refresh-slots'));
                            } else {
                                res.json()
                                    .catch(() => ({}))
                                    .then((err) => {
                                        sileo.error({
                                            title: "No se pudo agendar la franja",
                                            description: err.message || 'Error al crear la franja',
                                            fill: "#f35761",
                                            duration: 3500
                                        });
                                        console.error('Error al crear franja:', err.message || 'Error');
                                    });
                            }
                        })
                        .catch((err) => {
                            sileo.error({
                                title: "Error de conexión",
                                description: 'No se pudo crear la franja',
                                fill: "#f35761",
                                duration: 3500
                            });
                            console.error('Error al crear franja:', err);
                        });

                    return null;
                });
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };

        // ---- Click en slot existente ----
        const handleSlotClick = (slot: any) => {
            const dayEn = DAY_TO_ENGLISH[dayKey] || dayKey;
            window.dispatchEvent(
                new CustomEvent('open-space-info-dialog', {
                    detail: {
                        dayOfWeek: dayEn,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        modality: slot.modality,
                        day: dayKey,
                        hours: `${slot.startTime} → ${slot.endTime}`,
                    },
                }),
            );
        };

        return (
            <div
                ref={columnRef}
                className={`${styles.dayColumn}${isMobileActive ? ` ${styles.dayColumnMobileActive}` : ''}`}
                style={{ '--day-color': DAY_COLORS[dayKey] } as React.CSSProperties}
                onMouseDown={handleMouseDown}
            >
                {/* Celdas horarias vacías */}
                {HOURS_ARRAY.map((hour) => (
                    <div key={hour} className={styles.hourCell} />
                ))}

                {/* Slots renderizados */}
                {mergedSlots.map((slot: any, index: number) => {
                    const startMin = timeToMinutes(slot.startTime);
                    const endMin = slot.endTime ? timeToMinutes(slot.endTime) : startMin + 60;
                    const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
                    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
                    const isHalfHour = 30 >= endMin - startMin;
                    const modalities = normalizeModality(slot.modality);
                    const hasPres = modalities.includes('PRES');
                    const hasVirt = modalities.includes('VIRT');
                    const modalityLabel = hasPres && hasVirt
                        ? (isHalfHour ? 'Pres + Virt' : 'Presencial + Virtual')
                        : hasVirt
                        ? 'Virtual'
                        : 'Presencial';
                    const duration = formatDuration(slot.startTime, slot.endTime);

                    return (
                        <div
                            key={`${dayKey}-${slot.startTime}-${index}`}
                            className={`${styles.slotBlock} ${isHalfHour ? styles.slotHalfHour : ''}`}
                            style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                background: DAY_COLORS[dayKey],
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSlotClick(slot);
                            }}
                        >
                            {isHalfHour ? (
                                <div className={styles.slotHalfHourContent}>
                                    <span className={styles.slotModalityTextHalfHour}>{modalityLabel}</span>
                                    <div className={styles.slotDurationTextHalfHour}>{duration}</div>
                                </div>
                            ) : (
                                <div className={styles.slotFullHourContent}>
                                    <div className={styles.slotDurationText}>{duration}</div>
                                    <span className={styles.slotModalityTextFullHour}>{modalityLabel}</span>
                                    {/*<span className={styles.slotBadge}>
                                            {slot.startTime} → {slot.endTime}
                                        </span>*/}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Overlay de drag */}
                {dragState && (
                    <div
                        className={styles.dragOverlay}
                        style={{
                            top: `${((dragState.startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT}px`,
                            height: `${((dragState.endMin - dragState.startMin) / 60) * HOUR_HEIGHT}px`,
                        }}
                    />
                )}
            </div>
        );
    }
