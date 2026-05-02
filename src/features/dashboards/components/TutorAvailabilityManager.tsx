import { useAvailabilityStore } from '@/store/availabilityStore';
import { TutorAvailabilityBar } from './TutorAvailabilityBar';

// Auxiliares para cálculo de semana (Lunes-Domingo)
export const TutorAvailabilityManager = () => {
    // 1. Consume dashboard metrics from global state
    const { 
        weeklyHoursUsed,
        weeklyHoursLimit,
        loading, 
        error 
    } = useAvailabilityStore();

    return (
        <TutorAvailabilityBar 
            completedHours={weeklyHoursUsed}
            upcomingHours={0} // We only have "used" and "limit" from the dashboard for now
            totalMaxHours={weeklyHoursLimit}
            loading={loading}
            error={error}
        />
    );
};

export default TutorAvailabilityManager;
