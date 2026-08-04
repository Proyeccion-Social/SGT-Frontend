/**
 * Consulta al BFF si el estudiante ya evaluó la sesión (RF36).
 * Devuelve true/false; null si la consulta falló (el caller decide qué hacer).
 */
export async function isSessionEvaluated(
  sessionId: string,
  studentId: string
): Promise<boolean | null> {
  try {
    const res = await fetch(
      `/api/history/evaluation-status?sessionId=${encodeURIComponent(sessionId)}&studentId=${encodeURIComponent(studentId)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data === "boolean") return data;
    return Boolean(data?.alreadyEvaluated ?? data?.evaluated);
  } catch {
    return null;
  }
}
