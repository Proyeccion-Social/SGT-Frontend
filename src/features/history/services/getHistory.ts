const API_URL = import.meta.env.API_URL;

const USE_MOCK = false; // 🔥 cambia a false cuando uses backend real
import { mockHistory } from "../mocks/mockHistory";

interface GetHistoryParams {
    token: string;
    page?: number;
    limit?: number;
    status?: string;
}

export async function getHistory({
    token,
    page = 1,
    limit, // 🔥 CAMBIO: Eliminamos el límite por defecto para que lo maneje el backend
    status // opcional: "completed", "upcoming", etc.
}: GetHistoryParams) {

    // 🔥 MOCK (puedes luego simular filtros si quieres)
    if (USE_MOCK) {
    let sessions = mockHistory.sessions;

    if (status) {
        sessions = sessions.filter(s => s.status === status.toUpperCase());
    }

    const mockLimit = limit || 10;
    const start = (page - 1) * mockLimit;
    const end = start + mockLimit;

    return {
        sessions: sessions.slice(start, end),
        pagination: {
            total: sessions.length,
            page,
            limit: mockLimit,
            totalPages: Math.ceil(sessions.length / mockLimit)
        }
    };
}

    // 🔥 Construcción de query params dinámica
    const queryParams = new URLSearchParams({
        page: page.toString(),
    });

    if (limit !== undefined) {
        queryParams.append("limit", limit.toString());
    }

    if (status) {
        queryParams.append("status", status);
    }

    const url = `${API_URL}/scheduling/sessions/my-sessions/student?${queryParams.toString()}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Error fetching history");
    }

    return await response.json();
}