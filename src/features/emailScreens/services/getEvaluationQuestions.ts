

const API_URL = import.meta.env.API_URL;
const USE_MOCK = false; // cambia a false cuando tengas backend

export async function getEvaluationQuestions(token?: string) {

  if (USE_MOCK) {
    return null; // mock no disponible en esta rama
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
    const errorJson = await response.json().catch(() => ({}));
    const error = new Error(errorJson.message || "Error fetching questionnaire") as any;
    error.status = response.status;
    throw error;
  }

  return await response.json();
}
