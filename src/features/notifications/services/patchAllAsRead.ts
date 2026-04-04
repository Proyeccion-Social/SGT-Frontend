const API_URL = import.meta.env.API_URL;

export async function patchAllAsRead(accessToken: string) {
    const response = await fetch(`${API_URL}/api/v1/notifications/inbox/read-all`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok){
        const errorBody = await response.json().catch(() => ({message : "Error al marcar todas las notificaciones como leídas",}));
        throw {status:response.status , ...errorBody };
    }

    return response.json();
}