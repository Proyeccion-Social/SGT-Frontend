import type { SessionStatus, Modality } from '@/features/sessions/types/session.types';

export type SessionType = 'INDIVIDUAL' | 'GROUP';

export interface DashboardSessionSummary {
  id: string;
  title: string;
  description: string;
  otherPersonName: string;
  otherPersonImage: string | null;
  subjectName: string;
  sessionType: SessionType;
  modality: Modality;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
}

export interface TutorDashboardResponse {
  weeklyHoursUsed: number;
  weeklyHoursLimit: number;
  weeklyHoursRemaining: number;
  upcomingSessions: DashboardSessionSummary[];
  totalStudentsReached: number;
}

export interface StudentDashboardResponse {
  weeklySessionsCount: number;
  upcomingSessions: DashboardSessionSummary[];
}
