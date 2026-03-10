const API_URL = import.meta.env.API_URL;

export interface TutorsBySubjectFilters {
    subjectId?: string;
    subjectName?: string;
    modality?: string;
    onlyAvailable?: boolean;
}

export interface TutorsBySubjectResponse {
    success: boolean;
    subject: {
        id?: string;
        name: string;
    };
    data: any[];
    total: number;
}

// GET /api/v1/availability/tutors/subject
// RF-14: Visualizar tutores por materia (Código o Nombre) con su disponibilidad
export async function getTutorsBySubject(
    filters: TutorsBySubjectFilters,
    token: string,
): Promise<TutorsBySubjectResponse> {
    const params = new URLSearchParams();

    if (filters.subjectId) params.append("subjectId", filters.subjectId);
    if (filters.subjectName) params.append("subjectName", filters.subjectName);
    if (filters.modality) params.append("modality", filters.modality);
    if (filters.onlyAvailable !== undefined) params.append("onlyAvailable", String(filters.onlyAvailable));

    const url = `${API_URL}/availability/tutors/subject?${params.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error interno del servidor",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}