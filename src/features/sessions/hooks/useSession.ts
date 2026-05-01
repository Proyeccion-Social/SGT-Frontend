import { useCallback, useEffect } from 'react';
import {
  createSession,
  cancelSession,
  getSessions,
  modifySession,
  editSession,
} from '../services/sessionService';
import type { Session, CreateSessionDTO, Modality, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { UserRole } from '@/constants/roles';

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  fetchMySessions: (force?: boolean) => Promise<void>;
  agendar: (data: CreateSessionDTO, modalidadesPermitidas: Modality[]) => Promise<boolean>;
  cancelar: (sessionId: string, reason: string) => Promise<boolean>;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
}

export function useSession(rawRole: UserRole | string): UseSessionReturn {
  const role = String(rawRole).toUpperCase() as UserRole;
  const { sessions, loading, error, setSessions, setLoading, setError, lastFetched, setLastFetched } = useSessionStore();
  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  const fetchMySessions = useCallback(async (force = false) => {
    // Evitar fetch si ya se cargó recientemente (ej. 30 segs) a menos que se force
    if (!force && lastFetched && Date.now() - lastFetched < 30000) return;

    setLoading(true);
    setError(null);
    try {
      const list = await getSessions(role);
      setSessions(list);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('[useSessions] error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    } finally {
      setIsLoading(false);
    }
  }, [role, lastFetched, setSessions, setLoading, setError, setLastFetched]);

  useEffect(() => {
    // Si estamos en el cliente, intentamos fetch si no hay sesiones o si paso tiempo
    if (typeof window !== 'undefined') {
      // Forzamos fetch si no hay sesiones cargadas aún
      if (sessions.length === 0 && !loading && !error && !lastFetched) {
        void fetchMySessions(true);
      }
    }
  }, [fetchMySessions, lastFetched, sessions.length, loading, error]);

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
    [sessions, setSessions, setLoading, setError]
  );

  const cancelar = useCallback(async (sessionId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cancelSession(sessionId, reason);
      setSessions(
        sessions.map(s => (s.id === sessionId ? { ...s, status: 'CANCELLED' } : s))
      );
      return true;
    } catch (err) {
      console.error('[useSessions] error:', err);
      setError(err instanceof Error ? err.message : 'Error cancelling session');
      return false;
    } finally {
      setLoading(false);
    }
  }, [sessions, setSessions, setLoading, setError]);

  const modificar = useCallback(
    async (sessionId: string, data: ModifySessionBody): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const result = await modifySession(sessionId, data);
        if (result.success) {
          // If the modification was immediate (not a proposal), we'd update sessions here
          // But usually this returns a message saying confirmation is pending.
          // For now, let's refresh to be safe or rely on the toast/message.
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useSessions] error:', err);
        setError(err instanceof Error ? err.message : 'Error modifying session');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const editar = useCallback(
    async (sessionId: string, data: EditSessionBody): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const result = await editSession(sessionId, data);
        if (result.success) {
          setSessions(sessions.map(s => (s.id === sessionId ? { ...s, ...data } : s)));
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useSessions] editar error:', err);
        setError(err instanceof Error ? err.message : 'Error editing session');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessions, setSessions, setLoading, setError]
  );

  return { sessions, loading, error, fetchMySessions, agendar, cancelar, modificar, editar };
}