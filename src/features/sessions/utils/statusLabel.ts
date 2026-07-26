import type { SessionStatus } from '../types/session.types';

/**
 * Fuente única de las etiquetas de `SessionStatus`.
 *
 * Está tipado con `Record<SessionStatus, string>`: si el backend agrega un estado al enum y alguien
 * olvida traducirlo acá, el typecheck rompe (que es exactamente el fallo que producía el enum crudo
 * `REJECTED_BY_TUTOR` en el historial). Antes este mapeo estaba triplicado y solo una copia estaba tipada.
 *
 * Notas de alcance (ver reporte de fallos §4.3):
 * - **No** incluye el override por asistencia (`ABSENT` → "No asistió"): eso deriva de
 *   `session.participants`, no de `session.status`, y se queda en cada componente.
 * - La variante corta existe solo para las tarjetas mobile del historial, donde el espacio es reducido
 *   y el texto largo rompía el layout. Solo difiere en los estados que lo necesitan.
 */
const STATUS_LABEL: Record<SessionStatus, string> = {
  PENDING_TUTOR_CONFIRMATION: 'Pendiente de confirmación',
  SCHEDULED:                  'Programada',
  PENDING_MODIFICATION:       'Modificación pendiente',
  REJECTED_BY_TUTOR:          'Rechazada por el tutor',
  CANCELLED_BY_STUDENT:       'Cancelada por el estudiante',
  CANCELLED_BY_TUTOR:         'Cancelada por el tutor',
  CANCELLED_BY_ADMIN:         'Cancelada por administración',
  COMPLETED:                  'Completada',
  EXPIRED_UNCONFIRMED:        'Expirada sin confirmar',
};

/** Sobrescrituras cortas para mobile. Un estado ausente cae en la etiqueta larga. */
const STATUS_LABEL_SHORT: Partial<Record<SessionStatus, string>> = {
  PENDING_TUTOR_CONFIRMATION: 'Pendiente del tutor',
};

export type StatusLabelVariant = 'long' | 'short';

/** Traduce el enum del backend a texto legible. `variant='short'` para espacios reducidos (mobile). */
export function statusLabel(status: SessionStatus, variant: StatusLabelVariant = 'long'): string {
  if (variant === 'short' && STATUS_LABEL_SHORT[status]) {
    return STATUS_LABEL_SHORT[status]!;
  }
  return STATUS_LABEL[status] ?? status;
}
