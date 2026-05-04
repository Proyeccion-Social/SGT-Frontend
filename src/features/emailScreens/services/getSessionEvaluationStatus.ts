const API_URL = import.meta.env.API_URL;

export async function getSessionEvaluationStatus(
  sessionId: string,
  studentId: string,
  token?: string
) {
  const response = await fetch(
    `${API_URL}/session-execution/sessions/${sessionId}/evaluation-status/${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error al obtener el estado de evaluación"
    ) as any;
    error.status = response.status;
    throw error;
  }

  return await response.json();
}
