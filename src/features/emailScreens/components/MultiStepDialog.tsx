import { useState, useEffect } from "react";
import starUnfilled from "@/features/emailScreens/assets/star-simple-unfilled.svg";
import starFilled from "@/features/emailScreens/assets/star-simple.svg";
import starFull from "@/features/emailScreens/assets/star-full.svg";
import starFullUnfilled from "@/features/emailScreens/assets/star-full-unfilled.svg";
import checkedIcon from "@/features/emailScreens/assets/checked.png";
import vectorFinal from "@/features/emailScreens/assets/vectorFinal.png";
import vectorInicial from "@/features/emailScreens/assets/vectorInicial.png";
import "@/features/emailScreens/styles/multiStepRating.css";

interface MultiStepDialogProps {
  session: any;
  userId?: string;
  onClose: () => void;
}

const description1: Record<string, string> = {
  CLARITY: "Nada claro",
  PATIENCE: "Mala actitud",
  PUNCTUALITY: "No fue puntual",
  KNOWLEDGE: "Sin dominio",
};
const description2: Record<string, string> = {
  CLARITY: "Muy claro",
  PATIENCE: "Excelente actitud",
  PUNCTUALITY: "Fue puntual",
  KNOWLEDGE: "Dominio total",
};

export default function MultiStepDialog({
  session,
  userId,
  onClose,
}: MultiStepDialogProps) {

  // ========== HOOKS ==========
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [canRate, setCanRate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState<{
    answers: Record<string, number>;
    comment: string;
    overallRating: number;
  }>({
    answers: {},
    comment: "",
    overallRating: 1,
  });

  // Detectar breakpoint mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Fetch questionnaire y estado de evaluación
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/emailScreens/evaluation-questions");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setQuestionnaire(data.questionnaire);
        }

        if (userId) {
          const resEval = await fetch(
            `/api/emailScreens/evaluation-status?sessionId=${session.id}&studentId=${userId}`
          );
          if (resEval.ok) {
            const hasEvaluated = await resEval.json();
            if (!cancelled) setCanRate(hasEvaluated === false);
          }
        }
      } catch (err) {
        console.error("Error cargando datos de evaluación:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (loading) fetchData();
    return () => { cancelled = true; };
  }, []);

  // Inicializar respuestas cuando llega el cuestionario
  useEffect(() => {
    if (questionnaire?.questions) {
      const initial = Object.fromEntries(
        questionnaire.questions.map((q: any) => [q.aspect, 1])
      );
      setFormData({ answers: initial, comment: "", overallRating: 1 });
    }
  }, [questionnaire]);

  // Ajustar paso inicial si ya calificó
  useEffect(() => {
    if (canRate === false) setStep(3);
  }, [canRate]);

  // Auto-cerrar en pantalla final
  useEffect(() => {
    if (step === 3 || canRate === false) {
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, canRate]);

  // Reset índice de pregunta al entrar al paso de evaluación
  useEffect(() => {
    if (step === 1) setCurrentQuestionIndex(0);
  }, [step]);

  // ========== FUNCIONES ==========
  const next = () => setStep((s) => s + 1);

  const updateAnswer = (aspect: string, value: number) => {
    setFormData((prev) => {
      const updatedAnswers = { ...prev.answers, [aspect]: value };
      const values = Object.values(updatedAnswers) as number[];
      const average = values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
      return { ...prev, answers: updatedAnswers, overallRating: average };
    });
  };

  const submitEvaluation = async () => {
    try {
      const ratings = Object.fromEntries(
        Object.entries(formData.answers).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ])
      );
      const response = await fetch("/api/emailScreens/send-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          ratings,
          overallRating: formData.overallRating,
          comments: formData.comment,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/";
          return;
        }
        throw new Error(result.error || "Error al enviar");
      }

      next();
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error enviando la evaluación");
    }
  };

  // ========== RENDER ==========
  if (loading || !questionnaire) return null;

  const steps = [
    { title: "Inicio" },
    { title: "Evaluación", questions: questionnaire.questions },
    { title: "Comentarios", comments: questionnaire.comments },
    { title: "Final" },
  ];
  const current = steps[step];
  const questions: any[] = current.questions ?? [];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Render de una tarjeta de pregunta
  const renderQuestion = (q: any) => (
    <div key={q.aspect} className="evaluation-card-body-question-item">
      <p className="question-title">{q.label}</p>
      <p className="question-description">
        <span className="star-description">1 Estrella</span> ={" "}
        {description1[q.aspect]} ·{" "}
        <span className="star-description">5 Estrellas</span> ={" "}
        {description2[q.aspect]}
      </p>
      <div className="evaluation-card-body-question-item-buttons">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className="btn-rating"
            onClick={() => updateAnswer(q.aspect, n)}
          >
            <img
              className={n === 5 ? "star-five" : ""}
              src={
                n === 5
                  ? formData.answers[q.aspect] >= 5
                    ? starFull.src
                    : starFullUnfilled.src
                  : formData.answers[q.aspect] >= n
                    ? starFilled.src
                    : starUnfilled.src
              }
              alt="star"
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container-dialog">

      {/* ── Pantalla inicial ── */}
      {current.title === "Inicio" && (
        <div className="vector-inicial-container">
          <img src={vectorInicial.src} alt="vector" className="vector-inicial" />
          <p>¿El Tutor asistió a la tutoría?</p>
          <div className="buttons-container-inicial">
            <button className="btn-yes" onClick={next}>Si</button>
            <button className="btn-no" onClick={onClose}>No</button>
          </div>
        </div>
      )}

      {/* ── Header (Evaluación / Comentarios) ── */}
      {(current.title === "Evaluación" || current.title === "Comentarios") && (
        <div className="evaluation-card-header">
          <div className="evaluation-card-header-title">
            <h3>
              Estas calificando a{" "}
              <span className="tutor-name">{session.tutor.name}</span>
            </h3>
            <p>{session.title}</p>
          </div>
          <div className="evaluation-card-header-buttons">
            {step < steps.length - 2 ? (
              /* En mobile dentro del paso Evaluación: Siguiente pregunta o Continuar al paso de comentarios */
              isMobile && current.title === "Evaluación" ? (
                isLastQuestion ? (
                  <button onClick={next} className="btn-continue">
                    Continuar
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                    className="btn-continue"
                  >
                    Siguiente
                  </button>
                )
              ) : (
                <button onClick={next} className="btn-continue">
                  Continuar
                </button>
              )
            ) : step === 2 ? (
              <button onClick={submitEvaluation} className="btn-continue">
                Guardar
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      {current.title !== "Inicio" && (
        <div className="evaluation-card-body">

          {/* Preguntas */}
          {questions.length > 0 && (
            <div className="evaluation-card-body-question-container">
              {isMobile ? (
                /* Mobile: una pregunta a la vez */
                <>
                  <div className="evaluation-card-body-question evaluation-card-body-question--single">
                    {renderQuestion(questions[currentQuestionIndex])}
                  </div>

                  {/* Dots de progreso */}
                  <div className="question-progress-dots">
                    {questions.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        className={`question-dot${idx === currentQuestionIndex ? " active" : ""}`}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        aria-label={`Pregunta ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Desktop: grid completo */
                <div className="evaluation-card-body-question">
                  {questions.map((q: any) => renderQuestion(q))}
                </div>
              )}
            </div>
          )}

          {/* Comentarios */}
          {current.comments?.enabled && (
            <div className="evaluation-card-body-comment-container">
              <p className="question-title">Comentarios Adicionales</p>
              <p className="question-description">
                ¿Tienes alguna sugerencia o comentario adicional? Tu opinión ayuda a mejorar Atlas
              </p>
              <textarea
                className="comment-textarea"
                placeholder={current.comments.placeholder}
                value={formData.comment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, comment: e.target.value }))
                }
              />
            </div>
          )}

          {/* Pantalla final */}
          {current.title === "Final" && (
            <div className="evaluation-card-body-final-container">
              <div className="checked-icon-container">
                <img src={checkedIcon.src} alt="checked" className="checked-icon" />
              </div>
              <div className="final-message-container">
                {canRate ? (
                  <>
                    <p className="final-message">Has calificado a </p>
                    <div
                      className="tutor-name-container"
                      style={{ backgroundImage: `url(${vectorFinal.src})` }}
                    >
                      <span className="tutor-name-final">{session.tutor.name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="final-message">Ya has calificado a </p>
                    <div
                      className="tutor-name-container"
                      style={{ backgroundImage: `url(${vectorFinal.src})` }}
                    >
                      <span className="tutor-name-final">{session.tutor.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
