const API_URL = import.meta.env.API_URL;

export async function getInbox(accessToken: string) {
    const response = await fetch(`${API_URL}/api/v1/notifications/inbox`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error al obtener la bandeja de entrada",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}