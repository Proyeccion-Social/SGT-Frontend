import type {
    Session,
    CreateSessionDTO,
    SessionTutor,
    CancelSessionResponse,
    ModifySessionBody,
    EditSessionBody,
    RegisterAttendanceDTO,
    RegisterAttendanceResult,
    CompleteSessionResult,
    ConfirmSessionBody,
    ConfirmSessionResult,
    RejectSessionBody,
    RejectSessionResult,
    AcceptModificationResult,
    RejectModificationResult
} from '../types/session.types';

const API_URL = (import.meta.env.API_URL ?? '').replace(/\/$/, '');

export class SessionServiceError extends Error {
    status: number;
    errorCode?: string;
    description?: string;

    constructor(
        message: string,
        status: number,
        errorCode?: string,
        description?: string
    ) {
        super(message);
        this.name = 'SessionServiceError';
        this.status = status;
        this.errorCode = errorCode;
        this.description = description;
    }
}

async function request<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error(`[sessionService] ${options.method ?? 'GET'} ${path} → ${res.status} ${res.statusText}`, JSON.stringify(errorBody));
        throw new SessionServiceError(
            errorBody?.message ?? `HTTP ${res.status}: ${res.statusText}`,
            res.status,
            errorBody?.errorCode,
            errorBody?.description
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

/** POST /scheduling/sessions/individual */
export function createSession(data: CreateSessionDTO, token: string): Promise<Session> {
    return request<Session>('/scheduling/sessions/individual', token, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}



/** GET /scheduling/sessions/my-sessions/{role} */
export async function getSessions(role: string, token: string): Promise<Session[]> {
    const raw = await request<unknown>(
        `/scheduling/sessions/my-sessions/${role.toLowerCase()}`,
        token
    );
    return normalizeMySessionsPayload(raw);
}

/** GET /scheduling/sessions/{sessionId} */
export function getSessionDetail(sessionId: string, token: string): Promise<Session> {
    return request<Session>(`/scheduling/sessions/${sessionId}`, token);
}

/** GET /tutors/{tutorId} */
export function getTutorInfo(tutorId: string, token: string): Promise<SessionTutor> {
    return request<SessionTutor>(`/tutors/${tutorId}`, token);
}

/** DELETE /scheduling/sessions/{sessionId} */
export function cancelSession(
    sessionId: string,
    reason: string,
    token: string
): Promise<CancelSessionResponse> {
    return request<CancelSessionResponse>(
        `/scheduling/sessions/${sessionId}`,
        token,
        { method: 'DELETE', body: JSON.stringify({ reason }) }
    );
}

/** POST /scheduling/sessions/{sessionId}/propose-modification */
export function modifySession(
    sessionId: string,
    body: ModifySessionBody,
    token: string
): Promise<{ success: boolean; message: string }> {
    return request(`/scheduling/sessions/${sessionId}/propose-modification`, token, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/** PATCH /scheduling/sessions/{sessionId}/details */
export function editSession(
    sessionId: string,
    body: EditSessionBody,
    token: string
): Promise<{ success: boolean; message: string; requestId: string; expiresAt: string }> {
    return request(`/scheduling/sessions/${sessionId}/details`, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

/** GET /tutor/{tutorId}/slots */
export function getTutorSlots(tutorId: string, token: string): Promise<unknown> {
    return request(`/tutor/${tutorId}/slots`, token);
}

/** PATCH /scheduling/sessions/{sessionId}/modifications/{requestId}/accept */
export function acceptModification(
    sessionId: string,
    requestId: string,
    token: string
): Promise<AcceptModificationResult> {
    return request(`/scheduling/sessions/${sessionId}/modifications/${requestId}/accept`, token, {
        method: 'PATCH',
    });
}

/** PATCH /scheduling/sessions/{sessionId}/modifications/{requestId}/reject */
export function rejectModification(
    sessionId: string,
    requestId: string,
    token: string
): Promise<RejectModificationResult> {
    return request(`/scheduling/sessions/${sessionId}/modifications/${requestId}/reject`, token, {
        method: 'PATCH',
    });
}

/** PATCH /session-execution/sessions/{sessionId}/attendance */
export function registerAttendance(
    sessionId: string,
    body: RegisterAttendanceDTO,
    token: string
): Promise<RegisterAttendanceResult> {
    return request(`/session-execution/sessions/${sessionId}/attendance`, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

/** GET /scheduling/sessions/{sessionId}/modification-requests */
export function getSessionModifications(sessionId: string, token: string): Promise<unknown> {
    return request(`/scheduling/sessions/${sessionId}/modification-requests`, token);
}

/** POST /scheduling/sessions/{sessionId}/confirm */
export function confirmSession(
    sessionId: string,
    body: ConfirmSessionBody,
    token: string
): Promise<ConfirmSessionResult> {
    return request(`/scheduling/sessions/${sessionId}/confirm`, token, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/** POST /scheduling/sessions/{sessionId}/reject */
export function rejectSession(
    sessionId: string,
    body: RejectSessionBody,
    token: string
): Promise<RejectSessionResult> {
    return request(`/scheduling/sessions/${sessionId}/reject`, token, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/** PATCH /session-execution/sessions/{sessionId}/complete — sin body */
export function registerCompletedSession(
    sessionId: string,
    token: string
): Promise<CompleteSessionResult> {
    return request(`/session-execution/sessions/${sessionId}/complete`, token, {
        method: 'PATCH',
    });
}