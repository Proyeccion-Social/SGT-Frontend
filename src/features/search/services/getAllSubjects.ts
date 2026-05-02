const API_URL = import.meta.env.API_URL;

// GET /api/v1/subjects — requiere JWT
export async function getAllSubjects(accessToken: string) {
    const response = await fetch(`${API_URL}/subjects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error al obtener las materias",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}
