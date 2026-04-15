const API_URL = import.meta.env.API_URL;

export async function patchMyLimits(token?: string, body) {

  const response = await fetch(
    `${API_URL}/availability/tutor/me/limits`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ maxWeeklyHours: Number(body.hours) })
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: "Error al actualizar limites",
    }));
    throw { status: response.status, ...errorBody };
  }

  return response.json();
}