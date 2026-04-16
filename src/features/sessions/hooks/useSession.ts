import { useCallback, useEffect } from 'react';
import {
  createSession,
  cancelSession,
} from '../services/sessionService';
import type { Session, CreateSessionDTO, Modality, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { UserRole } from '@/constants/roles';

interface UseSessionReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  fetchMySessions: (force?: boolean) => Promise<void>;
  agendar: (data: CreateSessionDTO, modalidadesPermitidas: Modality[]) => Promise<boolean>;
  cancelar: (sessionId: string, reason: string) => Promise<boolean>;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
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
  }, []);

  const modificar = useCallback(
    async (sessionId: string, data: ModifySessionBody): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sessions/modify-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, ...data }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }

        const updated: Session = await res.json();
        setSessions(sessions.map(s => (s.id === sessionId ? { ...s, ...updated } : s)));
        return true;
      } catch (err) {
        console.error('[useSessions] error:', err);
        setError(err instanceof Error ? err.message : 'Error modifying session');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── EDITAR ─────────────────────────────────────────────────────────────────
  // Diferente a modificar: usa PATCH /scheduling/sessions/{sessionId}
  // Actualiza campos como virtualLink y location sobre una sesión existente
  const editar = useCallback(
    async (sessionId: string, data: EditSessionBody): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sessions/edit-session`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, ...data }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }

        const result = await res.json();

        // Refrescamos la sesión actualizada en el estado local
        setSessions(sessions.map(s => (s.id === sessionId ? { ...s, ...data } : s)));

        return true;
      } catch (err) {
        console.error('[useSessions] editar error:', err);
        setError(err instanceof Error ? err.message : 'Error editing session');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  // ──────────────────────────────────────────────────────────────────────────

  return { sessions, loading, error, fetchMySessions, agendar, cancelar, modificar, editar };
}