import type { Slot } from "@/features/availability/services/availabilityService";
import { HOUR_START, HOUR_HEIGHT } from "./calendarConstants";

export function getWeekDates(base: Date): Record<string, Date> {
    const dayOfWeek = base.getDay() || 7;
    const monday = new Date(base);
    monday.setDate(base.getDate() - (dayOfWeek - 1));
    const keys = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    const result: Record<string, Date> = {};
    keys.forEach((key, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        result[key] = d;
    });
    return result;
}

export function isSlotInPast(slot: Slot, weekDates: Record<string, Date>): boolean {
    const slotDate = weekDates[slot.dayOfWeek?.toString().toUpperCase()];
    if (!slotDate || !slot.startTime) return false;

    const [h, m] = slot.startTime.split(":").map(Number);
    const exactSlotDate = new Date(slotDate);
    exactSlotDate.setHours(h, m, 0, 0);

    return exactSlotDate < new Date();
}

export function timeToMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

export function formatDuration(startTime: string, endTime?: string): string {
    const startMin = timeToMinutes(startTime);
    const endMin = endTime ? timeToMinutes(endTime) : startMin + 60;
    const diffHours = (endMin - startMin) / 60;
    return `${diffHours} Hora${diffHours !== 1 ? "s" : ""}`;
}

export function getSlotStyle(slot: Slot): string {
    const startMin = timeToMinutes(slot.startTime);
    const endMin = slot.endTime ? timeToMinutes(slot.endTime) : startMin + 60;
    const calStartMin = HOUR_START * 60;
    const top = ((startMin - calStartMin) / 60) * HOUR_HEIGHT;
    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT - 4;
    return `top: ${top}px; height: ${height}px;`;
}

export function getSlotsByDay(slots: Slot[], dayKey: string): any[] {
    const daySlots = slots.filter(
        (s) => s.dayOfWeek?.toString().toUpperCase() === dayKey.toUpperCase(),
    );

    if (daySlots.length === 0) return [];

    daySlots.sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    const grouped = [];
    let currentBlock = {
        ...daySlots[0],
        groupedIds: [daySlots[0].id],
        originalSlots: [daySlots[0]],
    };
    let currentEnd = daySlots[0].endTime
        ? timeToMinutes(daySlots[0].endTime)
        : timeToMinutes(daySlots[0].startTime) + 60;

    for (let i = 1; i < daySlots.length; i++) {
        const nextSlot = daySlots[i];
        const nextStart = timeToMinutes(nextSlot.startTime);
        const nextEnd = nextSlot.endTime
            ? timeToMinutes(nextSlot.endTime)
            : nextStart + 60;

        const isContiguous = currentEnd === nextStart;
        const isSameModality = currentBlock.modality === nextSlot.modality;
        const isSameStatus = currentBlock.isBooked === nextSlot.isBooked;

        if (isContiguous && isSameModality && isSameStatus) {
            currentEnd = nextEnd;
            const h = Math.floor(currentEnd / 60)
                .toString()
                .padStart(2, "0");
            const m = (currentEnd % 60).toString().padStart(2, "0");
            currentBlock.endTime = `${h}:${m}`;
            currentBlock.groupedIds.push(nextSlot.id);
            currentBlock.originalSlots.push(nextSlot);
        } else {
            grouped.push(currentBlock);
            currentBlock = {
                ...nextSlot,
                groupedIds: [nextSlot.id],
                originalSlots: [nextSlot],
            };
            currentEnd = nextEnd;
        }
    }
    grouped.push(currentBlock);
    return grouped;
}
