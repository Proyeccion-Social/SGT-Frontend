import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Subject {
    id: string;
    name: string;
    color: string;
    borderColor: string;
}

interface SubjectState {
    subjects: Subject[];
    colorMap: Record<string, { color: string; borderColor: string }>;
    isLoading: boolean;
    error: string | null;
    _hasHydrated: boolean;
    setHasHydrated: (val: boolean) => void;
    fetchSubjects: (token?: string) => Promise<void>;
    setSubjects: (subjects: Subject[]) => void;
    getColorBySubject: (name: string) => { color: string; borderColor: string };
    clearSubjects: () => void;
}

/**
 * Subject Store
 * 
 * Manages the global list of subjects and their associated colors.
 * Data is fetched from the backend (Source of Truth) and persisted in localStorage
 * to allow fast access across different parts of the application and multiple tabs.
 */
export const useSubjectStore = create<SubjectState>()(
    persist(
        (set, get) => ({
            subjects: [],
            colorMap: {},
            isLoading: false,
            error: null,
            _hasHydrated: false,

            setHasHydrated: (val) => set({ _hasHydrated: val }),

            setSubjects: (subjects) => {
                const colorMap: Record<string, { color: string; borderColor: string }> = {};
                subjects.forEach((s) => {
                    colorMap[s.name] = {
                        color: s.color || 'transparent',
                        borderColor: s.borderColor || 'transparent',
                    };
                });
                set({ subjects, colorMap });
            },

            fetchSubjects: async (token) => {
                // If we already have subjects and it's not a forced refresh, we could skip.
                // But the caller (StoreHydrator) already handles the logic of when to fetch.
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch('/api/subjects', {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (!response.ok) throw new Error('Failed to fetch subjects');
                    
                    const result = await response.json();
                    const subjectsData = result.data || result;
                    const subjects = Array.isArray(subjectsData) ? subjectsData : [];
                    
                    const colorMap: Record<string, { color: string; borderColor: string }> = {};
                    subjects.forEach((s: Subject) => {
                        colorMap[s.name] = {
                            color: s.color,
                            borderColor: s.borderColor,
                        };
                    });

                    set({ subjects, colorMap, isLoading: false });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            getColorBySubject: (name: string) => {
                const { colorMap } = get();
                // Return the mapped color or a fallback if the subject is not found
                return colorMap[name] || { color: 'transparent', borderColor: 'transparent' };
            },

            clearSubjects: () => set({ subjects: [], colorMap: {}, error: null })
        }),
        {
            name: 'subject-storage',
            version: 1, // Incremented version to clear old hardcoded cached data
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
