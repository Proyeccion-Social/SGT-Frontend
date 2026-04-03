import { useState, useCallback, useEffect } from 'react';
import {
  createSession,
  cancelSession,
} from '../services/sessionService';
import type { Session, CreateSessionDTO, Modality } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';

interface UseSessionReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  fetchMySessions: () => Promise<void>;
  agendar: (data: CreateSessionDTO, modalidadesPermitidas: Modality[]) => Promise<boolean>;
  cancelar: (sessionId: string, reason: string, token: string) => Promise<boolean>;
}

export function useSession(role: 'tutor' | 'student'): UseSessionReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  const fetchMySessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/my-sessions?role=${encodeURIComponent(role)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      // BFF / upstream: { data: Session[] } o array directo
      const list = Array.isArray(json) ? json : (json?.data ?? []);
      setSessions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[useSessions] error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (!_hasHydrated) return;
    void fetchMySessions();
  }, [_hasHydrated, fetchMySessions]);

  const agendar = useCallback(
  async (data: CreateSessionDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const nueva = await createSession(data);
      setSessions(prev => [...prev, nueva]);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  },
  []
);


  const cancelar = useCallback(async (sessionId: string, reason: string, token : string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cancelSession(sessionId, reason, token);
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, status: 'CANCELLED' } : s))
      );
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sessions, loading, error, fetchMySessions, agendar, cancelar };
}
