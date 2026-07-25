// ProposeModificationView.tsx
// Formulario de propuesta de modificación (modalidad, duración).
//  - Modalidad: solo editable si el slot actual soporta ambas modalidades (SCHEDULING-44).
//  - Duración: solo se ofrecen duraciones que caben en la disponibilidad contigua (SCHEDULING-43).
//  - Horario: deshabilitado — "En construcción...".
import './styles/ProposeModificationView.css'

import { useCallback, useEffect, useMemo, useState } from 'react';
import { sileo } from 'sileo';
import type { Session, ModifySessionBody, Modality, AvailabilitySlot } from '../types/session.types';
import { CustomSelect } from './CustomSelect';
import type { SelectOption } from './CustomSelect';

interface Props {
  session: Session;
  /** Slots crudos de disponibilidad del tutor (vacío = aún no cargados). */
  availabilitySlots?: AvailabilitySlot[];
  /** true mientras se carga la disponibilidad del tutor. */
  slotsLoading?: boolean;
  onSuccess: () => void;
  /** Expone el estado de envío para que el padre controle el botón Confirmar. */
  onSubmittingChange?: (isSubmitting: boolean) => void;
  /** SCHEDULING-42 — reporta si hay al menos un cambio propuesto. */
  onValidityChange?: (isValid: boolean) => void;
  /** El padre llama a triggerSubmitRef.current() cuando presiona Confirmar. */
  triggerSubmitRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const DURATION_OPTIONS_HOURS = [1, 1.5, 2];

const dayOfWeekFromDate = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
};

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const durationLabel = (hours: number): string =>
  hours === 1 ? '1 hora'
    : hours === 1.5 ? '1 hora 30 min'
    : hours === 2 ? '2 horas'
    : `${hours}h`;

const modalityText = (m: string): string =>
  m === 'VIRT' ? 'Virtual' : m === 'PRES' ? 'Presencial' : m;

const normalizeDayKey = (day: unknown): string =>
  String(day ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Slot del tutor que corresponde a la fecha/hora actual de la sesión. */
const findCurrentSlot = (
  session: Session,
  slots: AvailabilitySlot[]
): AvailabilitySlot | undefined => {
  const dow = normalizeDayKey(dayOfWeekFromDate(session.scheduledDate));
  const start = session.startTime.substring(0, 5);
  const startMin = toMinutes(start);
  // 1) Match exacto día + hora de inicio
  const exact = slots.find(
    (s) =>
      normalizeDayKey(s.dayOfWeek) === dow &&
      s.startTime.substring(0, 5) === start
  );
  if (exact) return exact;
  // 2) Slot del mismo día que cubre el inicio de la sesión
  return slots.find((s) => {
    if (normalizeDayKey(s.dayOfWeek) !== dow) return false;
    const sStart = toMinutes(s.startTime.substring(0, 5));
    const sEnd = toMinutes(s.endTime.substring(0, 5));
    return sStart <= startMin && sEnd > startMin;
  });
};

/**
 * Normaliza modality del backend: 'PRES' | 'VIRT' | 'BOTH' | null | 'pres,virt' | etc.
 * true = el slot admite ambas modalidades (se puede proponer cambio).
 */
const slotSupportsBothModalities = (slot: AvailabilitySlot | undefined): boolean => {
  if (!slot) return false;
  const m = slot.modality;
  if (m == null || m === '' || m === 'null' || m === 'undefined') return true;
  const raw = String(m).toUpperCase().replace(/\s+/g, '');
  if (
    raw === 'BOTH' ||
    raw === 'NONE' ||
    raw === 'ANY' ||
    raw === 'ALL' ||
    raw === 'NULL'
  ) {
    return true;
  }
  const hasPres = raw.includes('PRES');
  const hasVirt = raw.includes('VIRT');
  return hasPres && hasVirt;
};

/** Etiqueta legible de una modalidad única; si es dual devuelve texto genérico. */
const singleModalityLabel = (modality: unknown): string => {
  if (modality == null) return '';
  const raw = String(modality).toUpperCase();
  const hasPres = raw.includes('PRES');
  const hasVirt = raw.includes('VIRT');
  if (hasPres && hasVirt) return 'presencial y virtual';
  if (hasVirt) return 'virtual';
  if (hasPres) return 'presencial';
  return String(modality).toLowerCase();
};

/**
 * Minutos de disponibilidad contigua libre del tutor desde `fromTime` en `dayOfWeek`.
 * Los tramos ocupados por la propia sesión (`sessionRange`) cuentan como disponibles,
 * ya que la sesión se mueve dentro de su propio horario al cambiar solo la duración.
 */
const getContiguousCoverageMinutes = (
  slots: AvailabilitySlot[],
  dayOfWeek: string,
  fromTime: string,
  sessionRange?: { startMin: number; endMin: number }
): number => {
  const fromMin = toMinutes(fromTime.substring(0, 5));
  const daySlots = slots
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .map((s) => {
      const start = toMinutes(s.startTime.substring(0, 5));
      const end = toMinutes(s.endTime.substring(0, 5));
      return {
        start,
        end,
        usable:
          s.available ||
          (!!sessionRange && start >= sessionRange.startMin && end <= sessionRange.endMin),
      };
    })
    .sort((a, b) => a.start - b.start);

  let cursor = fromMin;
  for (;;) {
    const next = daySlots.find((s) => s.usable && s.start <= cursor && s.end > cursor);
    if (!next) break;
    cursor = next.end;
  }
  return cursor - fromMin;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ProposeModificationForm = ({
  session,
  availabilitySlots = [],
  slotsLoading = false,
  onSuccess,
  onSubmittingChange,
  onValidityChange,
  triggerSubmitRef,
  modificar,
}: Props) => {
  const [newModality, setNewModality] = useState<Modality>();
  const [newDurationHours, setNewDurationHours] = useState<string>('');

  const currentSlot = useMemo(
    () => findCurrentSlot(session, availabilitySlots),
    [session, availabilitySlots]
  );

  /** Duraciones que caben en la disponibilidad contigua del tutor desde el inicio de la sesión. */
  const allowedDurations = useMemo(() => {
    if (availabilitySlots.length === 0) return [];
    const dayOfWeek = dayOfWeekFromDate(session.scheduledDate);
    const sessionRange = {
      startMin: toMinutes(session.startTime),
      endMin: toMinutes(session.endTime),
    };
    const coverage = getContiguousCoverageMinutes(
      availabilitySlots,
      dayOfWeek,
      session.startTime,
      sessionRange
    );
    return DURATION_OPTIONS_HOURS.filter((d) => d * 60 <= coverage);
  }, [availabilitySlots, session]);

  useEffect(() => {
    if (newDurationHours !== '' && !allowedDurations.includes(Number(newDurationHours))) {
      setNewDurationHours('');
    }
  }, [allowedDurations, newDurationHours]);

  // ── Cambios propuestos (SCHEDULING-42: al menos uno) ──

  const modalityChanged =
    newModality !== undefined && newModality !== '' && newModality !== session.modality;
  const durationChanged =
    newDurationHours !== '' && Number(newDurationHours) !== session.duration;
  const hasChanges = modalityChanged || durationChanged;

  useEffect(() => {
    onValidityChange?.(hasChanges);
  }, [hasChanges, onValidityChange]);

  // ── Envío ──

  const handleConfirm = useCallback(async () => {
    if (!hasChanges) return;
    onSubmittingChange?.(true);

    const body: ModifySessionBody = {
      ...(modalityChanged && { newModality }),
      ...(durationChanged && { newDurationHours: Number(newDurationHours) }),
    };

    await sileo.promise(
      async () => {
        const ok = await modificar(session.id, body);
        if (!ok) throw new Error('No se pudo proponer la modificación.');
        onSuccess();
      },
      {
        loading: { title: 'Proponiendo modificación...' },
        success: {
          title: 'Modificación propuesta',
          description: 'El tutor recibirá tu solicitud.',
          fill: '#2ecc71',
        },
        error: { title: 'Error al proponer', fill: '#f35761' },
      }
    ).finally(() => {
      onSubmittingChange?.(false);
    });
  }, [
    hasChanges,
    modalityChanged,
    durationChanged,
    newModality,
    newDurationHours,
    modificar,
    session.id,
    onSuccess,
    onSubmittingChange,
  ]);

  useEffect(() => {
    if (triggerSubmitRef) {
      triggerSubmitRef.current = handleConfirm;
    }
  }, [handleConfirm, triggerSubmitRef]);

  // ── Opciones y estados de los selects ──

  const currentModalityLabel = modalityText(session.modality);
  const currentDurationLabel = durationLabel(session.duration);

  const bothModalities = slotSupportsBothModalities(currentSlot);

  const modalityOptions: SelectOption[] = [
    { value: '', label: currentModalityLabel },
    ...(session.modality !== 'VIRT' ? [{ value: 'VIRT', label: 'Virtual' }] : []),
    ...(session.modality !== 'PRES' ? [{ value: 'PRES', label: 'Presencial' }] : []),
  ];

  const modalityDisabled = slotsLoading || !currentSlot || !bothModalities;
  const modalityHint = slotsLoading
    ? 'Cargando disponibilidad del tutor…'
    : !currentSlot
      ? 'No se pudo verificar la modalidad de este espacio.'
      : !bothModalities
        ? `Este espacio solo permite modalidad ${singleModalityLabel(currentSlot.modality)}.`
        : undefined;

  const durationAlternatives = allowedDurations.filter((d) => d !== session.duration);
  const durationOptions: SelectOption[] = [
    { value: '', label: currentDurationLabel },
    ...durationAlternatives.map((d) => ({ value: String(d), label: durationLabel(d) })),
  ];

  const durationDisabled = slotsLoading || durationAlternatives.length === 0;
  const durationHint = slotsLoading
    ? 'Cargando disponibilidad del tutor…'
    : durationAlternatives.length === 0
      ? 'El tutor no tiene disponibilidad contigua para cambiar la duración.'
      : undefined;

  const scheduleOptions: SelectOption[] = [{ value: '', label: 'En construcción...' }];

  return (
    <div className="pmf">

      {/* ── Fila 1: Modalidad + Duración ── */}
      <div className="pmf__row">
        <CustomSelect
          options={modalityOptions}
          value={newModality ?? ''}
          onChange={(v) => setNewModality(v as Modality)}
          disabled={modalityDisabled}
          hint={modalityHint}
        />
        <CustomSelect
          options={durationOptions}
          value={newDurationHours}
          onChange={setNewDurationHours}
          disabled={durationDisabled}
          hint={durationHint}
        />
      </div>

      {/* ── Fila 2: Horario (pendiente) ── */}
      <div className="pmf__row pmf__row--full">
        <CustomSelect
          options={scheduleOptions}
          value=""
          onChange={() => {}}
          disabled
        />
      </div>

    </div>
  );
};

export default ProposeModificationForm;
