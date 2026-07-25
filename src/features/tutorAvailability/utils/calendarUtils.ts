import { HOUR_START, HOUR_HEIGHT } from "./calendarConstants";


/** Valores válidos de modalidad */
export type ModalityValue = 'PRES' | 'VIRT';

/**
 * El backend ahora envía modality como un array de strings.
 * Se mantiene soporte legacy para string único por retrocompatibilidad.
 */
export type Modality = ModalityValue[] | ModalityValue | null;

export type DayOfWeek = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

export type SlotAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type SlotStatus = 'AVAILABLE' | 'BOOKED';

//===============================================================
// Helpers de modalidad
//===============================================================

/**
 * Normaliza el campo modality a un array de ModalityValue.
 * Soporta string legacy ("PRES", "VIRT", "BOTH") y arrays del nuevo backend.
 */
export function normalizeModality(modality: Modality): ModalityValue[] {
  if (!modality) return [];
  if (Array.isArray(modality)) return modality as ModalityValue[];
  // Legacy: string único
  if (modality === 'BOTH') return ['PRES', 'VIRT'];
  return [modality as ModalityValue];
}

/**
 * Compara si dos valores de modalidad son equivalentes.
 * Funciona tanto con strings legacy como con arrays.
 */
export function isSameModality(a: Modality, b: Modality): boolean {
  const setA = new Set(normalizeModality(a));
  const setB = new Set(normalizeModality(b));
  if (setA.size !== setB.size) return false;
  for (const v of setA) if (!setB.has(v)) return false;
  return true;
}

//===============================================================
// Interfaces
//===============================================================
export interface Slot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  modality: Modality;
  endTime?: string;
  location?: string;
  platform?: string;
  isBooked?: boolean;
  tutorIds?: string[];
  subject?: string;
  subjectId?: string;
}

export function getWeekDates(base: Date): Record<string, Date> {
  const keys = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

  // Calcular el lunes real de la semana de base
  const currentDay = base.getDay() === 0 ? 6 : base.getDay(); // 1=Lunes...6=Sábado
  const monday = new Date(base);
  monday.setDate(base.getDate() - (currentDay - 1));
  monday.setHours(0, 0, 0, 0);

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
    const totalMins = endMin - startMin;

    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    const hourStr = hours > 0 ? `${hours} hora${hours !== 1 ? "s" : ""}` : "";
    const minStr = mins > 0 ? `${mins} mins` : "";

    if (hours > 0 && mins > 0) {
        return `${hourStr} y ${minStr}`;
    } else if (hours > 0) {
        return hourStr;
    } else {
        return minStr;
    }
}

export function getSlotStyle(slot: Slot): string {
    const startMin = timeToMinutes(slot.startTime);
    const endMin = slot.endTime ? timeToMinutes(slot.endTime) : startMin + 60;
    const calStartMin = HOUR_START * 60;
    const top = ((startMin - calStartMin) / 60) * HOUR_HEIGHT;
    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
    return `top: ${top}px; height: ${height}px;`;
}

export function getSlotsByDayStudent(slots: Slot[], dayKey: string): any[] {
  const daySlots = slots.filter(
    (s) => s.dayOfWeek?.toString().toUpperCase() === dayKey.toUpperCase()
  );

  if (daySlots.length === 0) return [];

  daySlots.sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Agrupar por franja horaria (misma startTime y endTime)
  const timeGroups: Record<string, Slot[]> = {};
  daySlots.forEach((slot) => {
    const key = `${slot.startTime}-${slot.endTime}`;
    if (!timeGroups[key]) timeGroups[key] = [];
    timeGroups[key].push(slot);
  });

  // Convertir grupos a bloques unificados
  const parallelMerged = Object.values(timeGroups).map((group) => {
    const allTutorIds = [...new Set(group.flatMap((s) => (s as any).tutorIds || []))];
    const allIds = group.map((s) => s.id);

    return {
      ...group[0],
      groupedIds: allIds,
      originalSlots: group,
      tutorIds: allTutorIds,
      tutorCount: allTutorIds.length,
    };
  });

  // Ahora aplicar merge contiguo sobre los bloques paralelos ya unificados
  parallelMerged.sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const grouped = [];
  let current = { ...parallelMerged[0] };
  let currentEnd = timeToMinutes(current.endTime || "");

  for (let i = 1; i < parallelMerged.length; i++) {
    const next = parallelMerged[i];
    const nextStart = timeToMinutes(next.startTime);
    const nextEnd = timeToMinutes(next.endTime || "");
    const isContiguous = currentEnd === nextStart;
    const isSameStatus = current.isBooked === next.isBooked;

    if (isContiguous && isSameStatus) {
      currentEnd = nextEnd;
      const h = Math.floor(currentEnd / 60).toString().padStart(2, "0");
      const m = (currentEnd % 60).toString().padStart(2, "0");
      current.endTime = `${h}:${m}`;
      current.groupedIds = [...current.groupedIds, ...next.groupedIds];
      current.originalSlots = [...current.originalSlots, ...next.originalSlots];
      current.tutorIds = [...new Set([...current.tutorIds, ...next.tutorIds])];
      current.tutorCount = current.tutorIds.length;
    } else {
      grouped.push(current);
      current = { ...next };
      currentEnd = nextEnd;
    }
  }
  grouped.push(current);
  return grouped;
}

function normalizeTime(time?: string): string {
    if (!time) return "";
    return time.substring(0, 5);
}

function normalizeIsBooked(slot: Slot | Record<string, unknown>): boolean {
    const s = slot as Record<string, unknown>;
    if (s.isAvailable === false) return true;
    return Boolean(s.isBooked);
}

export function getSlotsByDay(slots: Slot[], dayKey: string): any[] {
    const daySlots = slots
        .filter(
            (s) =>
                s.dayOfWeek?.toString().toUpperCase() === dayKey.toUpperCase(),
        )
        .map((s) => ({
            ...s,
            startTime: normalizeTime(s.startTime),
            endTime: s.endTime ? normalizeTime(s.endTime) : undefined,
            isBooked: normalizeIsBooked(s),
        }));

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
        const sameModality = isSameModality(currentBlock.modality, nextSlot.modality);
        const isSameStatus = Boolean(currentBlock.isBooked) === Boolean(nextSlot.isBooked);

        if (isContiguous && sameModality && isSameStatus) {
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