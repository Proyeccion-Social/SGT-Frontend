const API_URL = import.meta.env.API_URL;

export interface TutorsBySubjectResponse {
    success: boolean;
    subject: {
        id?: string;
        name: string;
    };
    data: any[];
    total: number;
}

// trae los tutores disponibles para una materia específica
export async function getTutorsBySubject(
    subjectId: string,
    token: string,
): Promise<TutorsBySubjectResponse> {
    const url = `${API_URL}/availability/subjects/${subjectId}/tutors`;

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