export function mockSendEvaluation(sessionId: string, payload: any) {
  return {
    message: "Evaluación enviada exitosamente. Gracias por tu retroalimentación",
    evaluationId: crypto.randomUUID(),
    sessionId,
    studentId: "student-123",
    tutorId: "tutor-456",
    ratings: payload.ratings,
    overallRating:
      payload.overallRating ??
      Object.values(payload.ratings).reduce((a: number, b: any) => a + b, 0) /
        Object.keys(payload.ratings).length,
    comments: payload.comments || "",
    evaluatedAt: new Date().toISOString()
  };
}