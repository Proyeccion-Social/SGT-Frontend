import type {
    Session,
    CreateSessionDTO,
    AvailabilitySlot,
    AvailabilityQuery,
    SessionTutor,
    CancelSessionResponse,
    ModifySessionBody,
    EditSessionBody,
    RegisterAttendanceDTO,
    RegisterAttendanceResult,
    CompleteSessionBody,
    CompleteSessionResult
} from '../types/session.types';

import { UserRole } from '@/constants/roles';

/** Base URL for API calls (server BFF uses API_URL; browser falls back to PUBLIC_*) */
const API_BASE = (
    import.meta.env.API_URL ??
    import.meta.env.PUBLIC_API_URL ??
    ''
).replace(/\/$/, '');
const IS_SERVER = typeof window === 'undefined';

async function request<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
            errorBody?.message ?? `HTTP ${res.status}: ${res.statusText}`
        );
    }

    return res.json() as Promise<T>;
}




function normalizeMySessionsPayload(raw: unknown): Session[] {
    if (Array.isArray(raw)) return raw as Session[];
    if (raw && typeof raw === 'object' && 'data' in raw) {
        const data = (raw as { data: unknown }).data;
        if (Array.isArray(data)) return data as Session[];
    }
    return [];
}

export async function createSession(data: CreateSessionDTO): Promise<Session> {
    const res = await fetch(`/api/sessions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const error = await res.json();
            throw new Error(error.message ?? 'Error al crear la sesión');
        } else {
            throw new Error(`Error del servidor: Código ${res.status}`);
        }
    }

    return res.json();
}



/** GET /scheduling/sessions/my-sessions/{role} */
export async function getSessions(
    role: UserRole,
    token?: string
): Promise<Session[]> {
    if (!IS_SERVER) {
        const res = await fetch(`/api/sessions/my-sessions?role=${role.toLowerCase()}`);
        if (!res.ok) throw new Error('Error al obtener sesiones');
        const json = await res.json();
        return normalizeMySessionsPayload(json);
    }
    const raw = await request<unknown>(
        `/scheduling/sessions/my-sessions/${role.toLowerCase()}`,
        token!
    );
    return normalizeMySessionsPayload(raw);
}

/** GET /scheduling/sessions/{sessionId} */
export async function getSessionDetail(
    sessionId: string,
    token?: string
): Promise<Session> {
    if (!IS_SERVER) {
        const res = await fetch(`/api/sessions/detail?sessionId=${sessionId}`);
        if (!res.ok) throw new Error('Error al obtener detalle de sesión');
        return res.json();
    }
    return request<Session>(`/scheduling/sessions/${sessionId}`, token!);
}

/** GET /tutors/{tutorId} */
export async function getTutorInfo(
    tutorId: string,
    token?: string
): Promise<SessionTutor> {
    if (!IS_SERVER) {
        const res = await fetch(`/api/sessions/tutor-info?tutorId=${tutorId}`);
        if (!res.ok) throw new Error('Error al obtener info del tutor');
        return res.json();
    }
    return request<SessionTutor>(`/tutors/${tutorId}`, token!);
}

/** DELETE /scheduling/sessions/{sessionId}
 *  Q3 answer: body includes { reason: string }
 */
export async function cancelSession(
    sessionId: string,
    reason: string,
    token?: string
): Promise<CancelSessionResponse> {
    if (IS_SERVER && token) {
        return request<CancelSessionResponse>(
            `/scheduling/sessions/${sessionId}`,
            token,
            { method: 'DELETE', body: JSON.stringify({ reason }) }
        );
    }
    const res = await fetch(`/api/sessions/cancel-session`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason }),
    });
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? `Error al cancelar sesión`);
    }
    return res.json();
}

export async function modifySession(
    sessionId: string,
    body: ModifySessionBody,
    token?: string
): Promise<{ success: boolean; message: string }> {
    if (IS_SERVER && token) {
        return request<{ success: boolean; message: string }>(
            `/scheduling/sessions/${sessionId}/propose-modification`,
            token,
            { method: 'POST', body: JSON.stringify(body) }
        );
    }
    const res = await fetch(`/api/sessions/modify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...body }),
    });
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? `Error al proponer modificación`);
    }
    return res.json();
}

export async function editSession(
    sessionId: string,
    body: EditSessionBody,
    token?: string
): Promise<{ success: boolean; message: string; requestId: string; expiresAt: string }> {
    if (IS_SERVER && token) {
        return request<{ success: boolean; message: string; requestId: string; expiresAt: string }>(
            `/scheduling/sessions/${sessionId}/details`,
            token,
            { method: 'PATCH', body: JSON.stringify(body) }
        );
    }
    const res = await fetch(`/api/sessions/edit-session`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...body }),
    });
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? `Error al editar la sesión`);
    }
    return res.json();
}

/** GET /tutor/{tutorId}/slots — Q2 answer */
export async function getTutorSlots(
    tutorId: string,
    token?: string
): Promise<unknown> {
    if (!IS_SERVER) {
        const res = await fetch(`/api/availability/tutors/${tutorId}/slots`);
        if (!res.ok) throw new Error('Error al obtener slots del tutor');
        return res.json();
    }
    return request(`/tutor/${tutorId}/slots`, token!);
}

/** PATCH /session-execution/sessions/{sessionId}/attendance */
export async function registerAttendance(
    sessionId: string,
    body: RegisterAttendanceDTO,
    token?: string
): Promise<RegisterAttendanceResult> {
    if (!IS_SERVER) {
        const res = await fetch(`/api/sessions/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, ...body })
        });
        if (!res.ok) throw new Error('Error al registrar asistencia');
        return res.json();
    }
    return request(`/session-execution/sessions/${sessionId}/attendance`, token!, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

/** PATCH /session-execution/sessions/{sessionId}/complete */
export async function registerCompletedSession(
    sessionId: string,
    body: CompleteSessionBody,
    token?: string
): Promise<CompleteSessionResult> {
    if (!IS_SERVER) {
        // Shared endpoint in our current BFF for attendance/completion
        const res = await fetch(`/api/sessions/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, ...body, isCompletion: true })
        });
        if (!res.ok) throw new Error('Error al completar sesión');
        return res.json();
    }
    return request(`/session-execution/sessions/${sessionId}/complete`, token!, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}
