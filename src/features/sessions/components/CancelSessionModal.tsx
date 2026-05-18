// CancelSessionModal.tsx
import './styles/CancelSessionModal.css';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { sileo, Toaster } from 'sileo';
import ToasterReact from '@/components/ui/ToasterReact';
import type { Session } from '../types/session.types';

interface Props {
  session: Session;
  session_id : string;
  onClose: () => void;
  onSuccess: () => void;
  canCancel: (session: Session) => boolean;
  cancelar: (sessionId: string, reason: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const CancelSessionModal = ({
  session,
  session_id,
  onClose,
  onSuccess,
  canCancel,
  cancelar,
  isLoading,
  error,
}: Props) => {
  const [reason, setReason] = useState('');
  const [windowWarning, setWindowWarning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!canCancel(session)) {
      setWindowWarning(true);
      return;
    }
    setWindowWarning(false);
    setIsCancelling(true);
    await sileo.promise(
      async () => {
        const ok = await cancelar(session.id, reason);
        if (!ok) throw new Error('No se pudo cancelar la sesión.');
        onSuccess();
      },
      {
        loading: { title: 'Cancelando sesión...' },
        success: { title: 'Sesión cancelada',  description: 'La tutoría ha sido cancelada exitosamente.', fill: '#2ecc71' },
        error:   { title: 'Error al cancelar', fill: '#f35761' },
      }
    ).finally(() => {
      setIsCancelling(false);
    });
  };

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Cancel session">
      <Toaster position="top-center" />
      <div className="modal-card modal-card--cancel">
        <button className="modal-card__close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="cancel-modal__title">
          Antes de irte, explica por qué quieres cancelar esta tutoría
        </h2>

        <textarea
          className="cancel-modal__textarea"
          placeholder="Escribe tu justificación aquí…"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setWindowWarning(false); }}
          rows={5}
          aria-label="Justificación de cancelación"
          aria-required="true"
        />

        {windowWarning && (
          <p className="cancel-modal__warning" role="alert">
            La ventana de cancelación para esta sesión ya expiró.
          </p>
        )}

        <div className="cancel-modal__footer">
          <button className="sdv-btn sdv-btn--propose" onClick={onClose} disabled={isCancelling}>
            Volver
          </button>
          <button
            className="sdv-btn sdv-btn--cancel"
            onClick={handleCancel}
            disabled={reason.trim() === '' || isCancelling}
          >
            {isCancelling ? 'Cancelando…' : 'Cancelar tutoría'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CancelSessionModal;