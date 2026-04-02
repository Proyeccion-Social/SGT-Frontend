// useSessions.ts — Fetch authenticated user's session list by role
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getSessions } from '../services/sessionService';
import type { Session } from '../types/session.types';

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSessions(role: 'tutor' | 'student'): UseSessionsReturn {
  const token = useAuthStore((s) => s.token);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessions(role, token);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    } finally {
      setIsLoading(false);
    }
  }, [role, token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, error, refetch: fetchSessions };
}