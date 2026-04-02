// useSessionDetail.ts — Fetch session detail + tutor info in parallel
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getSessionDetail, getTutorInfo } from '../services/sessionService';
import type { Session, TutorInfo } from '../types/session.types';

interface UseSessionDetailReturn {
  session: Session | null;
  tutorInfo: TutorInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useSessionDetail(sessionId: string | null): UseSessionDetailReturn {
  const token = useAuthStore((s) => s.token);
  const [session, setSession] = useState<Session | null>(null);
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getSessionDetail(sessionId, token)
      .then(async (sessionData) => {
        if (cancelled) return;
        setSession(sessionData);

        // Q1 answer: tutorId comes from session.tutor.id
        const tutorId = sessionData.tutor.id;
        try {
          const tutorData = await getTutorInfo(tutorId, token);
          if (!cancelled) setTutorInfo(tutorData);
        } catch {
          // tutor info is non-blocking; session detail still shown
          if (!cancelled) setTutorInfo(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Error loading session');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  return { session, tutorInfo, isLoading, error };
}