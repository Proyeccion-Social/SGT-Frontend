import { useCallback, useEffect } from 'react';
import {
  createSession,
  cancelSession,
} from '../services/sessionService';
import type { Session, CreateSessionDTO, Modality } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { UserRole } from '@/constants/roles';

interface UseSessionReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  fetchMySessions: (force?: boolean) => Promise<void>;
  agendar: (data: CreateSessionDTO, modalidadesPermitidas: Modality[]) => Promise<boolean>;
  cancelar: (sessionId: string, reason: string, token: string) => Promise<boolean>;
}

export function useSession(role: UserRole): UseSessionReturn {
  const { sessions, loading, error, setSessions, setLoading, setError, lastFetched, setLastFetched } = useSessionStore();
  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  const fetchMySessions = useCallback(async (force = false) => {
    // Evitar fetch si ya se cargó recientemente (ej. 30 segs) a menos que se force
    if (!force && lastFetched && Date.now() - lastFetched < 30000) return;

    setLoading(true);
    setError(null);
    try {
      const roleParam = role.toLowerCase();
      const res = await fetch(`/api/sessions/my-sessions?role=${encodeURIComponent(roleParam)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json?.data ?? []);
      setSessions(Array.isArray(list) ? list : []);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('[useSessions] error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    } finally {
      setLoading(false);
    }
  }, [role, lastFetched, setSessions, setLoading, setError, setLastFetched]);

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
      setSessions([...sessions, nueva]);
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
      setSessions(
        sessions.map(s => (s.id === sessionId ? { ...s, status: 'CANCELLED' } : s))
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
