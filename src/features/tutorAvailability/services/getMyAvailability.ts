const API_URL = import.meta.env.API_URL;

export async function getMyAvailability(token?: string) {
  const response = await fetch(`${API_URL}/availability/tutors/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404 || response.status === 204) {
    return { groupedByDay: {} };
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: "Error al obtener disponibilidad",
    }));
    throw { status: response.status, ...errorBody };
  }

  const data = await response.json().catch(() => null);

  if (!data || typeof data !== "object") {
    return { groupedByDay: {} };
  }

  return {
    ...data,
    groupedByDay:
      data.groupedByDay && typeof data.groupedByDay === "object"
        ? data.groupedByDay
        : {},
  };
}
