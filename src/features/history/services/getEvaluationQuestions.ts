import { mockEvaluationQuestionnaire } from "@/features/history/mocks/evaluationQuestionnaire";

const API_URL = import.meta.env.API_URL;
const USE_MOCK = true; // 🔥 cambia a false cuando tengas backend

export async function getEvaluationQuestions(token?: string) {

  if (USE_MOCK) {
    return mockEvaluationQuestionnaire;
  }

  const response = await fetch(
    `${API_URL}/session-execution/evaluations/questions`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error fetching questionnaire");
  }

  return await response.json();
}