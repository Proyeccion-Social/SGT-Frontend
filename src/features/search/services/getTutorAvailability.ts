const API_URL = import.meta.env.API_URL;

// trae la disponibilidad de un tutor específico
export async function getTutorAvailability(tutorId: string, token?: string) {
    const url = `${API_URL}/availability/tutors/${tutorId}/slots`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        Object.assign(headers, {
            'Authorization': `Bearer ${token}`
        });
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || 'Failed to fetch tutor availability');
    }

    return response.json();
}