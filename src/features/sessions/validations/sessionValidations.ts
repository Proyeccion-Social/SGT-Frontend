import type { Session, CreateSessionDTO, Modality } from '../types/session.types';

// Límite semanal del tutor (máx. sesiones activas en la misma semana)
const MAX_SESIONES_SEMANALES = 5;

function getWeekRange(fecha: string): { inicio: Date; fin: Date } {
  const date = new Date(fecha);
  const day = date.getDay(); // 0 = domingo
  const inicio = new Date(date);
  inicio.setDate(date.getDate() - day);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  return { inicio, fin };
}

// ─── Validación 1: Límite semanal del tutor ──────────────────
export function validarLimiteSemanal(
  sesionesExistentes: Session[],
  nuevaFecha: string
): { valido: boolean; mensaje?: string } {
  const { inicio, fin } = getWeekRange(nuevaFecha);

  const sesionesSemana = sesionesExistentes.filter(s => {
    const fecha = new Date(s.scheduledDate);
    return fecha >= inicio && fecha <= fin && s.status !== 'CANCELLED';
  });

  if (sesionesSemana.length >= MAX_SESIONES_SEMANALES) {
    return {
      valido: false,
      mensaje: `El tutor ya tiene ${MAX_SESIONES_SEMANALES} sesiones agendadas esta semana`,
    };
  }

  return { valido: true };
}

// ─── Validación 2: Solapamiento de horarios ──────────────────
export function validarSolapamiento(
  sesionesExistentes: Session[],
  nueva: CreateSessionDTO
): { valido: boolean; mensaje?: string } {
  const inicioNueva = nueva.start;
  const finNueva = nueva.end;

  const hayConflicto = sesionesExistentes
    .filter(s => s.date === nueva.date && s.status !== 'CANCELLED')
    .some(s => {
      // Hay solapamiento si: inicio_nueva < fin_existente Y fin_nueva > inicio_existente
      return inicioNueva < s.start && finNueva > s.end;
    });

  if (hayConflicto) {
    return {
      valido: false,
      mensaje: 'El horario seleccionado se solapa con otra sesión existente',
    };
  }

  return { valido: true };
}

// ─── Validación 3: Modalidad correcta ───────────────────────
export function validarModalidad(
  modalidadSolicitada: Modality,
  modalidadesPermitidas: Modality[]
): { valido: boolean; mensaje?: string } {
  if (!modalidadesPermitidas.includes(modalidadSolicitada)) {
    return {
      valido: false,
      mensaje: `El tutor no ofrece sesiones en modalidad ${modalidadSolicitada}`,
    };
  }

  return { valido: true };
}

// ─── Validación combinada ────────────────────────────────────
export function validarNuevaSesion(
  nueva: CreateSessionDTO,
  sesionesExistentes: Session[],
  modalidadesPermitidas: Modality[]
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  const limiteSemanal = validarLimiteSemanal(sesionesExistentes, nueva.date);
  if (!limiteSemanal.valido) errores.push(limiteSemanal.mensaje!);

  const solapamiento = validarSolapamiento(sesionesExistentes, nueva);
  if (!solapamiento.valido) errores.push(solapamiento.mensaje!);

  const modalidad = validarModalidad(nueva.modalidad, modalidadesPermitidas);
  if (!modalidad.valido) errores.push(modalidad.mensaje!);

  return { valido: errores.length === 0, errores };
}
