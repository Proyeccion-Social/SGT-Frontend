const API_URL = import.meta.env.API_URL;
const IS_SERVER = typeof window === 'undefined';

// trae el perfil de un tutor específico
export async function getTutorProfile(id: string) {
    const url = IS_SERVER
        ? `${API_URL}/tutors/${id}`
        : `/api/search/${id}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
    }
    return response.json();
}