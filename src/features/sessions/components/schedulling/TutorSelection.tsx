import React from 'react';
import type { CreateSessionDTO } from '../../types/session.types';
import type { WizardStep } from '../../hooks/useSchedulingWizard';

interface Step1Props {
    data: Partial<CreateSessionDTO>;
    updateField: <K extends keyof CreateSessionDTO>(
    key: K,
    value: CreateSessionDTO[K],
    ) => void;
    goToStep: (step: WizardStep) => void;
}

export const TutorSelection: React.FC<Step1Props> = ({
    data,
    updateField,
    goToStep,
  }) => {
    const handleTutorSelected = (tutorId: string, subjectId?: string) => {
      updateField('tutorId', tutorId);
    
      if (subjectId) {
        updateField('subjectId', subjectId);
      }
      goToStep(2);
    }

  const canContinue = Boolean(data.tutorId);

  return (
    <div className="space-y-4">

    <h3 className="text-lg font-semibold">Selecciona un tutor y materia</h3>

    <p className="text-sm text-gray-500">
    Busca el tutor y la materia para esta tutoría. Esta selección se usará en el resto
    </p>

    {/* TODO: Reemplazar por el componente real de búsqueda de Lucho */}
    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm textAquí va el componente de búsqueda de Lucho. Cuando el usuario seleccione un tutor, llama a{' '}">
    <code>handleTutorSelected(tutorId, subjectId?)</code>.
    </div>

    <div className="flex justify-end">
    <button type="button" disabled={!canContinue} onClick={() => goToStep(2)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
      
    </button>
    </div>
    </div>
  )
}