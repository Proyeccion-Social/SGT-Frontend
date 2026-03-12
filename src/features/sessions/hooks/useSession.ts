import { useState, useCallback, useEffect } from 'react';
import {
  createSession,
  getMySessions,
  cancelSession,
} from '../services/sessionService';
import { validarNuevaSesion } from '../validations/sessionValidations';
import type { Session, CreateSessionDTO, Modality } from '../types/session.types';
import { useAuthStore } from '@/store/authStore';

interface UseSessionReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  fetchMySessions: () => Promise<void>;
  agendar: (data: CreateSessionDTO, modalidadesPermitidas: Modality[]) => Promise<boolean>;
  cancelar: (sessionId: string) => Promise<boolean>;
}

export function useSession(): UseSessionReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore(state => state.user); // ← aprovecha lo que ya existe
  const { _hasHydrated } = useAuthStore();

  // Solo fetches cuando el store ya hidró
  useEffect(() => {
    if (_hasHydrated && user?.id) {
      fetchMySessions();
    }
  }, [_hasHydrated]);

  const fetchMySessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMySessions();
      setSessions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const agendar = useCallback(
    async (data: CreateSessionDTO, modalidadesPermitidas: Modality[]): Promise<boolean> => {
      // Validaciones core antes de llamar al backend
      const sesionesDelTutor = sessions.filter(s => s.tutorId === data.tutorId);
      const { valido, errores } = validarNuevaSesion(data, sesionesDelTutor, modalidadesPermitidas);

      if (!valido) {
        setError(errores.join(' | '));
        return false;
      }

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
    [sessions]
  );

  const cancelar = useCallback(async (sessionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cancelSession(sessionId);
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
