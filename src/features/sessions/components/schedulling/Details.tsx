import React, { useState } from 'react'
import type {CreateSessionDTO} from "../../types/session.types"
import type {WizardStep} from "../../hooks/useSchedulingWizard"
import type { CreateProgram } from 'typescript';

interface Step3Props {
  data : Partial<CreateSessionDTO>;
  updateField: <K extends keyof CreateSessionDTO>(
    key: K,
    value : CreateSessionDTO[K],
  ) => void ;
  goToStep : (step: WizardStep) => void;
}

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 500;

export const Details: React.FC<Step3Props>= ({
  data,
  updateField,
  goToStep,
}) => {
  const [title, setTitle] = useState(data.title ?? '');
  const [description, setDescription] = useState(data.description ?? '');
  
  const titleTooLong = title.length > MAX_TITLE;
  const descriptionTooLong = description.length > MAX_DESCRIPTION;
  const canContinue =
    title.length > 0 && description.length > 0 &&
    !titleTooLong && !descriptionTooLong;

  const handleNext = () => {
    updateField('title', title);
    updateField('description', description);
    goToStep(4);
  }

  return(
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detalles de la tutoría</h3>

      {/* Título */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          // permite escribir un poco más, pero marcamos error con el contador
          maxLength={MAX_TITLE + 50}
        />
        <div className="flex justify-between text-xs">
          <span className={titleTooLong ? 'text-red-600' : 'text-gray-500'}>
            {title.length}/{MAX_TITLE} caracteres
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          className="min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION + 100}
        />
        <div className="flex justify-between text-xs">
          <span className={descriptionTooLong ? 'text-red-600' : 'text-gray-500'}>
            {description.length}/{MAX_DESCRIPTION} caracteres
          </span>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm"
          onClick={() => goToStep(2)}
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleNext}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>

  );
  
};