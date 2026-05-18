import { UserRole } from "@/constants/roles";
import type { TutorDashboardResponse, StudentDashboardResponse } from "../types/dashboard.types";
import { useSessionStore } from "@/store/sessionStore";
import { useAvailabilityStore } from "@/store/availabilityStore";
import { mapDashboardSessions } from "../utils/dashboardMapper";
import { useCallback, useState } from "react";

const API_BASE = (
  import.meta.env.API_URL ??
  ''
).replace(/\/$/, '');

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

export async function getTutorDashboard(token: string): Promise<TutorDashboardResponse> {
  return request<TutorDashboardResponse>('/dashboard/tutor', token);
}

export async function getStudentDashboard(token: string): Promise<StudentDashboardResponse> {
  return request<StudentDashboardResponse>('/dashboard/student', token);
}

// Client-side wrappers for BFF
export async function fetchTutorDashboardBFF(): Promise<TutorDashboardResponse> {
  const res = await fetch('/api/dashboard/tutor');
  if (!res.ok) throw new Error('Error al obtener dashboard de tutor');
  return res.json();
}

export async function fetchStudentDashboardBFF(): Promise<StudentDashboardResponse> {
  const res = await fetch('/api/dashboard/student');
  if (!res.ok) throw new Error('Error al obtener dashboard de estudiante');
  return res.json();
}

export function useDashboardData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setSessions, setLoading: setStoreLoading, setError: setStoreError } = useSessionStore();
  const { setDashboardMetrics, setLastFetched } = useAvailabilityStore();

  const loadTutorDashboard = useCallback(async () => {
    setLoading(true);
    setStoreLoading(true);
    setError(null);
    setStoreError(null);
    try {
      const data = await fetchTutorDashboardBFF();
      const sessions = mapDashboardSessions(data.upcomingSessions, UserRole.TUTOR);
      
      setSessions(sessions);
      setDashboardMetrics({
        weeklyHoursUsed: data.weeklyHoursUsed,
        weeklyHoursLimit: data.weeklyHoursLimit,
        weeklyHoursRemaining: data.weeklyHoursRemaining,
        totalStudentsReached: data.totalStudentsReached
      });
      setLastFetched(Date.now());
    } catch (err: any) {
      setError(err.message);
      setStoreError(err.message);
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  }, [setSessions, setDashboardMetrics, setLastFetched, setStoreLoading, setStoreError]);

  const loadStudentDashboard = useCallback(async () => {
    setLoading(true);
    setStoreLoading(true);
    setError(null);
    setStoreError(null);
    try {
      const data = await fetchStudentDashboardBFF();
      const sessions = mapDashboardSessions(data.upcomingSessions, UserRole.STUDENT);
      
      setSessions(sessions);
      setDashboardMetrics({
        weeklySessionsCount: data.weeklySessionsCount
      });
      setLastFetched(Date.now());
    } catch (err: any) {
      setError(err.message);
      setStoreError(err.message);
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  }, [setSessions, setDashboardMetrics, setLastFetched, setStoreLoading, setStoreError]);

  return { loading, error, loadTutorDashboard, loadStudentDashboard };
}
