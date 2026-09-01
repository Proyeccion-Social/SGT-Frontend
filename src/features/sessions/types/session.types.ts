export type Modality = 'VIRT' | 'PRES' | "";

export type SessionStatus =
  | 'PENDING_TUTOR_CONFIRMATION'
  | 'SCHEDULED'
  | 'PENDING_MODIFICATION'
  | 'REJECTED_BY_TUTOR'
  | 'CANCELLED_BY_STUDENT'
  | 'CANCELLED_BY_TUTOR'
  | 'CANCELLED_BY_ADMIN'
  | 'EXPIRED_UNCONFIRMED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParticipantStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'ATTENDED' | 'ABSENT' | 'LATE';


export interface SessionTutor {
  id: string;        
  name: string;
  photo?: string;     // URL
}

export interface SessionSubject {
  id: string;       
  name: string;
}

export interface SessionParticipant {
  id: string;        
  name: string;
  status: ParticipantStatus;
  role: string;
}

// ─── Entidad principal Session ───────────────────────────────

export interface ModificationRequest {
  id: string;
  newModality?: Modality;
  newDurationHours?: number;
  newScheduledDate?: string;
  newStartTime?: string;
  newEndTime?: string;
  proposedBy?: string;
  status: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  tutor: SessionTutor;
  subject: SessionSubject;
  scheduledDate: string;             // "YYYY-MM-DD"
  startTime: string;                 // "HH:mm:ss"
  endTime: string;                   // "HH:mm:ss"
  duration: number;
  modality: Modality;
  status: SessionStatus;
  sessionType?: 'INDIVIDUAL' | 'GROUP';
  title: string;
  description: string;
  participants: SessionParticipant[];
  createdAt: string;
  location: string;
  virtualLink: string;            // ISO date-time
  cancelledAt: string | null;
  cancellationReason: string | null;
  pendingModification?: ModificationRequest;
  expiresAt?: string;
  student?: { name: string };
  tutorConfirmed?: boolean;
}

export type EvaluationAspect =
  | 'CLARITY'
  | 'PATIENCE'
  | 'PUNCTUALITY'
  | 'KNOWLEDGE';

/** Estados de asistencia que acepta PATCH /attendance (sin NO_SHOW). */
export type AttendanceStatus = 'ATTENDED' | 'ABSENT' | 'LATE';

// ─── Asistencia (RF34) ───────────────────────────────────────

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  arrivalTime?: string;          // ISO date-time — requerido si status === 'LATE'
}

export interface RegisterAttendanceDTO {
  attendances: AttendanceRecord[];
}

export interface AttendanceResponse {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  arrivalTime?: string;
  recordedAt: string;
}

export interface RegisterAttendanceResult {
  message: string;
  sessionId: string;
  attendances: AttendanceResponse[];
  recordedAt: string;
}

// ─── Completar sesión (RF35) ─────────────────────────────────
// PATCH /sessions/:id/complete — solo sessionId en path, sin body.

export interface CompleteSessionResult {
  message: string;
  sessionId: string;
  status: 'COMPLETED';
  completedAt: string;
  duration: number;              // en horas
  studentsNotified: number;
}

/** Respuesta del BFF que encadena attendance → complete. */
export interface AttendanceAndCompleteResult {
  message: string;
  attendance: RegisterAttendanceResult;
  completion: CompleteSessionResult | null;
  completionError?: {
    errorCode?: string;
    message: string;
  };
}

// ─── Evaluación (RF36-RF37) ──────────────────────────────────

export interface EvaluationRatings {
  clarity: number;               // 1-5
  patience: number;              // 1-5
  punctuality: number;           // 1-5
  knowledge: number;             // 1-5
}

export interface SendEvaluationDTO {
  ratings: EvaluationRatings;
  overallRating?: number;        // opcional — se calcula automáticamente si no se provee
  comments?: string;             // opcional, max 500 caracteres
}

export interface Evaluation {
  evaluationId: string;
  sessionId: string;
  studentId: string;
  tutorId: string;
  ratings: EvaluationRatings;
  overallRating: number;
  comments?: string;
  evaluatedAt: string;
}

export interface SessionEvaluationDetail {
  evaluationId: string;
  sessionId: string;
  sessionDate: string;
  tutorId: string;
  tutorName: string;
  subjectName: string;
  evaluations: Array<{
    evaluationId: string;
    studentId?: string;
    studentName?: string;        // anónimo para tutores
    ratings: EvaluationRatings;
    overallRating: number;
    comments?: string;
    evaluatedAt: string;
  }>;
  averageRating: number;
  totalEvaluations: number;
}

// ─── Cuestionario de evaluación (RF36) ──────────────────────

export interface EvaluationQuestion {
  aspect: EvaluationAspect;
  label: string;
  description: string;
  ratingScale: {
    min: number;
    max: number;
    labels?: Record<string, string>;
  };
  required: boolean;
}

export interface EvaluationQuestionnaire {
  id: string;
  version: string;
  questions: EvaluationQuestion[];
  comments: {
    maxLength: number;
    enabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
  };
  overallRating?: {
    enabled?: boolean;
    required?: boolean;
    calculation?: string;
  };
}

// ─── Métricas del tutor (RF39-RF40) ─────────────────────────

export interface TutorRatingMetrics {
  averageOverall: number;
  totalEvaluations: number;
  averageByAspect: EvaluationRatings;
  ratingsByAspect?: EvaluationRatings;
  ratingDistribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface TutorSessionMetrics {
  totalSessionsCompleted: number;
  sessionsByType: { individual: number; collaborative: number };
  sessionsByModality: { presencial: number; virtual: number };
  sessionsBySubject: Array<{
    subjectId: string;
    subjectName: string;
    count: number;
  }>;
}

export interface TutorAttendanceMetrics {
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface TutorStats {
  tutorId: string;
  tutorName: string;
  period?: { startDate?: string; endDate?: string };
  ratingMetrics: TutorRatingMetrics;
  sessionMetrics: TutorSessionMetrics;
  attendanceMetrics: TutorAttendanceMetrics;
  temporalMetrics?: Record<string, unknown>;
  calculatedAt?: string;
}

// ─── Historial del estudiante (RF38) ─────────────────────────

export interface StudentEvaluationHistory {
  studentId: string;
  studentName: string;
  evaluations: Evaluation[];
  summary: {
    totalEvaluations: number;
    averageRatingGiven: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: Record<string, unknown>;
}

// ─── Disponibilidad ──────────────────────────────────────────

export interface AvailabilityQuery {
  tutorId: string;
  date: string;
  modality?: Modality;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
  /** 'BOTH' = el slot soporta ambas modalidades; null/undefined = modalidad ambigua (se asume ambas). */
  modality?: Modality | 'BOTH' | null;
}

// ─── DTOs de creación ────────────────────────────────────────

export interface CreateSessionDTO {
  tutorId: string;
  availabilityId: number;
  scheduledDate : string;
  title: string;
  description: string;
  modality: Modality;
  subjectId?: string;
  durationHours: number;
}

// ─── Errores del API ─────────────────────────────────────────

export type ApiErrorCode =
  | 'AUTH_01'        // Token inválido o expirado
  | 'AUTH_05'        // Token no proporcionado
  | 'PERMISSION_01'  // Sin permisos
  | 'VALIDATION_01'  // Datos inválidos
  | 'RESOURCE_02'    // Recurso no encontrado
  | 'RESOURCE_04'    // Evaluación ya enviada
  | 'RESOURCE_07'    // Evaluación no encontrada
  | 'BUSINESS_09'    // Conflicto de asistencia
  | 'BUSINESS_10'    // Conflicto de estado al completar
  | 'INTERNAL_01';   // Error interno

export interface ApiError {
  errorCode: ApiErrorCode;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface TutorInfo {
  id: string;
  name: string;
  photo: string;
  subjects: Array<{ id: string; name: string }>;
}

export interface CancelSessionResponse {
  success: boolean;
  message: string;
}

/**
 * Resultado de una cancelación tal como lo consume la UI.
 * El backend responde 200 con `{ success, message }` y los errores de negocio
 * (400/403/404) con `{ statusCode, message, error }`. En ambos casos el texto
 * visible para el usuario es el `message` del backend, no uno inventado aquí:
 * es lo único que distingue un abandono grupal parcial de una cancelación completa.
 */
export type CancelResult =
  | { ok: true; message: string }
  | { ok: false; status: number; message: string };

export interface ModifySessionBody {
  newScheduledDate?: string;    // ISO date string
  newAvailabilityID?: string;   // ID del slot de disponibilidad del tutor
  newModality?: string;
  newDurationHours?: number;
}

export interface EditSessionBody {
  title: string;
  description: string;
  virtualLink?: string;           // T002 — Q4 confirmed
  location?: string;   
}

// Controls which sub-view is rendered inside SessionDetailModal
export type ModalView = 'detail' | 'propose' | 'edit' | 'reject';

export interface ConfirmSessionBody {
  message?: string;
}

export interface ConfirmSessionResult {
  success: boolean;
  message: string;
  autoRejectedCount: number;
  session: {
    id: string;
    status: string;
    tutorConfirmed: boolean;
    tutorConfirmedAt: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    participants: Array<{ id: string; name: string; status: string }>;
  };
}

export interface RejectSessionBody {
  reason: string;
}

export interface RejectSessionResult {
  success: boolean;
  message: string;
}

export interface AcceptModificationResult {
  success: boolean;
  message: string;
}

export interface RejectModificationResult {
  success: boolean;
  message: string;
}
