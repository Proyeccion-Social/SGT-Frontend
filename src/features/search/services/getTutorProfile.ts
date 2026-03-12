const API_URL = import.meta.env.API_URL;

// trae el perfil de un tutor específico
export async function getTutorProfile(id: string) {

    const response = await fetch(`${API_URL}/tutors/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
    }
    console.log("Response from getTutorProfile:", await response.clone().json());
    return response.json();
}