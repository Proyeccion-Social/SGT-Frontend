// ProposeModificationView.tsx
// T012: 3 controlled selectors — modality, duration, schedule (stub until T003)
// T013: Connected to modifySession service
import './styles/ProposeModificationView.css'

import { useCallback, useEffect, useState } from 'react';
import { sileo } from 'sileo';
import type { Session, ModifySessionBody, Modality } from '../types/session.types';
import { useSessionStore } from '@/store/sessionStore';
import { CustomSelect } from './CustomSelect';
import type { SelectOption } from './CustomSelect';


export type SessionType = 'individual' | 'grupal' | '';
 
export interface AvailabilitySlot {
  id: string;
  label: string; // e.g. "Lunes 14:00 – 15:00 · Virtual"
  modality?: string;
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
 
 
  const handleConfirm = useCallback(async () => {
    onSubmittingChange?.(true);

    const body: ModifySessionBody = {
  ...(newModality      && { newModality }),
  ...(newDurationHours && { newDurationHours: Number(newDurationHours) }),
  ...(newAvailabilityId && { newAvailabilityID: String(newAvailabilityId) }),
};

    const ok = await modificar(session.id, body);

    if (ok) {
      sileo.action({
        title: 'Modificación propuesta',
        description: 'El tutor recibirá tu solicitud.',
        fill: '#2ecc71',
      });
      onSuccess();
    } else {
      const errorMsg = useSessionStore.getState().error ?? 'Error al proponer la modificación';
      sileo.action({
        title: 'Error al proponer',
        description: errorMsg,
        fill: '#f35761',
      });
    }

    onSubmittingChange?.(false);
  }, [newModality, newDurationHours, newAvailabilityId, modificar, session.id, onSuccess, onSubmittingChange]);

  useEffect(() => {
    if (triggerSubmitRef) {
      triggerSubmitRef.current = handleConfirm;
    }
  }, [handleConfirm]);
 
  const currentModalityLabel = session.modality === 'VIRT' ? 'Virtual' : 'Presencial';
  const currentDurationLabel = session.duration === 1 ? '1 hora'
    : session.duration === 1.5 ? '1 hora 30 min'
    : session.duration === 2 ? '2 horas'
    : `${session.duration}h`;

  const modalityOptions: SelectOption[] = [
    { value: '', label: currentModalityLabel },
    ...(session.modality !== 'VIRT' ? [{ value: 'VIRT', label: 'Virtual' }] : []),
    ...(session.modality !== 'PRES' ? [{ value: 'PRES', label: 'Presencial' }] : []),
  ];

  const durationOptions: SelectOption[] = [
    { value: '', label: currentDurationLabel },
    ...(session.duration !== 1   ? [{ value: '1',   label: '1 hora' }] : []),
    ...(session.duration !== 1.5 ? [{ value: '1.5', label: '1 hora 30 min' }] : []),
    ...(session.duration !== 2   ? [{ value: '2',   label: '2 horas' }] : []),
  ];

  const slotsAvailable = availabilitySlots.length > 0;

  const slotOptions: SelectOption[] = slotsAvailable
    ? [
        { value: '', label: 'Selecciona un horario' },
        ...availabilitySlots.map((s) => ({ value: s.id, label: s.label })),
      ]
    : [{ value: '', label: 'Próximamente…' }];
 
  return (
    <div className="pmf">
 
      {/* ── Fila 1: Modalidad + Duración ── */}
      <div className="pmf__row">
        <CustomSelect
          options={modalityOptions}
          value={newModality ?? ''}
          onChange={(v) => setNewModality(v as Modality)}
        />
        <CustomSelect
          options={durationOptions}
          value={newDurationHours}
          onChange={setNewDurationHours}
        />
      </div>
 
      {/* ── Fila 2: Disponibilidad ── */}
      <div className="pmf__row pmf__row--full">
        <CustomSelect
          options={slotOptions}
          value={newAvailabilityId}
          onChange={(v) => {
            setNewAvailabilityId(v);
            const slot = availabilitySlots.find((s) => s.id === v);
            if (slot?.modality) {
              setNewModality(slot.modality as Modality);
            }
          }}
          disabled={!slotsAvailable}
          hint={!slotsAvailable ? 'La selección de horario estará disponible cuando se confirme la disponibilidad del tutor.' : undefined}
        />
      </div>
 
      {/* error is handled by sileo.promise */}
 
    </div>
  );
};
 
export default ProposeModificationForm;
 