import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SessionDetailModal } from '@/features/sessions/components/SessionDetailModal';
import { CancelSessionModal } from '@/features/sessions/components/CancelSessionModal';
import type { Session, ModifySessionBody, EditSessionBody } from '@/features/sessions/types/session.types';
import { UserRole } from '@/constants/roles';

function dispatchRefetch() {
  document.dispatchEvent(new CustomEvent('dashboard-refetch'));
}

export default function GlobalSessionDetail() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionToCancel, setSessionToCancel] = useState<Session | null>(null);

  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? UserRole.STUDENT) as UserRole;

  useEffect(() => {
    const handler = (e: Event) => {
      const sessionId = (e as CustomEvent<{ sessionId: string }>).detail.sessionId;
      if (sessionId) setSelectedSessionId(sessionId);
    };
    document.addEventListener('open-detail', handler);
    return () => document.removeEventListener('open-detail', handler);
  }, []);

  const cancelar = async (id: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/cancel-session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, reason }),
      });
      if (!res.ok) throw new Error();
      dispatchRefetch();
      return true;
    } catch {
      return false;
    }
  };

  const modificar = async (sessionId: string, data: ModifySessionBody): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/modify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data }),
      });
      if (!res.ok) throw new Error();
      dispatchRefetch();
      return true;
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
      if (!res.ok) throw new Error();
      return true;
    } catch {
      return false;
    }
  };

  const confirmar = async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/confirm-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error();
      dispatchRefetch();
      return true;
    } catch {
      return false;
    }
  };

  const rechazar = async (sessionId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/reject-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason }),
      });
      if (!res.ok) throw new Error();
      dispatchRefetch();
      return true;
    } catch {
      return false;
    }
  };

  const aceptarModificacion = async (sessionId: string, requestId?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/accept-modification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, requestId }),
      });
      if (!res.ok) throw new Error();
      dispatchRefetch();
      return true;
    } catch {
      return false;
    }
  };

  const rechazarModificacion = async (sessionId: string, requestId?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/reject-modification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, requestId }),
      });
      if (!res.ok) throw new Error();
      dispatchRefetch();
      return true;
    } catch {
      return false;
    }
  };

  const handleRequestCancel = (session: Session) => {
    setSessionToCancel(session);
    setSelectedSessionId(null);
  };

  return (
    <>
      {selectedSessionId && (
        <SessionDetailModal
          sessionId={selectedSessionId}
          role={role}
          onClose={() => setSelectedSessionId(null)}
          onRequestCancel={handleRequestCancel}
          modificar={modificar}
          editar={editar}
          confirmar={confirmar}
          rechazar={rechazar}
          aceptarModificacion={aceptarModificacion}
          rechazarModificacion={rechazarModificacion}
        />
      )}

      {sessionToCancel && (
        <CancelSessionModal
          session={sessionToCancel}
          session_id={sessionToCancel.id}
          onClose={() => setSessionToCancel(null)}
          onSuccess={() => setSessionToCancel(null)}
          cancelar={cancelar}
          canCancel={() => true}
          isLoading={false}
          error={null}
        />
      )}
    </>
  );
}
