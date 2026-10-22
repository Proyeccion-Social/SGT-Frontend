// useCancelSession.ts — 24h validation + cancel execution
import { useState } from 'react';
import type { Session } from '../types/session.types';

interface UseCancelSessionReturn {
  cancel: (sessionId: string, justification: string) => Promise<void>;
  canCancel: (session: Session) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useCancelSession(): UseCancelSessionReturn {
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
      const response = await fetch('/api/sessions/cancel-session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason: justification }),
      });
      if (!response.ok) throw new Error('Cancellation failed');
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