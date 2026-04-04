const API_URL = import.meta.env.API_URL;

export async function patchOneAsRead(id: string, accessToken: string) {
    const response = await fetch(`${API_URL}/api/v1/notifications/inbox/${id}/read`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error al marcar la notificación como leída",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}
