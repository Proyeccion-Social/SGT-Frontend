// ProposeModificationView.tsx
// T012: 3 controlled selectors — modality, duration, schedule (stub until T003)
// T013: Connected to modifySession service
import './styles/ProposeModificationView.css'

import { useCallback, useEffect, useState } from 'react';
import type { Session, ModifySessionBody, Modality } from '../types/session.types';


export type SessionType = 'individual' | 'grupal' | '';
 
export interface AvailabilitySlot {
  id: string;
  label: string; // e.g. "Lunes 14:00 – 15:00"
}
 
interface Props {
  session: Session;
  /** Slots de disponibilidad provistos por el consumidor (vacío = stub deshabilitado). */
  availabilitySlots?: AvailabilitySlot[];
  onSuccess: () => void;
  /** Expone el estado de envío para que el padre controle el botón Confirmar. */
  onSubmittingChange?: (isSubmitting: boolean) => void;
  /** El padre llama a triggerSubmitRef.current() cuando presiona Confirmar. */
  triggerSubmitRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  modificar: (sessionId: string, data: ModifySessionBody) => Promise<boolean>;
}
 
export const ProposeModificationForm = ({
  session,
  availabilitySlots = [],
  onSuccess,
  onSubmittingChange,
  triggerSubmitRef,
  modificar,
}: Props) => {
  const [newModality,       setNewModality]       = useState<Modality>();
  const [newDurationHours, setNewDurationHours] = useState<string>('');
  const [newAvailabilityId, setNewAvailabilityId] = useState('');
  const [error,             setError]             = useState<string | null>(null);
 
 
  const handleConfirm = useCallback(async () => {
    setError(null);
    onSubmittingChange?.(true);

    const body: ModifySessionBody = {
  ...(newModality      && { newModality }),
  ...(newDurationHours && { newDurationHours: Number(newDurationHours) }),
  ...(newAvailabilityId && { newAvailabilityId: Number(newAvailabilityId) }),
};

    try {
      console.log('[ProposeModification] handleConfirm ejecutado', { sessionId: session.id, body });
      const ok = await modificar(session.id, body);
      if (ok) {
        console.log('ejecutada la modificacion con exito');
        onSuccess();
      } else {
        console.error('FALLO EL MODIFICAR');
        setError('No se pudo proponer la modificación.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Error al proponer modificación.');
    } finally {
      onSubmittingChange?.(false);
    }
  }, [newModality, newDurationHours, newAvailabilityId, modificar, session.id, onSuccess, onSubmittingChange]);

  useEffect(() => {
    if (triggerSubmitRef) {
      triggerSubmitRef.current = handleConfirm;
    }
  }, [handleConfirm]);
 
  const slotsAvailable = availabilitySlots.length > 0;
 
  return (
    <div className="pmf">
 
      {/* ── Fila 1: Modalidad + Tipo ── */}
      <div className="pmf__row">
 
        <div className="pmf__card">
          <div className="form-field">
            <label htmlFor="pmf-modality" className="form-field__label">Modalidad</label>
            <select
              id="pmf-modality"
              className="form-field__select"
              value={newModality}
              onChange={(e) => setNewModality(e.target.value as Modality)}
            >
              <option value="">Sin cambio</option>
              <option value="VIRT">Virtual</option>
              <option value="PRES">Presencial</option>
            </select>
          </div>
        </div>
 
        <div className="pmf__card">
          <div className="form-field">
            <label htmlFor="pmf-duration" className="form-field__label">Duración</label>
            <select
              id="pmf-duration"
              className="form-field__select"
              value={newDurationHours}
              onChange={(e) => setNewDurationHours(e.target.value)}
            >
              <option value="">Sin cambio</option>
              <option value="1">1 hora</option>
              <option value="1.5">1 hora 30 min</option>
              <option value="2">2 horas</option>
            </select>
          </div>
        </div>
 
      </div>
 
      {/* ── Fila 2: Disponibilidad ── */}
      <div className="pmf__row pmf__row--full">
 
        <div className="pmf__card">
          <div className="form-field">
            <label htmlFor="pmf-slot" className="form-field__label">Disponibilidad</label>
            <select
              id="pmf-slot"
              className="form-field__select"
              value={newAvailabilityId}
              onChange={(e) => setNewAvailabilityId(e.target.value)}
              disabled={!slotsAvailable}
              title={!slotsAvailable ? 'Pendiente de disponibilidad del tutor' : undefined}
            >
              {slotsAvailable ? (
                <>
                  <option value="">Selecciona un horario</option>
                  {availabilitySlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>{slot.label}</option>
                  ))}
                </>
              ) : (
                <option value="">Próximamente…</option>
              )}
            </select>
            {!slotsAvailable && (
              <p className="form-field__hint">
                La selección de horario estará disponible cuando se confirme la disponibilidad del tutor.
              </p>
            )}
          </div>
        </div>
 
      </div>
 
      {error && <p className="pmf__error" role="alert">{error}</p>}
 
    </div>
  );
};
 
export default ProposeModificationForm;
 