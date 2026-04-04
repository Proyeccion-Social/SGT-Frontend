import { create } from 'zustand';
import type { TutorAvailabilityPublic, TutorProfile } from '@/features/availability/services/availabilityService';

interface AvailabilityState {
  profile: TutorProfile | null;
  availability: TutorAvailabilityPublic | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  setProfile: (profile: TutorProfile) => void;
  setAvailability: (availability: TutorAvailabilityPublic) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (timestamp: number) => void;
}

export const useAvailabilityStore = create<AvailabilityState>((set) => ({
  profile: null,
  availability: null,
  loading: false,
  error: null,
  lastFetched: null,
  setProfile: (profile) => set({ profile }),
  setAvailability: (availability) => set({ availability }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastFetched: (lastFetched) => set({ lastFetched }),
}));
