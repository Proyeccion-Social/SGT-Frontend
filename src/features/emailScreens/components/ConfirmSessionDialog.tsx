import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SessionDetailView } from '@/features/sessions/components/SessionDetailView';
import { RejectSessionModal } from '@/features/sessions/components/RejectSessionModal';
import '../styles/EmailScreensShared.css';
import type { Session as EmailSession } from '../types/session.types';
import type { Session } from '@/features/sessions/types/session.types';
import { UserRole } from '@/constants/roles';

interface Props {
  sessionId: string;
  onClose: () => void;
}

const mapToFullSession = (s: EmailSession): Session => ({
  id: s.id,
  tutor: s.tutor,
  subject: s.subject,
  scheduledDate: s.scheduledDate,
  startTime: s.startTime,
  endTime: s.endTime,
  duration: s.duration,
  modality: s.modality,
  status: s.status,
  title: s.title,
  description: s.description,
  participants: s.participants ?? [],
  createdAt: s.createdAt,
  location: '',
  virtualLink: '',
  cancelledAt: null,
  cancellationReason: null,
  sessionType: undefined,
});

export const ConfirmSessionDialog = ({ sessionId, onClose }: Props) => {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role?.toLowerCase() ?? 'student') as UserRole;

  const [emailSession, setEmailSession] = useState<EmailSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [view, setView] = useState<'detail' | 'reject'>('detail');

  useEffect(() => {
    fetch(`/api/emailScreens/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setEmailSession)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (view === 'reject') { setView('detail'); return; }
      onClose();
    },
    [onClose, view]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && view === 'detail') onClose();
  };

  const handleConfirm = async () => {
    try {
      const res = await fetch('/api/emailScreens/sessions/confirm-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      setSuccess('Sesión confirmada exitosamente ✓');
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Error al confirmar la sesión');
      throw err;
    }
  };

  const handleReject = async (id: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/emailScreens/sessions/reject-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      return true;
    } catch {
      return false;
    }
  };

  const session = emailSession ? mapToFullSession(emailSession) : null;
  const isExpired = emailSession?.expiresAt
    ? new Date(emailSession.expiresAt).getTime() < Date.now()
    : false;

  const isTutor =
    !!user?.id &&
    !!session?.tutor?.id &&
    String(user.id) === String(session.tutor.id);
  const effectiveRole = isTutor ? UserRole.TUTOR : UserRole.STUDENT;

  return (
    <div className="modal-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="modal-card__container">
        {loading && (
          <div className="modal-card__loading">
            <button className="modal-card__close" onClick={onClose} aria-label="Cerrar">✕</button>
            <p>Cargando sesión…</p>
          </div>
        )}

        {!loading && error && !success && (
          <div className="modal-card__error" role="alert">
            <p>{error}</p>
            <button className="sdv-btn sdv-btn--propose" onClick={onClose}>Cerrar</button>
          </div>
        )}

        {!loading && success && (
          <div className="modal-card__error" role="alert">
            <p>{success}</p>
          </div>
        )}

        {!loading && !error && !success && session && view === 'detail' && (
          <div style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
            <SessionDetailView
              session={session}
              tutorInfo={session.tutor}
              role={effectiveRole}
              onClose={onClose}
              onProposeModification={() => {}}
              onBack={() => {}}
              onEdit={() => {}}
              onCancel={() => {}}
              onProposeSuccess={() => {}}
              onEditSuccess={() => {}}
              onConfirm={handleConfirm}
              onRequestReject={() => setView('reject')}
              onAcceptModification={async () => {}}
              onRejectModification={async () => {}}
              modificar={async () => false}
              editar={async () => false}
            />

            {emailSession?.expiresAt && (
              <div
                className={`es-expiration${isExpired ? ' es-expiration--expired' : ''}`}
                style={{ padding: '0 24px 20px', textAlign: 'center' }}
              >
                {isExpired
                  ? '⚠ Esta solicitud ha expirado'
                  : `Expira: ${new Date(emailSession.expiresAt).toLocaleString('es-CO')}`
                }
              </div>
            )}

            {!isExpired && session.status !== 'PENDING_TUTOR_CONFIRMATION' && (
              <div
                className="es-expiration"
                style={{ padding: '12px 24px 20px', background: '#f1f5f9', color: '#475569', textAlign: 'center', borderRadius: '0 0 16px 16px' }}
              >
                ✓ Esta sesión ya ha sido {session.status === 'SCHEDULED' ? 'confirmada' : 'procesada'}.
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'reject' && session && (
        <RejectSessionModal
          session={session}
          onClose={() => setView('detail')}
          onSuccess={() => {
            setSuccess('Sesión rechazada');
            setTimeout(onClose, 1500);
          }}
          rechazar={handleReject}
        />
      )}
    </div>
  );
};

export default ConfirmSessionDialog;
