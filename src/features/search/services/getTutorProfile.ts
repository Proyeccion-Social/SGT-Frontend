const API_URL = import.meta.env.API_URL;

// trae el perfil de un tutor específico
export async function getTutorProfile(id: string) {
    const url = `${API_URL}/tutors/${id}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
    }
    return response.json();
}