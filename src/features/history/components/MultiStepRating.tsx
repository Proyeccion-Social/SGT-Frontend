import { useState, useEffect } from "react";
import { sileo } from "sileo";
import starUnfilled from "@/features/history/assets/star-simple-unfilled.svg";
import starFilled from "@/features/history/assets/star-simple.svg";
import starFull from "@/features/history/assets/star-full.svg";
import starFullUnfilled from "@/features/history/assets/star-full-unfilled.svg";
import checkedIcon from "@/features/history/assets/checked.png";
import vectorFinal from "@/features/history/assets/vectorFinal.png";
import vectorInicial from "@/features/history/assets/vectorInicial.png";
import "@/features/history/css/multiStepRating.css";
import type {
  EvaluationQuestionnaire,
  EvaluationQuestion,
  EvaluationRatings,
} from "@/features/sessions/types/session.types";

interface MultiStepDialogProps {
  session: {
    id: string;
    title?: string;
    tutor?: { name?: string };
  };
  userId?: string;
  /** Prefijo BFF: "/api/history" | "/api/emailScreens" */
  apiBase?: string;
  onClose: () => void;
}

const DEFAULT_DESC_LOW: Record<string, string> = {
  CLARITY: "Nada claro",
  PATIENCE: "Mala actitud",
  PUNCTUALITY: "No fue puntual",
  KNOWLEDGE: "Sin dominio",
};
const DEFAULT_DESC_HIGH: Record<string, string> = {
  CLARITY: "Muy claro",
  PATIENCE: "Excelente actitud",
  PUNCTUALITY: "Fue puntual",
  KNOWLEDGE: "Dominio total",
};

const ASPECT_KEYS = ["clarity", "patience", "punctuality", "knowledge"] as const;

export default function MultiStepDialog({
  session,
  userId,
  apiBase = "/api/history",
  onClose,
}: MultiStepDialogProps) {
  const [questionnaire, setQuestionnaire] =
    useState<EvaluationQuestionnaire | null>(null);
  const [canRate, setCanRate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [formData, setFormData] = useState<{
    answers: Record<string, number>;
    comment: string;
  }>({
    answers: {},
    comment: "",
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(`${apiBase}/evaluation-questions`);
        if (res.ok) {
          const data = await res.json();
          const q: EvaluationQuestionnaire | undefined =
            data?.questionnaire ?? data;
          if (!cancelled && q?.questions) setQuestionnaire(q);
        }

        if (userId) {
          const resEval = await fetch(
            `${apiBase}/evaluation-status?sessionId=${session.id}&studentId=${userId}`
          );
          if (resEval.ok) {
            const hasEvaluated = await resEval.json();
            // backend devuelve boolean directo o { alreadyEvaluated }
            const evaluated =
              typeof hasEvaluated === "boolean"
                ? hasEvaluated
                : Boolean(hasEvaluated?.alreadyEvaluated ?? hasEvaluated?.evaluated);
            if (!cancelled) setCanRate(evaluated === false);
          } else if (!cancelled) {
            setCanRate(true);
          }
        } else if (!cancelled) {
          setCanRate(true);
        }
      } catch (err) {
        console.error("Error cargando datos de evaluación:", err);
        if (!cancelled) setCanRate(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [apiBase, session.id, userId]);

  useEffect(() => {
    if (questionnaire?.questions) {
      const initial = Object.fromEntries(
        questionnaire.questions.map((q) => {
          const min = q.ratingScale?.min ?? 1;
          return [q.aspect, min];
        })
      );
      setFormData({ answers: initial, comment: "" });
    }
  }, [questionnaire]);

  useEffect(() => {
    if (canRate === false) setStep(3);
  }, [canRate]);

  useEffect(() => {
    if (step === 3 || canRate === false) {
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, canRate, onClose]);

  useEffect(() => {
    if (step === 1) setCurrentQuestionIndex(0);
  }, [step]);

  const next = () => setStep((s) => s + 1);

  const updateAnswer = (aspect: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [aspect]: value },
    }));
  };

  const maxCommentLength = questionnaire?.comments?.maxLength ?? 500;

  const submitEvaluation = async () => {
    if (isSubmitting || !questionnaire) return;

    const missing = questionnaire.questions.filter((q) => {
      if (!q.required) return false;
      const v = formData.answers[q.aspect];
      const min = q.ratingScale?.min ?? 1;
      const max = q.ratingScale?.max ?? 5;
      return v == null || v < min || v > max;
    });
    if (missing.length > 0) {
      sileo.error({
        title: "Calificación incompleta",
        description: "Responde todas las preguntas obligatorias.",
        fill: "#f35761",
      });
      return;
    }

    if (formData.comment.length > maxCommentLength) {
      sileo.error({
        title: "Comentario muy largo",
        description: `Máximo ${maxCommentLength} caracteres.`,
        fill: "#f35761",
      });
      return;
    }

    const byKey = Object.fromEntries(
      Object.entries(formData.answers).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ])
    ) as Record<string, number>;

    const safeRatings: EvaluationRatings = {
      clarity: byKey.clarity ?? formData.answers.CLARITY ?? 1,
      patience: byKey.patience ?? formData.answers.PATIENCE ?? 1,
      punctuality: byKey.punctuality ?? formData.answers.PUNCTUALITY ?? 1,
      knowledge: byKey.knowledge ?? formData.answers.KNOWLEDGE ?? 1,
    };

    for (const k of ASPECT_KEYS) {
      if (typeof safeRatings[k] !== "number") {
        sileo.error({
          title: "Calificación incompleta",
          description: "Faltan aspectos por calificar.",
          fill: "#f35761",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/send-evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          ratings: safeRatings,
          comments: formData.comment.trim() || undefined,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/";
          return;
        }
        const msg =
          result.message || result.error || "Error al enviar la evaluación";
        throw new Error(msg);
      }

      setJustSubmitted(true);
      setCanRate(false);
      next();
      sileo.success({
        title: "Evaluación enviada",
        description: "Gracias por tu retroalimentación.",
        fill: "#58d68d",
      });
    } catch (error) {
      console.error("Error enviando evaluación:", error);
      sileo.error({
        title: "Error al enviar",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la evaluación",
        fill: "#f35761",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !questionnaire) {
    return (
      <div className="container-dialog">
        <div className="evaluation-card-body">
          <p style={{ padding: 24, textAlign: "center" }}>
            Cargando cuestionario…
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "Inicio" as const },
    { title: "Evaluación" as const, questions: questionnaire.questions },
    {
      title: "Comentarios" as const,
      comments: questionnaire.comments,
    },
    { title: "Final" as const },
  ];
  const current = steps[step];
  const questions: EvaluationQuestion[] =
    "questions" in current && current.questions ? current.questions : [];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const commentsEnabled =
    current.title === "Comentarios" &&
    (questionnaire.comments?.enabled !== false);

  const renderQuestion = (q: EvaluationQuestion) => {
    const min = q.ratingScale?.min ?? 1;
    const max = q.ratingScale?.max ?? 5;
    const scale = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const lowLabel =
      q.ratingScale?.labels?.[String(min)] ??
      DEFAULT_DESC_LOW[q.aspect] ??
      q.description;
    const highLabel =
      q.ratingScale?.labels?.[String(max)] ??
      DEFAULT_DESC_HIGH[q.aspect] ??
      "";

    return (
      <div key={q.aspect} className="evaluation-card-body-question-item">
        <p className="question-title">{q.label}</p>
        <p className="question-description">
          <span className="star-description">{min} Estrella{min !== 1 ? "s" : ""}</span>{" "}
          = {lowLabel}
          {highLabel ? (
            <>
              {" "}
              ·{" "}
              <span className="star-description">
                {max} Estrellas
              </span>{" "}
              = {highLabel}
            </>
          ) : null}
        </p>
        <div className="evaluation-card-body-question-item-buttons">
          {scale.map((n) => (
            <button
              key={n}
              type="button"
              className="btn-rating"
              onClick={() => updateAnswer(q.aspect, n)}
            >
              <img
                className={n === max ? "star-five" : ""}
                src={
                  n === max
                    ? (formData.answers[q.aspect] ?? 0) >= max
                      ? starFull.src
                      : starFullUnfilled.src
                    : (formData.answers[q.aspect] ?? 0) >= n
                      ? starFilled.src
                      : starUnfilled.src
                }
                alt={`${n} estrellas`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const tutorName = session.tutor?.name ?? "el tutor";

  return (
    <div className="container-dialog">
      {current.title === "Inicio" && (
        <div className="vector-inicial-container">
          <img
            src={vectorInicial.src}
            alt=""
            className="vector-inicial"
          />
          <p>¿El Tutor asistió a la tutoría?</p>
          <div className="buttons-container-inicial">
            <button type="button" className="btn-yes" onClick={next}>
              Sí
            </button>
            <button
              type="button"
              className="btn-no"
              onClick={() => {
                sileo.error({
                  title: "Evaluación cancelada",
                  description:
                    "Si el tutor no asistió, contacta a soporte o reporta la incidencia desde tu historial.",
                  fill: "#f59e0b",
                });
                onClose();
              }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {(current.title === "Evaluación" || current.title === "Comentarios") && (
        <div className="evaluation-card-header">
          <div className="evaluation-card-header-title">
            <h3>
              Estás calificando a{" "}
              <span className="tutor-name">{tutorName}</span>
            </h3>
            <p>{session.title}</p>
          </div>
          <div className="evaluation-card-header-buttons">
            {step < steps.length - 2 ? (
              isMobile && current.title === "Evaluación" ? (
                isLastQuestion ? (
                  <button type="button" onClick={next} className="btn-continue">
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                    className="btn-continue"
                  >
                    Siguiente
                  </button>
                )
              ) : (
                <button type="button" onClick={next} className="btn-continue">
                  Continuar
                </button>
              )
            ) : step === 2 ? (
              <button
                type="button"
                onClick={submitEvaluation}
                className="btn-continue"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando…" : "Guardar"}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {current.title !== "Inicio" && (
        <div className="evaluation-card-body">
          {questions.length > 0 && (
            <div className="evaluation-card-body-question-container">
              {isMobile ? (
                <>
                  <div className="evaluation-card-body-question evaluation-card-body-question--single">
                    {questions[currentQuestionIndex] &&
                      renderQuestion(questions[currentQuestionIndex])}
                  </div>
                  <div className="question-progress-dots">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`question-dot${
                          idx === currentQuestionIndex ? " active" : ""
                        }`}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        aria-label={`Pregunta ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="evaluation-card-body-question">
                  {questions.map((q) => renderQuestion(q))}
                </div>
              )}
            </div>
          )}

          {commentsEnabled && (
            <div className="evaluation-card-body-comment-container">
              <p className="question-title">
                {questionnaire.comments?.label ?? "Comentarios adicionales"}
              </p>
              <p className="question-description">
                ¿Tienes alguna sugerencia o comentario adicional? Tu opinión
                ayuda a mejorar Atlas
              </p>
              <textarea
                className="comment-textarea"
                placeholder={
                  questionnaire.comments?.placeholder ??
                  "Escribe tu opinión…"
                }
                value={formData.comment}
                maxLength={maxCommentLength}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
              />
              <p className="question-description" style={{ textAlign: "right" }}>
                {formData.comment.length}/{maxCommentLength}
              </p>
            </div>
          )}

          {current.title === "Final" && (
            <div className="evaluation-card-body-final-container">
              <div className="checked-icon-container">
                <img
                  src={checkedIcon.src}
                  alt=""
                  className="checked-icon"
                />
              </div>
              <div className="final-message-container">
                <p className="final-message">
                  {justSubmitted ? "Has calificado a " : "Ya has calificado a "}
                </p>
                <div
                  className="tutor-name-container"
                  style={{
                    backgroundImage: `url(${vectorFinal.src})`,
                  }}
                >
                  <span className="tutor-name-final">{tutorName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
