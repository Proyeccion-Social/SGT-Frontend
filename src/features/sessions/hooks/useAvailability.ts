import { useState, useCallback, useEffect } from 'react';
import type { AvailabilitySlot as SlotFromAPI, AvailabilityQuery } from '../types/session.types';
import type { AvailabilitySlot } from '../components/ProposeModificationView';

export function useTutorSlots(tutorId: string | null) {
  const [slots, setSlots]     = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/availability/tutor-availability?tutorId=${tutorId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        const data = await res.json();

        console.log('[useTutorSlots] respuesta cruda:', data);

        // Mapear Slot → AvailabilitySlot para ProposeModificationForm
        const mapped: AvailabilitySlot[] = data.slots.map((s: SlotFromAPI) => ({
          id: s.id,
          label: `${s.dayOfWeek} ${s.startTime} – ${s.endTime}`,
        }));
        console.log('[useTutorSlots] slots mapeados:', mapped);
        setSlots(mapped);
      } catch (err) {
        console.error('[useTutorSlots] error:', err);
        setError(err instanceof Error ? err.message : 'Error fetching slots');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [tutorId]);

  return { slots, loading, error };
}