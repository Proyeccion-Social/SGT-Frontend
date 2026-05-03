import { useState, useEffect } from 'react';
import type { AvailabilitySlot, AvailabilityQuery } from '../types/session.types';

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


        const mapped: AvailabilitySlot[] = data.slots.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ''),
          date: String(s.date ?? ''),
          dayOfWeek: String(s.dayOfWeek ?? ''),
          startTime: String(s.startTime ?? ''),
          endTime: String(s.endTime ?? ''),
          available: s.isBooked === false,
        }));
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