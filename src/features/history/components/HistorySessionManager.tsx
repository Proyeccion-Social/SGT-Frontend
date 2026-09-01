// HistorySessionManager.tsx
// Mirrors DashboardSessionManager: listens to 'open-session-dialog' CustomEvent
// dispatched by the table rows in SessionsBlock.astro, then shows SessionDetailModal.

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SessionDetailModal } from '@/features/sessions/components/SessionDetailModal';
import { CancelSessionModal } from '@/features/sessions/components/CancelSessionModal';
import { cancelSessionRequest } from '@/features/sessions/utils/cancelSessionRequest';
import type { CancelResult, Session, ModifySessionBody, EditSessionBody } from '@/features/sessions/types/session.types';
import { UserRole } from '@/constants/roles';

export default function HistorySessionManager() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionToCancel, setSessionToCancel] = useState<Session | null>(null);

  const user = useAuthStore((s) => s.user);
  const role = (user?.role?.toLowerCase() ?? UserRole.STUDENT) as UserRole;

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ sessionId: string }>).detail;
      if (detail?.sessionId) setActiveSessionId(detail.sessionId);
    }
    document.addEventListener('open-session-dialog', handler);
    return () => document.removeEventListener('open-session-dialog', handler);
  }, []);

  const modificar = async (sessionId: string, data: ModifySessionBody): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/modify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const editar = async (sessionId: string, data: EditSessionBody): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/edit-session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const cancelar = (id: string, reason: string): Promise<CancelResult> =>
    cancelSessionRequest(id, reason);

  const handleRequestCancel = (session: Session) => {
    setSessionToCancel(session);
    setActiveSessionId(null);
  };

  return (
    <>
      {activeSessionId && (
        <SessionDetailModal
          sessionId={activeSessionId}
          role={role}
          onClose={() => setActiveSessionId(null)}
          onRequestCancel={handleRequestCancel}
          modificar={modificar}
          editar={editar}
        />
      )}

      {sessionToCancel && (
        <CancelSessionModal
          session={sessionToCancel}
          session_id={sessionToCancel.id}
          onClose={() => setSessionToCancel(null)}
          onSuccess={() => setSessionToCancel(null)}
          cancelar={cancelar}
          isLoading={false}
          error={null}
        />
      )}
    </>
  );
}
