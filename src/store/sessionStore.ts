import { create } from 'zustand';
import type { Session } from '@/features/sessions/types/session.types';

interface SessionState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  setSessions: (sessions: Session[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (timestamp: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  loading: false,
  error: null,
  lastFetched: null,
  setSessions: (sessions) => set({ sessions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastFetched: (lastFetched) => set({ lastFetched }),
}));
