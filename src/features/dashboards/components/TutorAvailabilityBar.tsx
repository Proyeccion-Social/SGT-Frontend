import { useEffect, useState } from 'react';
import type { TutorAvailabilityPublic, TutorProfile } from '@/features/availability/services/availabilityService';
import '@/features/dashboards/styles/TutorAvailabilityBar.css';

export const TutorAvailabilityBar = () => {
    const [availability, setAvailability] = useState<TutorAvailabilityPublic | null>(null);
    const [profile, setProfile] = useState<TutorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [availRes, profRes] = await Promise.all([
                    fetch('/api/availability/me'),
                    fetch('/api/tutors/profile')
                ]);

                if (!availRes.ok || !profRes.ok) {
                    throw new Error('Error al obtener datos del tutor');
                }

                const [availData, profData] = await Promise.all([
                    availRes.json(),
                    profRes.json()
                ]);

                setAvailability(availData);
                setProfile(profData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="hours-bar skeleton-pulse" style={{ backgroundColor: '#f0f0f0', height: '60px', margin: '0 10rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '2rem', color: '#999' }}>
                    Cargando disponibilidad...
                </div>
            </div>
        );
    }

    if (error || !availability || !profile) {
        return (
            <div className="hours-bar" style={{ backgroundColor: '#ffecec', height: '60px', margin: '0 10rem', borderRadius: '12px', border: '1px solid #ffc1c1' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '2rem', color: '#d32f2f' }}>
                    {error || 'No se pudo cargar la información del tutor'}
                </div>
            </div>
        );
    }

    // Lógica de cálculo basada en las nuevas especificaciones:
    // Total (100%) = maxWeeklyHours del perfil
    // Usado = espacios actualmente agendados (totalSlots - availableSlots)
    const totalMaxHours = profile.maxWeeklyHours || 0;
    const scheduledHours = (availability.totalSlots || 0) - (availability.availableSlots?.length || 0);
    
    const usedPercent = totalMaxHours > 0 ? Math.min((scheduledHours / totalMaxHours) * 100, 100) : 0;
    const remainingPercent = 100 - usedPercent;
    const remainingHours = Math.max(totalMaxHours - scheduledHours, 0);

    return (
        <div className="hours-bar">
            {usedPercent > 0 && (
                <div 
                    className="hours-segment-hours-scheduled" 
                    style={{ width: `${usedPercent}%` }}
                >
                    <span className="scheduled-hours-text">
                        {scheduledHours} hora{scheduledHours !== 1 ? 's' : ''} agendada{scheduledHours !== 1 ? 's' : ''} esta semana
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