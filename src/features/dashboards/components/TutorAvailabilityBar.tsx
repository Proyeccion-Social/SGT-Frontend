import '@/features/dashboards/styles/TutorAvailabilityBar.css';

interface TutorAvailabilityBarProps {
    completedHours: number;
    upcomingHours: number;
    totalMaxHours: number;
    loading: boolean;
    error: string | null;
}

export const TutorAvailabilityBar = ({
    completedHours,
    upcomingHours,
    totalMaxHours,
    loading,
    error
}: TutorAvailabilityBarProps) => {
    if (loading) {
        return (
            <div className="hours-bar skeleton-pulse" style={{ backgroundColor: '#f0f0f0', height: '60px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '2rem', color: '#999' }}>
                    Cargando disponibilidad...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hours-bar" style={{ backgroundColor: '#ffecec', height: '60px', borderRadius: '12px', border: '1px solid #ffc1c1' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '2rem', color: '#d32f2f' }}>
                    {error}
                </div>
            </div>
        );
    }

    const completedPercent = totalMaxHours > 0 ? Math.min((completedHours / totalMaxHours) * 100, 100) : 0;
    const upcomingPercent = totalMaxHours > 0 ? Math.min((upcomingHours / totalMaxHours) * 100, 100 - completedPercent) : 0;
    const remainingHours = Math.max(totalMaxHours - completedHours - upcomingHours, 0);

    return (
        <div className="hours-bar">
            {completedHours > 0 && (
                <div className="hours-segment-taught" title={`${completedHours}h enseñadas`}>
                    <span className="taught-hours-text">
                        {completedHours}h enseñada{completedHours !== 1 ? 's' : ''}
                    </span>
                </div>
            )}
            
            <span className="remaining-hours-text">
                {remainingHours} hora{remainingHours !== 1 ? 's' : ''} disponible{remainingHours !== 1 ? 's' : ''} esta semana
            </span>
        </div>
    );
};

export default TutorAvailabilityBar;