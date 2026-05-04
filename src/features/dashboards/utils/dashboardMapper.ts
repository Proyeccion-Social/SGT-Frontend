import type { Session, SessionTutor, SessionParticipant, SessionSubject } from '@/features/sessions/types/session.types';
import type { DashboardSessionSummary } from '../types/dashboard.types';
import { UserRole } from '@/constants/roles';

export const mapDashboardSessionToSession = (
  summary: DashboardSessionSummary,
  userRole: UserRole
): Session => {
  const isTutor = userRole === UserRole.TUTOR;

  // For a tutor, otherPerson is a student (participant)
  // For a student, otherPerson is the tutor
  
  const tutor: SessionTutor = isTutor 
    ? { id: 'me', name: 'Yo', photo: '' } // Placeholder for "Me" as tutor
    : { id: 'other', name: summary.otherPersonName, photo: summary.otherPersonImage };

  const participants: SessionParticipant[] = isTutor
    ? [{ id: 'other', name: summary.otherPersonName, status: 'CONFIRMED', role: UserRole.STUDENT }]
    : [{ id: 'me', name: 'Yo', status: 'CONFIRMED', role: UserRole.STUDENT }];

  const subject: SessionSubject = {
    id: 'subject-id', // We don't have the ID in the summary, maybe it's not needed for the card
    name: summary.subjectName
  };

  return {
    id: summary.id,
    title: summary.title,
    description: summary.description,
    scheduledDate: summary.scheduledDate,
    startTime: summary.startTime,
    endTime: summary.endTime,
    duration: 1, // Default or calculated
    type: summary.sessionType,
    modality: summary.modality,
    status: summary.status,
    tutor,
    subject,
    participants,
    createdAt: new Date().toISOString(),
    location: '',
    virtualLink: '',
    cancelledAt: null,
    cancellationReason: null,
  };
};

export const mapDashboardSessions = (
  summaries: DashboardSessionSummary[],
  userRole: UserRole
): Session[] => {
  return summaries.map(s => mapDashboardSessionToSession(s, userRole));
};
