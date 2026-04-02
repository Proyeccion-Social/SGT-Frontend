// ProposeModificationView.tsx
// T012: 3 controlled selectors — modality, duration, schedule (stub until T003)
// T013: Connected to modifySession service

import { useState } from 'react';
import type { Session, ModifySessionBody } from '../types/session.types';
import { modifySession } from '../services/sessionService';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  session: Session;
  onBack: () => void;
  onSuccess: () => void;
}

type Modality = 'virtual' | 'in-person' | '';

export const ProposeModificationView = ({ session, onBack, onSuccess }: Props) => {
  const [newModality, setNewModality]             = useState<Modality>('');
  const [newAvailabilityID, setNewAvailabilityID] = useState('');
  const [newDurationHours, setNewDurationHours]   = useState('');
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [error, setError]                         = useState<string | null>(null);
  const [success, setSuccess]                     = useState(false);

  const token = useAuthStore((s) => s.token);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    const body: ModifySessionBody = {
      ...(newModality       && { newModality }),
      ...(newAvailabilityID && { newAvailabilityID }),
      ...(newDurationHours  && { newDurationHours: Number(newDurationHours) }),
    };

    try {
      await modifySession(session.id, body, String(token));
      setSuccess(true);
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Error al proponer modificación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-view modal-view--success" aria-live="polite">
        <p>✓ Modificación propuesta exitosamente.</p>
      </div>
    );
  }

  return (
    <div className="modal-view modal-view--propose">
      <h3 className="modal-view__title">Proponer modificación</h3>

      <div className="form-field">
        <label htmlFor="modality-select" className="form-field__label">Modalidad</label>
        <select
          id="modality-select"
          className="form-field__select"
          value={newModality}
          onChange={(e) => setNewModality(e.target.value as Modality)}
        >
          <option value="">Sin cambio</option>
          <option value="virtual">Virtual</option>
          <option value="in-person">Presencial</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="duration-select" className="form-field__label">Duración (horas)</label>
        <select
          id="duration-select"
          className="form-field__select"
          value={newDurationHours}
          onChange={(e) => setNewDurationHours(e.target.value)}
        >
          <option value="">Sin cambio</option>
          <option value="1">1 hora</option>
          <option value="1.5">1.5 horas</option>
          <option value="2">2 horas</option>
          <option value="2.5">2.5 horas</option>
          <option value="3">3 horas</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="slot-select" className="form-field__label">Horario</label>
        <select
          id="slot-select"
          className="form-field__select"
          value={newAvailabilityID}
          onChange={(e) => setNewAvailabilityID(e.target.value)}
          disabled
          title="Pendiente confirmación del shape de slots (T003)"
        >
          <option value="">Próximamente…</option>
        </select>
        <p className="form-field__hint">
          La selección de horario estará disponible cuando se confirme la disponibilidad del tutor.
        </p>
      </div>

      {error && <p className="modal-view__error" role="alert">{error}</p>}

      <div className="modal-view__footer">
        <button className="sdv-btn sdv-btn--propose" onClick={onBack} disabled={isSubmitting}>
          Cancelar
        </button>
        <button className="sdv-btn sdv-btn--cancel" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
};

export default ProposeModificationView;