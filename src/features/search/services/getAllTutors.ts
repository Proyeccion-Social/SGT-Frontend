const API_URL = import.meta.env.API_URL;
const IS_SERVER = typeof window === 'undefined';

// trae todos los tutores disponibles (sin filtros, el filtrado se hace en el frontend)
export async function getAllTutors() {
    const url = IS_SERVER
        ? `${API_URL}/availability/tutors/slots`
        : `/api/search`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch tutors');
    }

    return response.json();
}