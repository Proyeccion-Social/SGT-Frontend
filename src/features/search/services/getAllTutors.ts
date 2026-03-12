const API_URL = import.meta.env.API_URL;


// trae todos los tutores disponibles, con la posibilidad de filtrar por modalidad y disponibilidad
export async function getAllTutors(filters?: {
    modality?: string;
    onlyAvailable?: boolean;
}) {
    const params = new URLSearchParams();

    if (filters?.modality) {
        params.append('modality', filters.modality);
    }
    if (filters?.onlyAvailable) {
        params.append('onlyAvailable', String(filters.onlyAvailable));
    }

    const response = await fetch(`${API_URL}/availability/tutors/slots?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to fetch tutors');
    }
    console.log("Response from getAllTutors:", await response.clone().json());
    return response.json();
}