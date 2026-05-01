import type {
  Session,
  CreateSessionDTO,
  AvailabilitySlot,
  AvailabilityQuery,
  SessionTutor,
  CancelSessionResponse,
  ModifySessionBody,
  EditSessionBody,
} from '../types/session.types';

const API_URL = import.meta.env.API_URL || import.meta.env.PUBLIC_API_URL;

// ─── Generic request helper (server-side, with token) ───────
async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const res = await fetch(`${API_URL}${path}${separator}t=${Date.now()}`, {
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

// ─── Client-side auth headers (cookie-based) ────────────────
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

// ─── Crear sesión ───────────────────────────────────────────
export async function createSession(data: CreateSessionDTO): Promise<Session> {
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? 'Error al crear la sesión');
  }

  return res.json();
}

// ─── Obtener sesiones del usuario autenticado (client) ──────
export async function getMySessions(): Promise<Session[]> {
  const res = await fetch(`${API_URL}/`, {
    headers: getAuthHeaders(),
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Error al obtener sesiones');
  return res.json();
}

// ─── Obtener sesiones por rol (server-side BFF) ─────────────
export async function getSessions(
  role: 'tutor' | 'student',
  token: string
): Promise<Session[]> {
  const res = await request<{ data: Session[] }>(
    `/scheduling/sessions/my-sessions/${role}`,
    token
  );
  return res.data;
}

// ─── Obtener detalle de sesión (server-side BFF) ────────────
export function getSessionDetail(
  sessionId: string,
  token: string
): Promise<Session> {
  return request<Session>(`/scheduling/sessions/${sessionId}`, token);
}

// ─── Obtener info del tutor (server-side BFF) ───────────────
export function getTutorInfo(
  tutorId: string,
  token: string
): Promise<SessionTutor> {
  return request<SessionTutor>(`/tutors/${tutorId}`, token);
}

// ─── Cancelar sesión (server-side BFF) ──────────────────────
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

// ─── Proponer modificación (server-side BFF) ────────────────
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

// ─── Editar sesión (server-side BFF) ────────────────────────
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

// ─── Confirmar sesión (server-side BFF) ─────────────────────
export function confirmSession(
  sessionId: string,
  token: string
): Promise<{ message: string }> {
  return request(`/scheduling/sessions/${sessionId}/confirm`, token, {
    method: 'POST',
  });
}

// ─── Rechazar sesión (server-side BFF) ──────────────────────
export function rejectSession(
  sessionId: string,
  reason: string,
  token: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/scheduling/sessions/${sessionId}/reject`, token, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ─── Obtener detalle de modification-request (server-side) ──
export function getModificationRequest(
  requestId: string,
  token: string
): Promise<any> {
  // Nota: El backend ya corrigió el bug del @Param('id'), así que usamos la ruta original
  return request(`/scheduling/sessions/${requestId}/modification-request`, token);
}

// ─── Aceptar modification-request (server-side) ─────────────
export function acceptModificationRequest(
  sessionId: string,
  requestId: string,
  token: string
): Promise<{ message: string }> {
  return request(`/scheduling/sessions/${sessionId}/modifications/${requestId}/accept`, token, {
    method: 'PATCH',
  });
}

// ─── Rechazar modification-request (server-side) ────────────
export function rejectModificationRequest(
  sessionId: string,
  requestId: string,
  token: string
): Promise<{ message: string }> {
  return request(`/scheduling/sessions/${sessionId}/modifications/${requestId}/reject`, token, {
    method: 'PATCH',
  });
}

// ─── Consultar disponibilidad ───────────────────────────────
export async function getAvailability(query: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({
    tutorId: query.tutorId,
    fecha: query.date,
    ...(query.modality ? { modality: query.modality } : {}),
  });

  const res = await fetch(`${API_URL}?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Error al consultar disponibilidad');
  return res.json();
}

// ─── Obtener slots de un tutor (server-side BFF) ────────────
export function getTutorSlots(
  tutorId: string,
  token: string
): Promise<unknown> {
  return request(`/tutor/${tutorId}/slots`, token);
}
