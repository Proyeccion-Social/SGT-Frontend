const API_URL = import.meta.env.API_URL;
const IS_SERVER = typeof window === 'undefined';

// trae la disponibilidad de un tutor específico
export async function getTutorAvailability(tutorId: string) {
    const url = IS_SERVER
        ? `${API_URL}/availability/tutors/${tutorId}/slots`
        : `/api/availability/tutors/${tutorId}/slots`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch tutor availability');
    }

    return response.json();
}