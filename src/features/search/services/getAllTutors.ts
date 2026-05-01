const API_URL = import.meta.env.API_URL;
const IS_SERVER = typeof window === 'undefined';

// trae todos los tutores disponibles (sin filtros, el filtrado se hace en el frontend)
export async function getAllTutors(token?: string) {
    const response = await fetch(`${API_URL}/availability/tutors/slots`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch tutors');
    }

    return response.json();
}
