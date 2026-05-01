const API_URL = import.meta.env.API_URL;


export async function patchSlotsByRange(token?: string, body) {

    const response = await fetch(
    `${API_URL}/availability/tutor/slots/range`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    }
  );
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error al actualizar franja",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}
