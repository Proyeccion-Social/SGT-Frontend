import { useState } from 'react';
import type { CreateSessionDTO, Modality } from '../types/session.types';
import { useSession } from './useSession';

export type WizardStep = 1 | 2 | 3 | 4;

export interface UseSchedulingWizardReturn {
  step: WizardStep;
  data: Partial<CreateSessionDTO>;
  isSubmitting: boolean;
  error: string | null;
  updateField: <K extends keyof CreateSessionDTO>(
    key: K,
    value: CreateSessionDTO[K],
  ) => void;
  goToStep: (step: WizardStep) => void;
  canGoToStep: (step: WizardStep) => boolean;
  setModality: (modality: Modality) => void;
  submit: () => Promise<boolean>;
}

// Campos requeridos para poder enviar el DTO al backend
const REQUIRED_FIELDS: (keyof CreateSessionDTO)[] = [
  'tutorId',
  'date',
  'duration',
  'title',
  'description',
  'modality',
];

export function useSchedulingWizard(
  initialData: Partial<CreateSessionDTO> = {},
  modalidadesPermitidas: Modality[],
): UseSchedulingWizardReturn {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<Partial<CreateSessionDTO>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { agendar } = useSession();

  const updateField = <K extends keyof CreateSessionDTO>(
    key: K,
    value: CreateSessionDTO[K],
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const canGoToStep = (target: WizardStep): boolean => {
    if (target === 1) return true;

    // Para ir al paso 2 ya debes tener tutor seleccionado
    if (target >= 2) {
      if (!data.tutorId) return false;
    }

    // Para ir al paso 3 ya debe existir fecha, hora de inicio, duración y modalidad
    if (target >= 3) {
      if (
        !data.date ||
        !data.duration ||
        !data.modality
      ) {
        return false;
      }
    }

    // Para ir al paso 4 ya debe haber título y descripción
    if (target >= 4) {
      if (!data.title || !data.description) return false;
    }

    return true;
  };

  const goToStep = (next: WizardStep) => {
    if (canGoToStep(next)) {
      setStep(next);
      setError(null);
    }
  };

  const setModality = (modality: Modality) => {
    updateField('modality', modality);
  };

  const submit = async (): Promise<boolean> => {
    setError(null);

    // Validación mínima en front: todos los campos requeridos presentes
    for (const field of REQUIRED_FIELDS) {
      if (!data[field]) {
        setError(
          'Por favor completa todos los campos requeridos antes de confirmar.',
        );
        return false;
      }
    }

    setIsSubmitting(true);
    try {
      const success = await agendar(
        data as CreateSessionDTO,
        modalidadesPermitidas,
      );

      if (!success) {
        setError('No se pudo agendar la sesión. Intenta de nuevo más tarde.');
      }

      return success;
    } catch (e: any) {
      setError(
        e?.message ?? 'Ocurrió un error inesperado al agendar la sesión.',
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    data,
    isSubmitting,
    error,
    updateField,
    goToStep,
    canGoToStep,
    setModality,
    submit,
  };
}
