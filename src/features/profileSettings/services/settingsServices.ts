const API_URL = import.meta.env.API_URL;
const STUDENTS_PATH = '/students/me';

//===============================================================
// Types
//===============================================================
export type PreferredModality = 'PRES' | 'VIRT';

export interface StudentPreferences {
    career: string | null;
    preferredModality: PreferredModality | null;
}

export interface UpdatePreferencesDto {
    career?: string;
    preferredModality?: PreferredModality;
}

export interface Subject {
    id: string;
    name: string;
}

export interface ApiError {
    code: string;
    httpStatus: number | string;
    message: string;
    description: string;
}

//===============================================================
// Helpers
//===============================================================
function getToken(): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; access_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

// token puede venir del caller (server-side BFF) o de document.cookie (client-side)
function buildAuthHeaders(token?: string): HeadersInit {
    const tok = token ?? getToken();
    if (!tok) throw new Error('AUTH_05: No hay token de sesión. Por favor inicia sesión.');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tok}`,
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        if (response.status === 204) return undefined as T;
        return response.json() as Promise<T>;
    }

    const errorBody: ApiError = await response.json().catch(() => ({
        code: 'INTERNAL_01',
        httpStatus: response.status,
        message: 'Error interno del servidor',
        description: 'Error al procesar la respuesta del servidor',
    }));
    throw errorBody;
}

//===============================================================
// Services — Preferences
//===============================================================

/**
 * GET /api/v1/students/me/preferences
 * Obtiene las preferencias del estudiante autenticado (carrera y modalidad preferida).
 * Cualquier campo puede llegar como null si no ha sido configurado.
 */
export async function getStudentPreferences(token?: string): Promise<StudentPreferences> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}${STUDENTS_PATH}/preferences`, {
        method: 'GET',
        headers,
    });
    return handleResponse<StudentPreferences>(response);
}

/**
 * PATCH /api/v1/students/me/preferences
 * Actualiza carrera o modalidad preferida. Ambos campos son opcionales.
 *
 * Posibles errores:
 * - VALIDATION_01 (400): career fuera de rango (mín 3 / máx 100 chars) o preferredModality inválida.
 * - AUTH_01 (401): Token inválido o expirado.
 * - AUTH_05 (401): No hay token de sesión.
 */
export async function updateStudentPreferences(dto: UpdatePreferencesDto, token?: string): Promise<StudentPreferences> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}${STUDENTS_PATH}/preferences`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(dto),
    });
    return handleResponse<StudentPreferences>(response);
}

//===============================================================
// Services — Tutor Profile
//===============================================================

export interface TutorProfileData {
    phone?: string | null;
    maxWeeklyHours: number | null;
}

export interface UpdateTutorProfileDto {
    phone?: string;
    max_weekly_hours?: number;
}

export interface TutorHoursStatus {
    tutorId: string;
    weeklyHoursUsed: number;
    weeklyHoursRemaining: number;
    usedPercentage: number;
    remainingPercentage: number;
    consultedAt: string;
}

export async function toggleTutorActive(isActive: boolean, token?: string): Promise<void> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}/tutors/active`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive }),
    });
    await handleResponse<unknown>(response);
}

export async function getTutorHoursStatus(tutorId: string, token?: string): Promise<TutorHoursStatus> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}/tutors/${tutorId}/hours-status`, {
        method: 'GET',
        headers,
    });
    return handleResponse<TutorHoursStatus>(response);
}

export async function getTutorProfileData(token?: string): Promise<TutorProfileData> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}/tutors/profile`, {
        method: 'GET',
        headers,
    });
    return handleResponse<TutorProfileData>(response);
}

/**
 * PATCH /api/v1/tutors/profile/update
 * Actualiza el perfil del tutor autenticado. Todos los campos son opcionales.
 *
 * Posibles errores:
 * - VALIDATION_01 (400): phone con formato inválido.
 * - AUTH_01 (401): Token inválido o expirado.
 * - AUTH_05 (401): No hay token de sesión.
 */
export async function updateTutorProfile(dto: UpdateTutorProfileDto, token?: string): Promise<void> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}/tutors/profile/update`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(dto),
    });
    await handleResponse<unknown>(response);
}

//===============================================================
// Services — Interested Subjects
//===============================================================

/**
 * GET /api/v1/students/me/interested-subjects
 * Obtiene las materias de interés del estudiante autenticado.
 * Si no tiene materias registradas, subjects llega como array vacío.
 */
export async function getStudentSubjects(token?: string): Promise<Subject[]> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}${STUDENTS_PATH}/interested-subjects`, {
        method: 'GET',
        headers,
    });
    const result = await handleResponse<{ subjects: Subject[] }>(response);
    return result.subjects ?? [];
}

/**
 * PATCH /api/v1/students/me/interested-subjects
 * Reemplaza toda la lista de materias de interés.
 * Enviar array vacío limpia la selección.
 *
 * Posibles errores:
 * - VALIDATION_01 (400): UUIDs inválidos, más de 10 elementos, o duplicados.
 * - AUTH_01 (401): Token inválido o expirado.
 * - AUTH_05 (401): No hay token de sesión.
 */
export async function updateStudentSubjects(subjectIds: string[], token?: string): Promise<Subject[]> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_URL}${STUDENTS_PATH}/interested-subjects`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ subjectIds }),
    });
    const result = await handleResponse<{ subjects: Subject[] }>(response);
    return result.subjects ?? [];
}
