// Importación de la API y la ruta de disponibilidad
const API_URL = (import.meta.env.API_URL ?? '').replace(/\/$/, '');
const AVAILABILITY_PATH = '/availability';

//===============================================================
// Tipos de datos
//===============================================================
export type Modality = 'PRES' | 'VIRT';

export type DayOfWeek = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

export type SlotAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type SlotStatus = 'AVAILABLE' | 'BOOKED';

//===============================================================
// Interfaces
//===============================================================
export interface RawSlot {
  slotId: string;
  dayOfWeek: string;
  dayOfWeekNumber: number;
  startTime: string;
  endTime: string;
  modality: string;
  duration: number;
  isAvailable: boolean;
}

export interface TutorAvailabilityResponse {
  tutorId: string;
  tutorName: string;
  weekReference: string; // "yyyy-mm-dd" — lunes de la semana consultada
  totalSlots: number;
  availableSlots: RawSlot[];
  groupedByDay: Record<string, RawSlot[]>;
}

export interface Slot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  modality: Modality | null;
  endTime?: string;
  location?: string;
  platform?: string;
  isBooked?: boolean;
  tutorIds?: string[];
  subject?: string;
  subjectId?: string;
  weekReference?: string;
}

export interface GetAvailabilityQueryDto {
    onlyAvailable?: boolean;
    onlyFuture?: boolean;
    modality?: Modality;
    weekStart?: string;
}

export interface CreateSlotDto {
    dayOfWeek: DayOfWeek;
    startTime: string;
    modality: Modality;
    endTime?: string;
    location?: string;
    platform?: string;
}

export interface UpdateSlotDto {
    slotId: string;
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    modality?: Modality;
    endTime?: string;
    location?: string;
    platform?: string;
}

export interface DeleteSlotDto {
    slotId: string;
}

export interface ManageSlotDto {
    action: SlotAction;
    data: CreateSlotDto | UpdateSlotDto | DeleteSlotDto;
}

export interface SlotResponse {
    statusCode: number;
    message: string;
    slot?: Slot;
}

export interface ApiError {
    code: string;
    httpStatus: string;
    message: string;
    description: string;
}

export interface TutorAvailabilityPublic {
    tutorId: string;
    tutorName: string;
    totalSlots: number;
    availableSlots: Slot[];
    groupedByDay: Record<DayOfWeek, Slot[]>;
}

export interface TutorProfile {
    id: string;
    name: string;
    email: string;
    maxWeeklyHours: number;
}

//===============================================================
// Funciones
//===============================================================


/**
 * Construye los headers para los endpoints protegidos. 
 * Incluye el JWT en el header Authorization.
 */
function buildAuthHeaders(token?: string): HeadersInit {
    if (!token) {
        throw new Error('AUTH_05: No hay token de sesión. Pásalo explícitamente desde la ruta de Astro.')
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Manejador de respuestas del backend
 * Lanza error en caso de que el status code no sea 2xx
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        return response.json() as Promise<T>;
    }

    const rawBody = await response.json().catch(() => null);

    // Normalise to ApiError regardless of backend error format
    // (NestJS default: { statusCode, message } vs custom: { code, httpStatus, message, description })
    const errorBody: ApiError = {
        code: rawBody?.code ?? 'INTERNAL_01',
        httpStatus: rawBody?.httpStatus ?? String(rawBody?.statusCode ?? response.status),
        message: rawBody?.message ?? 'Error interno del servidor',
        description: rawBody?.description ?? 'Error al procesar la respuesta del servidor',
    };

    if (typeof window === 'undefined') {
        console.error(`[API Error] ${response.status} ${response.url}:`, rawBody ?? '(no body)');
    }

    throw errorBody;
}

//===============================================================
// Servicios
//===============================================================

/**
 * RF-16 | GET /api/v1/availability/tutors/{tutorId}/slots
 * Obtiene la disponibilidad de un tutor.
 * Endpoint publico.
 * El tutorId debe ser un UUID valido.
 * 
 * Posibles errores:
 * - VALIDATION_01 (400): tutorId invalido.
 * - RESOURCE_02 (404): Tutor no encontrado.
 */
export async function getTutorSlots(
    tutorId: string,
    query?: GetAvailabilityQueryDto,
): Promise<Slot[]> {
    const params = new URLSearchParams();

    if (query?.onlyAvailable !== undefined) {
        params.append('onlyAvailable', query.onlyAvailable.toString());
    }
    if (query?.onlyFuture !== undefined) {
        params.append('onlyFuture', query.onlyFuture.toString());
    }
    if (query?.modality !== undefined) {
        params.append('modality', query.modality);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const url = `${API_URL}${AVAILABILITY_PATH}/tutors/${tutorId}/slots${queryString}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const result = await handleResponse<any>(response);

    let rawSlots = [];
    if (result.groupedByDay) {
        Object.values(result.groupedByDay).forEach((slots: any) => {
            rawSlots.push(...slots);
        });
    } else {
        rawSlots = result.availableSlots || (Array.isArray(result) ? result : []);
    }

    const dayMap: Record<string, DayOfWeek> = {
        'MONDAY': 'LUNES',
        'TUESDAY': 'MARTES',
        'WEDNESDAY': 'MIERCOLES',
        'THURSDAY': 'JUEVES',
        'FRIDAY': 'VIERNES',
        'SATURDAY': 'SABADO',
    };

    return rawSlots.map((s: any) => ({
        id: s.slotId || s.id,
        dayOfWeek: dayMap[s.dayOfWeek?.toUpperCase()] || s.dayOfWeek,
        startTime: s.startTime?.substring(0, 5),
        endTime: s.endTime?.substring(0, 5),
        modality: s.modality,
        location: s.location,
        platform: s.platform,
        isBooked: s.isAvailable === false ? true : (s.isBooked || false)
    }));
}

/**
 * RF-15 | POST /api/v1/availability/tutor/slots
 * Gestiona la disponibilidad de un tutor autenticado.
 * Rol requerido: TUTOR
 * 
 * Acciones soportadas:
 * - CREATE: Crea un nuevo slot de disponibilidad. Necesita dayOfWeek, startTime, modality.
 * - UPDATE: Actualiza un slot de disponibilidad existente. Necesita slotId.
 * - DELETE: Elimina un slot de disponibilidad existente. Necesita slotId.
 * 
 * Posibles errores:
 * - VALIDATION_01 (400): La franja no cumple reglas de formato.
 * - BUSINESS_03 (409): La franja se solapa con una existente.
 * - AUTH_01 (401): Token inválido o expirado.
 * - AUTH_05 (401): No hay token de sesión.
 * - RESOURCE_02 (404): Tutor no encontrado.
 * - PERMISSION_01 (403): El usuario no tiene el rol de tutor.
 */
export async function manageSlot(
    dto: ManageSlotDto,
    token?: string
): Promise<SlotResponse> {
    const headers = buildAuthHeaders(token);

    const url = `${API_URL}${AVAILABILITY_PATH}/tutor/slots`;

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(dto),
    });

    return handleResponse<SlotResponse>(response);
}

/**
 * RF-17 | PUT /api/v1/availability/tutor/limits
 * Configuración del limite máximo de horas semanales del tutor autenticado.
 * Rol requerido: TUTOR
 * 
 * Posibles errores:
 * - VALIDATION_01 (400): Limite fuera de rango.
 * - AUTH_01 (401): Token inválido o expirado.
 * - AUTH_05 (401): Token no proporcionado.
 * - PERMISSION_01 (403): El usuario no tiene rol de tutor.
 */
export async function setWeeklyLimit(
    maxHours: number,
    token?: string
): Promise<void> {
    const headers = buildAuthHeaders(token);

    const url = `${API_URL}${AVAILABILITY_PATH}/tutor/limits`;

    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ maxHours }),
    });

    return handleResponse<void>(response);
}

/**
 * RF-18 | POST /api/v1/availability/tutor/workload
 * Consulta las horas agendadas, disponibles y estado del límite semanal.
 * Rol requerido: Tutor
 *
 * Errores posibles del backend:
 * - VALIDATION_01 (400): Filtro inválido
 * - AUTH_01 (401): Token inválido o expirado
 * - AUTH_05 (401): Token no proporcionado
 * - PERMISSION_01 (403): El usuario no tiene rol de tutor
 */
export async function getTutorWorkload(token?: string): Promise<{
    totalAvailableHours: number;
    scheduledHours: number;
    remainingHours: number;
    limitReachedPercentage: number;
}> {
    const headers = buildAuthHeaders(token);

    const url = `${API_URL}${AVAILABILITY_PATH}/tutor/workload`;

    const response = await fetch(
        url,
        {
            method: 'POST',
            headers,
        }
    );

    return handleResponse(response);
}

/**
 * GET /api/v1/availability/tutor/me
 * Consulta la disponibilidad propia del tutor.
 * Rol requerido: Tutor
 */
export async function getMyAvailability(token?: string): Promise<TutorAvailabilityPublic> {
    const headers = buildAuthHeaders(token);

    const url = `${API_URL}${AVAILABILITY_PATH}/tutors/me`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<TutorAvailabilityPublic>(response);
}

/**
 * GET /api/v1/tutors/profile
 * Obtiene el perfil propio del tutor autenticado.
 */
export async function getOwnTutorProfile(token?: string): Promise<TutorProfile> {
    const headers = buildAuthHeaders(token);

    const url = `${API_URL}/tutors/profile`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<TutorProfile>(response);
}

export async function getAllTutorsSSR(token: string): Promise<{ tutorId: string; tutorName: string; modalities: Modality[] }[]> {
  const response = await fetch(
    `${import.meta.env.API_URL}${AVAILABILITY_PATH}/tutors/slots`,
    { method: "GET", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } }
  );
  const result = await handleResponse<any>(response);
  const tutors: any[] = Array.isArray(result) ? result : (result.data ?? []);
  return tutors.map((t: any) => ({
    tutorId: t.tutorId,
    tutorName: t.tutorName,
    modalities: t.modalities ?? [],
  }));
}

export async function getAllTutorSlotsSSR(
  query?: GetAvailabilityQueryDto,
  token?: string
): Promise<Slot[]> {
  const tutors = await getAllTutorsSSR(token ?? '');

  const params = new URLSearchParams();
    if (query?.onlyAvailable !== undefined)
    params.append("onlyAvailable", query.onlyAvailable.toString());
    if (query?.onlyFuture !== undefined)
    params.append("onlyFuture", query.onlyFuture.toString());
    if (query?.modality !== undefined)
    params.append("modality", query.modality);
    if (query?.weekStart !== undefined)
    params.append("weekStart", query.weekStart); // ← nombre correcto
    const queryString = params.toString() ? `?${params.toString()}` : "";

  const dayMap: Record<string, DayOfWeek> = {
    MONDAY: "LUNES", TUESDAY: "MARTES", WEDNESDAY: "MIERCOLES",
    THURSDAY: "JUEVES", FRIDAY: "VIERNES", SATURDAY: "SABADO",
  };

  const allSlotsNested = await Promise.all(
    tutors.map(async (tutor) => {
      const authHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      };

      const [slotsResponse, tutorResponse] = await Promise.all([
        fetch(
          `${import.meta.env.API_URL}${AVAILABILITY_PATH}/tutors/${tutor.tutorId}/slots${queryString}`,
          { method: "GET", headers: authHeaders }
        ),
        fetch(
          `${import.meta.env.API_URL}/tutors/${tutor.tutorId}`,
          { method: "GET", headers: authHeaders }
        ),
      ]);

      const slotsResult = await handleResponse<TutorAvailabilityResponse>(slotsResponse);
      const tutorInfo = await handleResponse<any>(tutorResponse);

      // weekReference viene del backend — sirve como ancla de semana para estos slots
      const weekReference: string =
        slotsResult.weekReference ?? "";

      // Extraer slots del groupedByDay (incluye disponibles e no disponibles)
      let rawSlots: RawSlot[] = [];
      if (slotsResult.groupedByDay) {
        Object.values(slotsResult.groupedByDay).forEach((s) =>
          rawSlots.push(...s)
        );
      } else {
        rawSlots =
          slotsResult.availableSlots ??
          (Array.isArray(slotsResult) ? (slotsResult as any) : []);
      }


      const subjects: { id: string; name: string }[] =
        tutorInfo.subjects ?? [];
      
      const mapped = rawSlots.flatMap((s) =>
        subjects.map((subject) => ({
          id: s.slotId,
          dayOfWeek: dayMap[s.dayOfWeek?.toUpperCase()] ?? s.dayOfWeek,
          startTime: s.startTime?.substring(0, 5),
          endTime: s.endTime?.substring(0, 5),
          modality: (s.modality as Modality) ?? null,
          isBooked: s.isAvailable === false,
          tutorIds: [tutor.tutorId],
          subject: subject.name,
          subjectId: subject.id,
          weekReference: slotsResult.weekReference,
        }))
      );

      return mapped;
    })
  );
    const flat = allSlotsNested.flat();
    return flat;
}