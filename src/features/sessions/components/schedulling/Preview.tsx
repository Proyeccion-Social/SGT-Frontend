import React from 'react';
import type { CreateSessionDTO } from '../../types/session.types';
import type { WizardStep } from '../../hooks/useSchedulingWizard';

interface Step4Props {
  data: Partial<CreateSessionDTO>;
  goToStep: (step: WizardStep) => void;
  isSubmitting: boolean;
  onConfirm: () => Promise<void> | void;
}

export const Preview: React.FC<Step4Props> = ({
  data,
  goToStep,
  isSubmitting,
  onConfirm,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Revisa y confirma tu tutoría</h3>

      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Tutor</span>
          <span className="text-gray-900">{data.tutorId ?? '—'}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Materia</span>
          <span className="text-gray-900">{data.subjectId ?? '—'}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Fecha</span>
          <span className="text-gray-900">{data.date ?? '—'}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Hora de inicio</span>
          <span className="text-gray-900">{data.duration ?? '—'}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Duración</span>
          <span className="text-gray-900">
            {data.duration ? `${data.duration} h` : '—'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Modalidad</span>
          <span className="text-gray-900">{data.modality ?? '—'}</span>
        </div>

        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-medium text-gray-700">Título</p>
          <p className="text-sm text-gray-900">{data.title ?? '—'}</p>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700">Descripción</p>
          <p className="whitespace-pre-line text-sm text-gray-900">
            {data.description ?? '—'}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm"
          onClick={() => goToStep(3)}
        >
          Editar detalles
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void onConfirm()}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Confirmando…' : 'Confirmar sesión'}
        </button>
      </div>
    </div>
  );
};
