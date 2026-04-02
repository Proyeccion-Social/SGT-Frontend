import { useState, useCallback } from 'react';
import { getAvailability } from '../services/sessionService';
import type { AvailabilitySlot, AvailabilityQuery } from '../types/session.types';

interface UseAvailabilityReturn {
  slots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  fetchAvailability: (query: AvailabilityQuery) => Promise<void>;
  reset: () => void;
}

export function useAvailability(): UseAvailabilityReturn {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (query: AvailabilityQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailability(query);
      setSlots(data);
    } catch (e: any) {
      setError(e.message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSlots([]);
    setError(null);
  }, []);

  return { slots, loading, error, fetchAvailability, reset };
}
