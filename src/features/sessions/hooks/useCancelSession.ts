// useCancelSession.ts — 24h validation + cancel execution
import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { cancelSession } from '../services/sessionService';
import type { Session } from '../types/session.types';

interface UseCancelSessionReturn {
  cancel: (sessionId: string, justification: string) => Promise<void>;
  canCancel: (session: Session) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useCancelSession(): UseCancelSessionReturn {
  const token = useAuthStore((s) => s.token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function canCancel(session: Session): boolean {
    const sessionDateTime = new Date(
      `${session.scheduledDate}T${session.startTime}`
    );
    const hoursUntilSession =
      (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilSession >= 24;
  }

  async function cancel(sessionId: string, justification: string): Promise<void> {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      await cancelSession(sessionId, justification, token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { cancel, canCancel, isLoading, error };
}