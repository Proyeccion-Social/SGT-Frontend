// useCancelSession.ts — 24h validation + cancel execution
import { useState } from 'react';
import { useAuthStore } from '@store/authStore';
import { useSession } from './useSession';
import type { Session } from '../types/session.types';

interface UseCancelSessionReturn {
  cancel: (sessionId: string, justification: string) => Promise<void>;
  canCancel: (session: Session) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useCancelSession(): UseCancelSessionReturn {
  const role = useAuthStore((s) => s.user?.role ?? 'student');
  const { cancelar } = useSession(role);
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
    setIsLoading(true);
    setError(null);
    try {
      const cancelled = await cancelar(sessionId, justification);
      if (!cancelled) throw new Error('Cancellation failed');
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
