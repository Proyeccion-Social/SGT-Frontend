// useSessionDetail.ts
// Calls BFF routes — no token, no store dependency
// BFF handles HttpOnly cookie → backend fetch

import { useState, useEffect } from 'react';
import type { Session, SessionTutor } from '../types/session.types';

interface UseSessionDetailReturn {
  session: Session | null;
  tutorInfo: SessionTutor | null;
  isLoading: boolean;
  error: string | null;
}

export function useSessionDetail(sessionId: string | null): UseSessionDetailReturn {
  const [session, setSession]     = useState<Session | null>(null);
  const [tutorInfo, setTutorInfo] = useState<SessionTutor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setSession(null);
    setTutorInfo(null);

    fetch(`/api/sessions/detail?sessionId=${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<Session>;
      })
      .then(async (sessionData) => {
        if (cancelled) return;
        setSession(sessionData);

        const tutorId = sessionData.tutor?.id;
        if (!tutorId) return;

        try {
          const tutorRes = await fetch(`/api/sessions/tutor-info?tutorId=${tutorId}`);
          if (tutorRes.ok) {
            const tutorData: SessionTutor = await tutorRes.json();
            if (!cancelled) setTutorInfo(tutorData);
          }
        } catch {
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

    return () => { cancelled = true; };
  }, [sessionId]);

  return { session, tutorInfo, isLoading, error };
}