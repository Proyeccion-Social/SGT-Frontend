import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SessionDetailModal } from './SessionDetailModal';
import { CancelSessionModal } from './CancelSessionModal';
import type { Session, ModifySessionBody, EditSessionBody } from '../types/session.types';
import { UserRole } from '@/constants/roles';

interface Props {
  sessionId: string;
}

export default function SessionDetailOpener({ sessionId }: Props) {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role?.toLowerCase() ?? 'student') as UserRole;
  const [sessionToCancel, setSessionToCancel] = useState<Session | null>(null);

  const goToDashboard = () => { window.location.href = '/dashboard'; };

  const cancelar = async (id: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/cancel-session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, reason }),
      });
      return res.ok;
    } catch { return false; }
  };

  const modificar = async (id: string, data: ModifySessionBody): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/modify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, ...data }),
      });
      return res.ok;
    } catch { return false; }
  };

  const editar = async (id: string, data: EditSessionBody): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/edit-session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, ...data }),
      });
      return res.ok;
    } catch { return false; }
  };

  const confirmar = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/confirm-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      });
      return res.ok;
    } catch { return false; }
  };

  const rechazar = async (id: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/sessions/reject-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, reason }),
      });
      return res.ok;
    } catch { return false; }
  };

  const handleRequestCancel = (session: Session) => {
    setSessionToCancel(session);
  };

  return (
    <>
      <SessionDetailModal
        sessionId={sessionId}
        role={role}
        onClose={goToDashboard}
        onRequestCancel={handleRequestCancel}
        modificar={modificar}
        editar={editar}
        confirmar={confirmar}
        rechazar={rechazar}
        aceptarModificacion={async () => false}
        rechazarModificacion={async () => false}
      />

      {sessionToCancel && (
        <CancelSessionModal
          session={sessionToCancel}
          session_id={sessionToCancel.id}
          onClose={() => setSessionToCancel(null)}
          onSuccess={goToDashboard}
          cancelar={cancelar}
          canCancel={() => true}
          isLoading={false}
          error={null}
        />
      )}
    </>
  );
}
