import React from 'react';
import type { CreateSessionDTO, Modality } from '../../types/session.types';
import { useSchedulingWizard } from '../../hooks/useSchedulingWizard';
import { TutorSelection } from './TutorSelection';
import { Availability } from './Availability';
import { Details } from './Details';
import { Preview } from './Preview';

interface SchedulingWizardProps {
  initialData?: Partial<CreateSessionDTO>;
  modalidadesPermitidas: Modality[];
  onSuccess?: () => void;
}

export const SchedulingWizard: React.FC<SchedulingWizardProps> = ({
  initialData,
  modalidadesPermitidas,
  onSuccess,
}) => {
  const {
    step,
    data,
    isSubmitting,
    error,
    updateField,
    goToStep,
    canGoToStep,
    setModality,
    submit,
  } = useSchedulingWizard(initialData, modalidadesPermitidas);

  const handleConfirm = async () => {
    const ok = await submit();
    if (ok && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / indicador de pasos (puedes estilizarlo luego) */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Agendar tutoría</h2>
        <p className="text-sm text-gray-500">
          Paso {step} de 4
        </p>
      </div>

      {/* Contenido del paso actual */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <TutorSelection
            data={data}
            updateField={updateField}
            goToStep={goToStep}
          />
        )}
        {step === 2 && (
          <Availability
            data={data}
            updateField={updateField}
            goToStep={goToStep}
            setModality={setModality}
          />
        )}
        {step === 3 && (
          <Details
            data={data}
            updateField={updateField}
            goToStep={goToStep}
          />
        )}
        {step === 4 && (
          <Preview
            data={data}
            goToStep={goToStep}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirm}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Navegación simple inferior (opcional si cada step ya tiene sus botones) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm"
          disabled={step === 1}
          onClick={() => goToStep((step - 1) as any)}
        >
          Atrás
        </button>

        <button
          type="button"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={!canGoToStep((step + 1) as any) || step === 4}
          onClick={() => goToStep((step + 1) as any)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
