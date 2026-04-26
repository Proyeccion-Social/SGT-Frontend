import type { Session } from '../types/session.types';

export const mockSession: Session = {
  id: 'session-123',
  title: 'Refuerzo de Cálculo Integral',
  description: 'Repaso de integrales por partes y sustitución trigonométrica. Traer guía de ejercicios.',
  subject: { id: 'math-1', name: 'Cálculo Integral' },
  tutor: { id: 'tutor-1', name: 'Juan Pérez', photo: 'https://i.pravatar.cc/150?u=tutor-1' },
  scheduledDate: '2026-05-15',
  startTime: '14:00:00',
  endTime: '16:00:00',
  duration: 2,
  type: 'INDIVIDUAL',
  modality: 'VIRT',
  status: 'PENDING_TUTOR_CONFIRMATION',
  participants: [
    { id: 'student-1', name: 'Maria Garcia', status: 'PENDING' }
  ],
  createdAt: new Date().toISOString(),
  cancelledAt: null,
  cancellationReason: null,
  expiresAt: new Date(Date.now() + 172800000).toISOString(), // 48h from now
  student: { name: 'Maria Garcia' },
};

export const mockModificationRequest = {
  id: 'mod-456',
  sessionId: 'session-123',
  sessionTitle: 'Introducción a derivadas y definición por límite.',
  sessionDescription: 'En esta tutoría quiero que me expliquen la regla de la cadena, quiero entender la definición por límite de la derivada.',
  proposedBy: 'Daniel Camacho',
  currentModality: 'PRES',
  currentDurationHours: 1,
  currentSchedule: '2026-05-15 14:00',
  newModality: 'VIRT',
  newDurationHours: 1.5,
  newAvailabilityId: 999,
  newSchedule: '2026-05-16 10:00',
  status: 'PENDING',
  expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h from now
  createdAt: new Date().toISOString(),
};

export const mockEvaluationResponse = {
  title: 'Refuerzo de Cálculo Integral',
  evaluation: null, // null means not rated yet
};
