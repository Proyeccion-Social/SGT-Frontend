const API_URL = import.meta.env.API_URL;
import { mockSendEvaluation } from "@/features/history/mocks/sendEvaluation";

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
const USE_MOCK = false;
    
export async function sendSessionEvaluation(
  sessionId: string,
  payload: EvaluationPayload,
  token?: string
) {
  if (USE_MOCK) {
    //  simulamos delay real
    await new Promise((res) => setTimeout(res, 800));

    return mockSendEvaluation(sessionId, payload);
  }

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
    throw new Error(data.message || "Error sending evaluation");
  }
  return data;
}