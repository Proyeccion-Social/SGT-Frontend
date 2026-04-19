import { create } from 'zustand';
import type { TutorAvailabilityPublic, TutorProfile } from '@/features/availability/services/availabilityService';

interface AvailabilityState {
  profile: TutorProfile | null;
  availability: TutorAvailabilityPublic | null;
  
  // Dashboard Metrics
  weeklyHoursUsed: number;
  weeklyHoursLimit: number;
  weeklyHoursRemaining: number;
  totalStudentsReached: number;
  weeklySessionsCount: number;

  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  setProfile: (profile: TutorProfile) => void;
  setAvailability: (availability: TutorAvailabilityPublic) => void;
  setDashboardMetrics: (metrics: Partial<Pick<AvailabilityState, 'weeklyHoursUsed' | 'weeklyHoursLimit' | 'weeklyHoursRemaining' | 'totalStudentsReached' | 'weeklySessionsCount'>>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (timestamp: number) => void;
}

export const useAvailabilityStore = create<AvailabilityState>((set) => ({
  profile: null,
  availability: null,
  
  weeklyHoursUsed: 0,
  weeklyHoursLimit: 0,
  weeklyHoursRemaining: 0,
  totalStudentsReached: 0,
  weeklySessionsCount: 0,

  loading: false,
  error: null,
  lastFetched: null,
  setProfile: (profile) => set({ profile }),
  setAvailability: (availability) => set({ availability }),
  setDashboardMetrics: (metrics) => set((state) => ({ ...state, ...metrics })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastFetched: (lastFetched) => set({ lastFetched }),
}));
