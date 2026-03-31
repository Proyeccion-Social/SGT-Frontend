import type { Session, CreateSessionDTO, AvailabilitySlot, AvailabilityQuery } from '../types/session.types';

const API_URL = import.meta.env.PUBLIC_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED'); // ← distinguible en el hook
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Error ${res.status}`);
  }
  return res.json();
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

// ─── Cancelar sesión ────────────────────────────────────────
export async function cancelSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_URL}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? 'Error al cancelar la sesión');
  }
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
