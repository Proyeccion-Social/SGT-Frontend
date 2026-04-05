import type { Session, CreateSessionDTO, AvailabilitySlot, AvailabilityQuery, SessionTutor,
  CancelSessionResponse,
  ModifySessionBody,
  EditSessionBody, } from '../types/session.types';

const API_URL = import.meta.env.PUBLIC_API_URL;

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
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


function getAuthHeaders(): HeadersInit {
    const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createSession(data: CreateSessionDTO, token? : string): Promise<Session> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/scheduling/sessions/individual`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: token }) },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.message ?? 'Error al crear la sesión');
    } else {
      throw new Error(`Error crítico del servidor: Código ${res.status}`);
    }
  }

  return res.json();
}

// ─── Obtener sesiones del usuario autenticado ───────────────
export async function getMySessions(): Promise<Session[]> {
  const res = await fetch(`${API_URL}/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Error al obtener sesiones');
  return res.json();
}

// ─── Obtener sesiones de un tutor específico ────────────────
export async function getSessionsByTutor(tutorId: string): Promise<Session[]> {
  const res = await fetch(`${API_URL}/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Error al obtener sesiones del tutor');
  return res.json();
}

// ─── Consultar disponibilidad ───────────────────────────────
export async function getAvailability(query: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({
    tutorId: query.tutorId,
    fecha: query.date,
    ...(query.modality ? { modality: query.modality } : {}),
  });

  const res = await fetch(`${API_URL}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Error al consultar disponibilidad');
  return res.json();
}

/** GET /sessions/my-sessions/{role} */
export async function getSessions(
  role: 'tutor' | 'student',
  token: string
): Promise<Session[]> {
  console.log('[getSessions] URL:', `${API_URL}/scheduling/sessions/my-sessions/${role}`);
  const res = await request<{ data: Session[] }>(
    `/scheduling/sessions/my-sessions/${role}`,
    token
  );
  return res.data;
}
 
/** GET /scheduling/sessions/{sessionId} */
export function getSessionDetail(
  sessionId: string,
  token: string
): Promise<Session> {
  return request<Session>(`/scheduling/sessions/${sessionId}`, token);
}
 
/** GET /tutors/{tutorId} */
export function getTutorInfo(
  tutorId: string,
  token: string
): Promise<SessionTutor> {
  return request<SessionTutor>(`/tutors/${tutorId}`, token);
}
 
/** DELETE /scheduling/sessions/{sessionId}
 *  Q3 answer: body includes { reason: string }
 */
export function cancelSession(
  sessionId: string,
  reason: string,
  token: string
): Promise<CancelSessionResponse> {
  return request<CancelSessionResponse>(
    `/scheduling/sessions/${sessionId}`,
    token,
    {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }
  );
}
 
/** POST /scheduling/sessions/{sessionId} */
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
 
/** PATCH /scheduling/sessions/{sessionId}
 *  Q4 answer: body includes virtualLink and location
 */
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
 
/** GET /tutor/{tutorId}/slots — Q2 answer */
export function getTutorSlots(
  tutorId: string,
  token: string
): Promise<unknown> {
  return request(`/tutor/${tutorId}/slots`, token);
}
 
