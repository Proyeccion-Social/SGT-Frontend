const API_URL = import.meta.env.API_URL;

export interface EvaluationPayload {
  ratings: {
    clarity: number;
    patience: number;
    punctuality: number;
    knowledge: number;
  };
  overallRating?: number;
  comments?: string;
}
    
export async function sendSessionEvaluation(
  sessionId: string,
  payload: EvaluationPayload,
  token?: string
) {

  const response = await fetch(
    `${API_URL}/session-execution/sessions/${sessionId}/evaluation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Error sending evaluation") as any;
    error.status = response.status;
    throw error;
  }
  return data;
}