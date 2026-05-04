import { useState, useEffect } from "react";
import starUnfilled from "@/features/history/assets/star-simple-unfilled.svg";
import starFilled from "@/features/history/assets/star-simple.svg";
import starFull from "@/features/history/assets/star-full.svg";
import starFullUnfilled from "@/features/history/assets/star-full-unfilled.svg";
import checkedIcon from "@/features/history/assets/checked.png";
import vectorFinal from "@/features/history/assets/vectorfinal.png";
import vectorInicial from "@/features/history/assets/vectorInicial.png";
import "@/features/history/css/multiStepRating.css";

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

  // ========== TODOS LOS HOOKS AL INICIO ==========
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [canRate, setCanRate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<{
    answers: Record<string, number>;
    comment: string;
    overallRating: number;
  }>({
    answers: {},
    comment: "",
    overallRating: 1,
  });

  // Fetch the data always
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/history/evaluation-questions");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setQuestionnaire(data.questionnaire);
        }

        if (userId) {
          const resEval = await fetch(
            `/api/history/evaluation-status?sessionId=${session.id}&studentId=${userId}`
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

  // Cuando questionnaire se carga, inicializar las respuestas
  useEffect(() => {
    if (questionnaire?.questions) {
      const initial = Object.fromEntries(
        questionnaire.questions.map((q: any) => [q.aspect, 1])
      );
      setFormData({ answers: initial, comment: "", overallRating: 1 });
    }
  }, [questionnaire]);

  // Cuando canRate se resuelve, ajustar el paso inicial
  useEffect(() => {
    if (canRate === false) setStep(3);
  }, [canRate]);

  // Auto-cerrar en paso final
  useEffect(() => {
    if (step === 3 || canRate === false) {
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, canRate]);

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
      const response = await fetch("/api/history/send-evaluation", {
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

  // Loading
  if (loading || !questionnaire) return null;

  const steps = [
    { title: "Inicio" },
    { title: "Evaluación", questions: questionnaire.questions },
    { title: "Comentarios", comments: questionnaire.comments },
    { title: "Final" },
  ];
  const current = steps[step];

  return (
    <div className="container-dialog">
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
              <button onClick={next} className="btn-continue">Continuar</button>
            ) : step === 2 && (
              <button onClick={submitEvaluation} className="btn-continue">Guardar</button>
            )}
          </div>
        </div>
      )}

      {current.title !== "Inicio" && (
        <div className="evaluation-card-body">
          {current.questions && (
            <div className="evaluation-card-body-question-container">
              <div className="evaluation-card-body-question">
                {current.questions.map((q: any) => (
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
                ))}
              </div>
            </div>
          )}

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
