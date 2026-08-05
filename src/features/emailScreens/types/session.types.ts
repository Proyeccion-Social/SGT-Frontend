/**
 * Re-export del origen único de tipos de sesión/evaluación.
 * Mantener este archivo evita romper imports legacy de emailScreens.
 */
export type {
  Modality,
  SessionStatus,
  ParticipantStatus,
  SessionTutor,
  SessionSubject,
  SessionParticipant,
  Session,
  EvaluationAspect,
  AttendanceStatus,
  AttendanceRecord,
  RegisterAttendanceDTO,
  AttendanceResponse,
  RegisterAttendanceResult,
  CompleteSessionResult,
  EvaluationRatings,
  SendEvaluationDTO,
  Evaluation,
  SessionEvaluationDetail,
  EvaluationQuestion,
  EvaluationQuestionnaire,
  TutorStats,
  StudentEvaluationHistory,
  ModifySessionBody,
  EditSessionBody,
  CancelSessionResponse,
  AvailabilitySlot,
  AvailabilityQuery,
  CreateSessionDTO,
} from '@/features/sessions/types/session.types';
