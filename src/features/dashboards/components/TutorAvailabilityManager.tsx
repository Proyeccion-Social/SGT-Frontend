import { useEffect, useMemo } from 'react';
import { useSession } from '@/features/sessions/hooks/useSession';
import { useAvailabilityStore } from '@/store/availabilityStore';
import { TutorAvailabilityBar } from './TutorAvailabilityBar';

// Auxiliares para cálculo de semana (Lunes-Domingo)
const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0: Dom, 1: Lun... 6: Sab
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
};

const isInCurrentWeek = (dateStr: string) => {
    const { monday, sunday } = getWeekRange();
    const date = new Date(`${dateStr}T00:00:00`);
    return date >= monday && date <= sunday;
};

export const TutorAvailabilityManager = () => {
    // 1. Consumir sesiones del estado global (vía hook compartido)
    const { sessions, loading: sessionsLoading, error: sessionsError } = useSession('tutor');

    // 2. Consumir perfil/disponibilidad del estado global
    const { 
        profile, 
        availability, 
        loading: availLoading, 
        error: availError,
        setProfile,
        setAvailability,
        setLoading,
        setError,
        lastFetched,
        setLastFetched
    } = useAvailabilityStore();

    useEffect(() => {
        const fetchAvailabilityData = async () => {
            // Evitar fetch si ya se cargó recientemente (30 segs)
            if (lastFetched && Date.now() - lastFetched < 30000) return;

            setLoading(true);
            setError(null);
            try {
                const [availRes, profRes] = await Promise.all([
                    fetch('/api/availability/me', { credentials: 'include' }),
                    fetch('/api/tutors/profile', { credentials: 'include' })
                ]);

                if (!availRes.ok || !profRes.ok) {
                    throw new Error('Error al obtener disponibilidad del tutor');
                }

                const [availData, profData] = await Promise.all([
                    availRes.json(),
                    profRes.json()
                ]);

                setAvailability(availData);
                setProfile(profData);
                setLastFetched(Date.now());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailabilityData();
    }, [lastFetched, setAvailability, setError, setLoading, setProfile, setLastFetched]);

    // 3. Procesamiento de información (Cálculos semanales)
    const stats = useMemo(() => {
        if (!profile || !availability) return null;

        const totalMaxHours = profile.maxWeeklyHours || 0;
        const currentWeekSessions = sessions.filter(s => isInCurrentWeek(s.scheduledDate));

        const completedHours = currentWeekSessions
            .filter(s => s.status === 'COMPLETED')
            .reduce((acc, s) => acc + (s.duration || 0), 0);

        const totalBookedSlots = (availability.totalSlots || 0) - (availability.availableSlots?.length || 0);
        const upcomingHours = Math.max(totalBookedSlots - completedHours, 0);

        return { completedHours, upcomingHours, totalMaxHours };
    }, [sessions, profile, availability]);

    const isLoading = sessionsLoading || availLoading;
    const error = sessionsError || availError;

    return (
        <TutorAvailabilityBar 
            completedHours={stats?.completedHours || 0}
            upcomingHours={stats?.upcomingHours || 0}
            totalMaxHours={stats?.totalMaxHours || 0}
            loading={isLoading}
            error={error}
        />
    );
};

export default TutorAvailabilityManager;
