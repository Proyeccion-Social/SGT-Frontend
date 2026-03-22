import React, { useEffect, useState } from 'react';
import type { CreateSessionDTO, Modality } from '../../types/session.types';
import type { WizardStep } from '../../hooks/useSchedulingWizard';
import { useAvailability } from '../../hooks/useAvailability';
import type { AvailabilitySlot } from '../../types/session.types';

interface Step2Props {
  data: Partial<CreateSessionDTO>;
  updateField: <K extends keyof CreateSessionDTO>(
    key: K,
    value: CreateSessionDTO[K],
  ) => void;
  goToStep: (step: WizardStep) => void;
  setModality: (modality: Modality) => void;
}

const DURATIONS = [1, 1.5, 2];

export const Availability: React.FC<Step2Props> = ({
  data,
  updateField,
  goToStep,
  setModality,
}) => {
  const { slots, loading, error, fetchAvailability } = useAvailability();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(data.duration ?? DURATIONS[0]);
  const modality = (data.modality ?? 'ONLINE') as Modality;

  useEffect(() => {
    if (data.tutorId && selectedDate && modality) {
      fetchAvailability({
        tutorId: data.tutorId,
        date: selectedDate,
        modality: modality,
      });
    }
  }, [data.tutorId, selectedDate, modality, fetchAvailability]);

  const handleSlotClick = (index: number) => {
    const slot: AvailabilitySlot | undefined = slots[index];
    if (!slot || !selectedDate) return;

    setSelectedSlotIndex(index);

    // IMPORTANTE: aquí combinamos fecha + hora del slot en el campo `date`
    // TODO: ajustar formato exacto según lo que espere tu backend
    const combinedDateTime = `${selectedDate}T${slot.start}`; // ejemplo ISO

    updateField('date', combinedDateTime as CreateSessionDTO['date']);
    updateField('duration', duration);
  };

  const canContinue =
    Boolean(data.date) && Boolean(data.duration) && Boolean(data.modality);

  return (
    <div className="space-y-4">
      {/* ... UI de fecha, modalidad, duración y lista/calendario de slots ... */}
      {/* En cada botón de slot usas handleSlotClick(index) */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm"
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => goToStep(3)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
