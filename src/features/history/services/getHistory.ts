const API_URL = import.meta.env.API_URL;


const USE_MOCK = true; // 🔥 cambia a false cuando uses backend real
import { mockHistory } from "../mocks/mockHistory";

export async function getHistory(token?: string) {

    if (USE_MOCK) {
        return mockHistory;
    }

    const response = await fetch(`${API_URL}/student/history`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Error fetching history");
    }

    return await response.json();
}