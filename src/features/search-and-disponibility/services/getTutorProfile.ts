const API_URL = import.meta.env.API_URL;


export async function getTutorProfile(id: string) {

    const response = await fetch(`${API_URL}/tutors/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
    }

    return response.json();
}