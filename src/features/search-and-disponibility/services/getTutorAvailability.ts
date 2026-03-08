const API_URL = import.meta.env.API_URL;

export async function getTutorAvailability(tutorId: string) {

    const response = await fetch(`${API_URL}/availability/tutors/${tutorId}/slots`);

    if (!response.ok) {
        throw new Error('Failed to fetch tutor availability');
    }

    return response.json();
}