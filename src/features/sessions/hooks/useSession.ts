import { useState, useCallback, useEffect } from 'react';
import {
  createSession,
} from '../services/sessionService';
import type { Session, CreateSessionDTO, Modality, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';

interface UseSessionReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  fetchMySessions: () => Promise<void>;
  agendar: (data: CreateSessionDTO, modalidadesPermitidas: Modality[]) => Promise<boolean>;
  cancelar: (sessionId: string, reason: string) => Promise<boolean>;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
  editar: (sessionId: string, data: EditSessionBody) => Promise<boolean>;
}

export function useSession(role: 'tutor' | 'student'): UseSessionReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore(state => state.user);
  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  useEffect(() => {
    if (_hasHydrated && user?.id) {
      fetchMySessions();
    }
  }, [_hasHydrated, user?.id]);

  const fetchMySessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/my-sessions?role=${role}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setSessions(json.data ?? json);
    } catch (err) {
      console.error('[useSessions] error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    } finally {
      setLoading(false);
    }
  }, [role]);

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

  const cancelar = useCallback(async (sessionId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/cancel-session`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }

      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, status: 'CANCELLED' } : s))
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
        setSessions(prev =>
          prev.map(s => (s.id === sessionId ? { ...s, ...updated } : s))
        );
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
        setSessions(prev =>
          prev.map(s => (s.id === sessionId ? { ...s, ...data } : s))
        );

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