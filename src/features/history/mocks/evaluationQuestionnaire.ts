export const mockEvaluationQuestionnaire = {
  questionnaire: {
    id: "evaluation-questionnaire-v1",
    version: "1.0",
    questions: [
      {
        aspect: "CLARITY",
        key: "clarity", //  clave para backend
        label: "Claridad de explicación",
        description: "¿Qué tan claro fue el tutor?",
        ratingScale: { min: 1, max: 5 },
        required: true
      },
      {
        aspect: "PATIENCE",
        key: "patience",
        label: "Paciencia y disposición",
        description: "¿Qué tan paciente fue el tutor?",
        ratingScale: { min: 1, max: 5 },
        required: true
      },
      {
        aspect: "PUNCTUALITY",
        key: "punctuality",
        label: "Puntualidad",
        description: "¿Fue puntual?",
        ratingScale: { min: 1, max: 5 },
        required: true
      },
      {
        aspect: "KNOWLEDGE",
        key: "knowledge",
        label: "Dominio del tema",
        description: "¿Dominaba el tema?",
        ratingScale: { min: 1, max: 5 },
        required: true
      }
    ],

    comments: {
      enabled: true,
      required: false,
      maxLength: 500,
      label: "Comentarios adicionales",
      placeholder: "Escribe tu opinión..."
    },

    overallRating: {
      enabled: true,
      required: false
    }
  }
};