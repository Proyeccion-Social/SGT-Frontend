const API_URL = import.meta.env.API_URL;

export async function getMyAvailability(token?: string) {
  const response = await fetch(`${API_URL}/availability/tutors/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: "Error al obtener disponibilidad",
    }));
    throw { status: response.status, ...errorBody };
  }

  return response.json();
}
