const API_URL = import.meta.env.API_URL;
const IS_SERVER = typeof window === 'undefined';

// trae todas las materias disponibles
// GET /api/v1/subjects (público)
export async function getAllSubjects(token?: string) {
    const response = await fetch(`${API_URL}/subjects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error al obtener las materias",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}
