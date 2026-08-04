const API_URL = import.meta.env.API_URL;

// trae las calificaciones reales de un tutor (resumen agregado)
export async function getTutorRatings(tutorId: string, token: string) {
    const response = await fetch(
        `${API_URL}/session-execution/tutors/${tutorId}/evaluations?page=1&limit=1`,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to fetch tutor ratings');
    }

    return response.json();
}
