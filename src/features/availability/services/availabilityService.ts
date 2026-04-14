// Importación de la API y la ruta de disponibilidad
const API_URL = (import.meta.env.API_URL ?? import.meta.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');
const AVAILABILITY_PATH = '/availability';
const IS_SERVER = typeof window === 'undefined';

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
export interface Slot {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    modality: Modality;
    endTime?: string;
    location?: string;
    platform?: string;
    isBooked?: boolean;
}

export interface GetAvailabilityQueryDto {
    onlyAvailable?: boolean;
    onlyFuture?: boolean;
    modality?: Modality;
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

    const errorBody: ApiError = await response.json().catch(() => ({
        code: 'INTERNAL_01',
        httpStatus: response.status.toString(),
        message: 'Error interno del servidor',
        description: 'Error al procesar la respuesta del servidor'
    }));

    if (typeof window === 'undefined') {
        console.error(`[API Error] ${response.status} ${response.url}:`, errorBody);
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

    const url = IS_SERVER
        ? `${API_URL}${AVAILABILITY_PATH}/tutors/${tutorId}/slots${queryString}`
        : `/api/availability/tutors/${tutorId}/slots${queryString}`;

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

    const url = IS_SERVER
        ? `${API_URL}${AVAILABILITY_PATH}/tutor/slots`
        : `/api/availability/tutor/slots`;

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

    const url = IS_SERVER
        ? `${API_URL}${AVAILABILITY_PATH}/tutor/limits`
        : `/api/availability/tutor/limits`;

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

    const url = IS_SERVER
        ? `${API_URL}${AVAILABILITY_PATH}/tutor/workload`
        : `/api/availability/tutor/workload`;

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

    const url = IS_SERVER
        ? `${API_URL}${AVAILABILITY_PATH}/tutors/me`
        : `/api/availability/me`;

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

    const url = IS_SERVER
        ? `${API_URL}/tutors/profile`
        : `/api/tutors/profile`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<TutorProfile>(response);
}