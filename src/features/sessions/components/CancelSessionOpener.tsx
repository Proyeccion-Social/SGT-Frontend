import { useState, useEffect } from 'react';
import { CancelSessionModal } from './CancelSessionModal';
import { cancelSessionRequest } from '../utils/cancelSessionRequest';
import type { CancelResult, Session } from '../types/session.types';

interface Props {
  sessionId: string;
}

export default function CancelSessionOpener({ sessionId }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/detail?sessionId=${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setSession)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const goToDashboard = () => { window.location.href = '/dashboard'; };

  const cancelar = (id: string, reason: string): Promise<CancelResult> =>
    cancelSessionRequest(id, reason);

  if (loading) {
    return (
      <div className="modal-card__loading">
        <p>Cargando sesión…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-card__error" role="alert">
        <p>{error}</p>
        <button className="sdv-btn sdv-btn--propose" onClick={goToDashboard}>
          Ir al inicio
        </button>
      </div>
    );
  }

  if (!session) return null;

  return (
    <CancelSessionModal
      session={session}
      session_id={session.id}
      onClose={goToDashboard}
      onSuccess={goToDashboard}
      cancelar={cancelar}
      isLoading={false}
      error={null}
    />
  );
}
