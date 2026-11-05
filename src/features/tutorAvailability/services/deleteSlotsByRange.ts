const API_URL = import.meta.env.API_URL;


type SlotsByRangeBody = { dayOfWeek: string; startTime: string; endTime: string; modality?: Array<'PRES' | 'VIRT'> };

export async function deleteSlotsByRange(body: SlotsByRangeBody, token?: string) {

    const response = await fetch(
    `${API_URL}/availability/tutor/slots/range`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    }
  );
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
            message: "Error al eliminar franja",
        }));
        throw { status: response.status, ...errorBody };
    }

    return response.json();
}
