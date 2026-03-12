const API_URL = import.meta.env.API_URL;

// trae todos los tutores disponibles (sin filtros, el filtrado se hace en el frontend)
export async function getAllTutors() {
    const response = await fetch(`${API_URL}/availability/tutors/slots`);

    if (!response.ok) {
        throw new Error('Failed to fetch tutors');
    }

    return response.json();
}