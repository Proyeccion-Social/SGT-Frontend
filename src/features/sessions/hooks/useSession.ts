import { useCallback, useEffect } from 'react';
import type { Session, CreateSessionDTO, Modality, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { UserRole } from '@/constants/roles';
import { getErrorMessage } from '@/utils/errorMessages';

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

export function useSession(rawRole: UserRole | string): UseSessionsReturn {
  const role = String(rawRole).toUpperCase() as UserRole;
  const { sessions, loading, error, setSessions, setLoading, setError, lastFetched, setLastFetched } = useSessionStore();
  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  const fetchMySessions = useCallback(async (force = false) => {
    if (!force && lastFetched && Date.now() - lastFetched < 30000) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/my-sessions?role=${role.toLowerCase()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Error al obtener sesiones');
      }
      const json = await res.json();
      const list: Session[] = Array.isArray(json) ? json : (json?.data ?? []);
      setSessions(list);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('[useSession] error:', err);
      setError(getErrorMessage(err instanceof Error ? err.message : null));
    } finally {
      setLoading(false);
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
        const res = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? 'Error al crear la sesión');
        }
        const nueva: Session = await res.json();
        setSessions([...sessions, nueva]);
        return true;
      } catch (e: any) {
        setError(getErrorMessage(e.message));
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
      const res = await fetch('/api/sessions/cancel-session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Error al cancelar sesión');
      }
      setSessions(
        sessions.map(s => (s.id === sessionId ? { ...s, status: 'CANCELLED' } : s))
      );
      return true;
    } catch (err) {
      console.error('[useSession] cancelar error:', err);
      setError(getErrorMessage(err instanceof Error ? err.message : null));
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
        const res = await fetch('/api/sessions/modify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, ...data }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Error al proponer modificación');
        }
        return true;
      } catch (err) {
        console.error('[useSession] modificar error:', err);
        setError(getErrorMessage(err instanceof Error ? err.message : null));
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
        const res = await fetch('/api/sessions/edit-session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, ...data }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Error al editar la sesión');
        }
        const result = await res.json();
        if (result.success) {
          setSessions(sessions.map(s => (s.id === sessionId ? { ...s, ...data } : s)));
          return true;
        }
        return false;
      } catch (err) {
        console.error('[useSession] editar error:', err);
        setError(getErrorMessage(err instanceof Error ? err.message : null));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessions, setSessions, setLoading, setError]
  );

  return { sessions, isLoading: loading, error, fetchMySessions, agendar, cancelar, modificar, editar };
}