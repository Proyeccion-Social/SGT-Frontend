/**
 * Mapper de mensajes de error del backend → mensajes amigables en español.
 * Wordings tomados de errores.md (fuente de verdad del proyecto).
 */

// ── Etiquetas de estado de sesión ─────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  PENDING_TUTOR_CONFIRMATION: 'Pendiente de confirmación del tutor',
  PENDING_MODIFICATION: 'Modificación pendiente',
  CANCELLED_BY_STUDENT: 'Cancelada por el estudiante',
  CANCELLED_BY_TUTOR: 'Cancelada por el tutor',
  CANCELLED_BY_ADMIN: 'Cancelada por el administrador',
  REJECTED_BY_TUTOR: 'Rechazada por el tutor',
  COMPLETED: 'Completada',
};

// ── Mapa de coincidencias exactas ─────────────────────────────────────────────
const EXACT_MAP: Record<string, string> = {
  // Registro
  'Passwords do not match':
    'Las contraseñas no coinciden. Revisalas e intentá de nuevo.',
  'Email already exists':
    'Ya existe una cuenta con ese correo. Probá iniciando sesión o recuperando tu contraseña.',
  'Email must be institutional':
    'El correo debe ser institucional (terminado en el dominio de la universidad).',

  // Verificación de correo
  'Invalid or expired token':
    'El enlace de verificación ya expiró o no es válido. Podés solicitar uno nuevo desde la pantalla de inicio de sesión.',

  // Inicio de sesión
  'Invalid credentials':
    'El correo o la contraseña no son correctos. Revisalos e intentá de nuevo.',
  'Account is not active':
    'Tu cuenta no está activa. Revisá tu correo para verificarla o contactate con soporte.',
  'User not active': 'Tu cuenta no está activa.',
  'Invalid refresh token': 'Tu sesión expiró. Por favor, volvé a iniciar sesión.',
  'Session not found or revoked':
    'Tu sesión fue cerrada o ya no es válida. Iniciá sesión nuevamente.',
  'User not found': 'No encontramos una cuenta asociada a ese correo.',
  'User not found after email verification':
    'Error al verificar el correo. Intentá de nuevo.',
  'Invalid token type': 'Token inválido. Iniciá sesión nuevamente.',

  // Cambio de contraseña
  'Current password is incorrect': 'La contraseña actual no es correcta.',

  // Tutores
  'Only administrators can create tutors':
    'Solo los administradores pueden registrar tutores.',
  'Only tutors can complete this profile': 'Esta acción es solo para tutores.',
  'Only tutors can update this profile':
    'Solo el tutor propietario puede editar este perfil.',
  'Only tutors can access this resource':
    'Solo los tutores pueden acceder a este recurso.',
  'Change password first':
    'Necesitás cambiar tu contraseña antes de completar el perfil.',
  'Complete profile first':
    'Primero completá tu perfil para poder realizar esta acción.',
  'Tutor profile not found':
    'No encontramos el perfil del tutor. Es posible que no exista o que el perfil no esté completo.',
  'Tutor not found or profile not completed':
    'El tutor no existe o todavía no completó su perfil.',
  'Tutor not found':
    'No encontramos el perfil del tutor. Es posible que no exista o que el perfil no esté completo.',

  // Disponibilidad del tutor
  'El horario debe estar entre 06:00 y 22:00':
    'Los horarios disponibles son entre las 6:00 y las 22:00.',
  'La hora de inicio debe ser menor que la hora de fin':
    'La hora de inicio debe ser antes que la hora de fin.',
  'El rango debe respetar intervalos de 30 minutos':
    'Los horarios deben estar en intervalos de 30 minutos (ej: 9:00, 9:30, 10:00…).',
  'El rango de horario no contiene slots válidos':
    'El rango de horario ingresado no genera ninguna franja válida. Revisalo e intentá de nuevo.',
  'Ya existe una franja en ese horario para este día':
    'Ya tenés una franja registrada en ese horario para ese día.',
  'Ya existe otra franja en ese horario para este día':
    'El nuevo horario entra en conflicto con una franja que ya tenés registrada.',
  'El tutor ya tiene asignado este slot de disponibilidad':
    'Ya tenés asignada esta franja de disponibilidad.',
  'Ya tienes asignado un slot en ese nuevo horario':
    'El horario al que querés mover la franja ya está ocupado.',
  'No se encontraron franjas de disponibilidad para actualizar':
    'No se encontraron franjas para actualizar.',
  'No se encontraron franjas de disponibilidad para eliminar':
    'No se encontraron franjas para eliminar.',
  'Franja de disponibilidad no encontrada o no pertenece al tutor':
    'La franja de disponibilidad no existe o no te pertenece.',
  'Availability slot not found': 'No se encontró la franja de disponibilidad.',
  'weekStart must be a Monday':
    'La fecha de inicio de semana debe ser un lunes.',
  'weekStart must have format YYYY-MM-DD':
    'El formato de fecha no es válido. Usá el formato AAAA-MM-DD.',

  // Sesiones — creación
  'No puedes agendar una tutoría contigo mismo':
    'No podés agendar una sesión con vos mismo.',
  'durationHours debe ser un numero válido':
    'La duración ingresada no es válida.',
  'El tutor no puede superar 4 horas de sesiones en un mismo día.':
    'El tutor ya tiene 4 horas de sesiones agendadas ese día. Elegí otro día u horario.',
  'Esta franja ya fue confirmada para otro estudiante. Por favor elige otro horario.':
    'Otro estudiante ya reservó ese horario. Elegí uno diferente.',
  'Esta franja ya está ocupada. Por favor elige otro horario.':
    'Ese horario ya está ocupado. Elegí otro.',
  'Esta franja ya está reservada para esa fecha':
    'Esa franja ya está reservada para la fecha elegida.',
  'El horario seleccionado no está disponible para esa duración':
    'El horario seleccionado no está disponible para esa duración. Probá con otro horario o duración.',

  // Sesiones — confirmación / rechazo
  'Session not found': 'No se encontró la sesión.',
  'ScheduledSession not found': 'No se encontró la sesión programada asociada.',
  'ScheduledSession not found for this session':
    'No se encontró la sesión programada asociada.',
  'Esta franja ya fue confirmada para otro estudiante.':
    'Ese horario ya fue confirmado para otro estudiante.',
  'La confirmación excede el límite diario de 4 horas para el tutor.':
    'Confirmar esta sesión superaría el límite diario de 4 horas. No se puede confirmar.',
  'No se encontró el estudiante asociado a esta sesión':
    'No se encontró el estudiante asociado a esta sesión.',

  // Sesiones — cancelación
  'Solo puedes cancelar con al menos 24 horas de anticipación':
    'Solo podés cancelar una sesión con al menos 24 horas de anticipación.',

  // Sesiones — modificación
  'Debes proponer al menos un cambio':
    'Para enviar una solicitud de modificación, tenés que proponer al menos un cambio.',
  'No pending modification request':
    'No hay ninguna solicitud de modificación pendiente para esta sesión.',
  'requestId es requerido':
    'Falta indicar la solicitud de modificación a responder.',
  'La solicitud ha expirado':
    'Esta solicitud de modificación ya expiró y no puede procesarse.',
  'El título no puede ser nulo':
    'El título de la sesión no puede estar vacío.',
  'La descripción no puede ser nula':
    'La descripción de la sesión no puede estar vacía.',
  'Modification request not found': 'No se encontró la solicitud de modificación.',
  'No puedes responder tu propia solicitud':
    'No podés responder a tu propia solicitud de modificación.',

  // Sesiones — asistencia
  'Sesion no encontrada': 'No se encontró la sesión.',
  'Esta sesion no pertenece al tutor autenticado': 'Esta sesión no te pertenece.',
  'Datos de entrada invalidos':
    "Algunos datos son inválidos. Si marcaste a alguien como \"tardanza\", asegurate de indicar la hora de llegada.",

  // Sesiones — evaluación
  'No participaste en esta sesion':
    'Solo los estudiantes que participaron en la sesión pueden evaluarla.',

  // Estudiantes
  'Estudiante no encontrado': 'No se encontró el perfil del estudiante.',
  'No se pueden agregar materias duplicadas':
    'No podés agregar la misma materia dos veces.',
};

// ── Patrones dinámicos (regex → mensaje fijo) ─────────────────────────────────
type PatternEntry = { pattern: RegExp; message: string };

const PATTERNS: PatternEntry[] = [
  // "Solo puedes agendar sesiones con al menos 6 horas de anticipación..."
  {
    pattern: /Solo puedes agendar sesiones con al menos/i,
    message:
      'Las sesiones deben agendarse con al menos 6 horas de anticipación. Esta sesión empieza muy pronto.',
  },
  // "La fecha X corresponde a un Y, pero el slot seleccionado solo está disponible los Z."
  {
    pattern: /La fecha .+ corresponde a un .+, pero el slot seleccionado/i,
    message:
      'La fecha seleccionada no coincide con el día del horario elegido. Revisá tu selección.',
  },
  // "La modalidad de la franja es X, pero solicitaste Y"
  {
    pattern: /La modalidad de la franja es .+, pero solicitaste/i,
    message:
      'La modalidad seleccionada no coincide con la disponible en ese horario.',
  },
  // "El tutor ha alcanzado su límite diario de Xh..."
  {
    pattern: /El tutor ha alcanzado su límite diario de/i,
    message:
      'El tutor ya alcanzó el límite diario de tutorías. Elegí otro día.',
  },
  // "El tutor ha alcanzado su límite semanal de Xh..."
  {
    pattern: /El tutor ha alcanzado su límite semanal de/i,
    message:
      'El tutor ya alcanzó su límite semanal de tutorías. Intentá la semana siguiente.',
  },
  // "Ya tienes una sesión de X a Y el Z. El horario propuesto (A–B) se solapa."
  {
    pattern: /Ya tienes una sesión de .+ a .+ el .+\. El horario propuesto/i,
    message:
      'El horario elegido se superpone con una sesión que ya tenés agendada ese día.',
  },
  // "Solo puedes proponer modificaciones con más de X días de anticipación..."
  {
    pattern: /Solo puedes proponer modificaciones con más de/i,
    message:
      'Solo podés solicitar modificaciones si la sesión es en más de 3 días.',
  },
  // "El slot tiene un dayOfWeek (X) fuera del rango esperado"
  {
    pattern: /El slot tiene un dayOfWeek .+ fuera del rango esperado/i,
    message: 'La franja de disponibilidad seleccionada no es válida.',
  },
];

/**
 * Convierte un mensaje de error técnico del backend a uno legible en español.
 *
 * Orden de búsqueda:
 * 1. Coincidencia exacta en EXACT_MAP
 * 2. Coincidencia por patrón regex en PATTERNS
 * 3. Reemplazo de códigos de estado (SCHEDULED, CANCELLED_BY_TUTOR…) en mensajes
 *    que ya vienen en español pero con el enum embebido
 * 4. Fallback al mensaje original
 */
export function getErrorMessage(raw: string | undefined | null): string {
  if (!raw) return 'Ocurrió un error inesperado. Intentá de nuevo en unos momentos.';

  // 1. Coincidencia exacta
  if (EXACT_MAP[raw]) return EXACT_MAP[raw];

  // 2. Patrones dinámicos
  for (const { pattern, message } of PATTERNS) {
    if (pattern.test(raw)) return message;
  }

  // 3. Reemplazar códigos de estado embebidos
  //    Ejemplo: "No se puede cancelar una sesión con estado SCHEDULED"
  //          → "No se puede cancelar una sesión con estado Agendada"
  let result = raw;
  for (const [code, label] of Object.entries(STATUS_LABELS)) {
    result = result.replace(new RegExp(`\\b${code}\\b`, 'g'), label);
  }

  return result;
}
