// useSessions.ts — Fetch authenticated user's session list by role
import { useState, useEffect, useCallback } from 'react';
import type { Session } from '../types/session.types';

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
 
export function useSessions(role: 'tutor' | 'student'): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
 
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/my-sessions?role=${role}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      // La respuesta del backend viene envuelta en { data: [...] }
      setSessions(json.data ?? json);
    } catch (err) {
      console.error('[useSessions] error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    } finally {
      setIsLoading(false);
    }
  }, [role]);
 
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
 
  return { sessions, isLoading, error, refetch: fetchSessions };
}