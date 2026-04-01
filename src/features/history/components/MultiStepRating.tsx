import { useState } from "react";
import { useEffect } from "react";
import starUnfilled from "@/features/history/assets/star-simple-unfilled.svg";
import starFilled from "@/features/history/assets/star-simple.svg";
import starFull from "@/features/history/assets/star-full.svg";
import starFullUnfilled from "@/features/history/assets/star-full-unfilled.svg";
import checkedIcon from "@/features/history/assets/checked.png";
import vectorFinal from "@/features/history/assets/vectorfinal.png";
import vectorInicial from "@/features/history/assets/vectorInicial.png";

export default function MultiStepDialog( {questionnaire, session, canRate}: {questionnaire: any, session: any, canRate: boolean}) {
  const [step, setStep] = useState(canRate ? 0 : 3);


  const description1 = {
    CLARITY: "Nada claro",
    PATIENCE: "Mala actitud",
    PUNCTUALITY: "No fue puntual",
    KNOWLEDGE: "Sin dominio",
  }
  const description2 = {
    CLARITY: "Muy claro",
    PATIENCE: "Excelente actitud",
    PUNCTUALITY: "Fue puntual",
    KNOWLEDGE: "Dominio total",
  }

    const initialAnswers = Object.fromEntries(
  questionnaire.questions.map((q) => [q.aspect, 1])
    );

const [formData, setFormData] = useState({
      answers: initialAnswers,
      comment: "",
      overallRating: 1 // 🔥 importante
  });

const updateAnswer = (aspect, value) => {
    setFormData((prev) => {
      const updatedAnswers = {
        ...prev.answers,
        [aspect]: value
      };

      const values = Object.values(updatedAnswers);

      const average = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;

      return {
        ...prev,
        answers: updatedAnswers,
        overallRating: average
      };
    });
  };

  const steps = [
    {
      title: "Inicio",
      content: "botones de si asistio o no"
    },
    {
      title: "Evaluación",
      questions: questionnaire.questions
    },
    {
      title: "Comentarios",
      comments: questionnaire.comments
    },
    {
      title: "Final",
      content: "Has calificado a " + session.tutor.name 
    }
  ];
  const current = steps[step];

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

const handleClose = () => {
  const dialog = document.getElementById(
    `eval-dialog-${session.id}`
  ) as HTMLDialogElement;
  if (dialog) {
    dialog.close();
  }
};

useEffect(() => {
  if (current.title === "Final" || !canRate) {
    const timer = setTimeout(() => {
      handleClose(); // cierra el modal después de X segundos
    }, 3000); // ⏱️ 4 segundos (puedes cambiarlo)

    return () => clearTimeout(timer); // limpieza
  }
}, [step]);

  //coneccion al backend 
const submitEvaluation = async () => {
  try {
        const ratings = Object.fromEntries(
    Object.entries(formData.answers).map(([key, value]) => [
        key.toLowerCase(),
        value
    ])
    );
    console.log("📦 ratings enviados:", ratings);
    const response = await fetch('/api/history/send-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: session.id,
        ratings: ratings,
        overallRating: formData.overallRating,
        comments: formData.comment
      })
    });
    const result = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/";
          return;
        }
        throw new Error(result.error || 'Error al enviar');
    }

    console.log("✅ Enviado:", result);

    // avanzar al final solo si todo sale bien
    next();

    } catch (error) {
        console.error("❌ Error:", error);
        alert("Error enviando la evaluación");
    }
    };
    
    
    
    

  return (
    <dialog
      id={`eval-dialog-${session.id}`}
      className="eval-dialog"
    >
    <div className="container-dialog">
  {current.title === "Inicio" && 
  <>
  <div className="vector-inicial-container">
    <img src={vectorInicial.src} alt="vector" className="vector-inicial" />
    <p>¿El Tutor asistió a la tutoría?</p>
    <div className="buttons-container-inicial">
    <button className="btn-yes" onClick={next}>Si</button>
    <button className="btn-no" onClick={handleClose}>No</button>
    </div>
  </div>
  </>
  }
 {(current.title === "Evaluación" || current.title === "Comentarios") && (
    <>
    <div className="evaluation-card-header">
        <div className="evaluation-card-header-title">
        <h3>Estas calificando a <span className="tutor-name">{session.tutor.name}</span></h3>
        <p>{session.title}</p>
        </div>
        <div className="evaluation-card-header-buttons">
        {/* 
        {step > 0 && step !== 3 && (
            <button onClick={prev}>Atrás</button>
        )}
            */}
        {step < steps.length - 2 ? (
            <button onClick={next} className="btn-continue">Continuar</button>
        ) : step === 2 && (
            <button onClick={submitEvaluation} className="btn-continue">
            Guardar
            </button>
        )}
    </div>
      </div>
    </>
 )}
 {current.title !== "Inicio" && (
 <div className="evaluation-card-body">
    {current.questions && (
    <div className="evaluation-card-body-question-container">
    <div className="evaluation-card-body-question">
    {current.questions && current.questions.map((q) => (
  <div key={q.aspect} className="evaluation-card-body-question-item">
    <p className="question-title">{q.label}</p>
    <p className="question-description"><span className="star-description">1 Estrella</span> = {description1[q.aspect]} · <span className="star-description">5 Estrellas</span> = {description2[q.aspect]}</p>
    <div className="evaluation-card-body-question-item-buttons">
    <button className="btn-rating" onClick={() => updateAnswer(q.aspect, 1)}><img src={formData.answers[q.aspect] >= 1 ? starFilled.src : starUnfilled.src} alt="star" /></button>        
    <button className="btn-rating" onClick={() => updateAnswer(q.aspect, 2)}><img src={formData.answers[q.aspect] >= 2 ? starFilled.src : starUnfilled.src} alt="star" /></button>
    <button className="btn-rating" onClick={() => updateAnswer(q.aspect, 3)}><img src={formData.answers[q.aspect] >= 3 ? starFilled.src : starUnfilled.src} alt="star" /></button>
    <button className="btn-rating" onClick={() => updateAnswer(q.aspect, 4)}><img src={formData.answers[q.aspect] >= 4 ? starFilled.src : starUnfilled.src} alt="star" /></button>
    <button className="btn-rating" onClick={() => updateAnswer(q.aspect, 5)}><img src={formData.answers[q.aspect] >= 5 ? starFull.src : starFullUnfilled.src} alt="star" /></button>
    </div>
    {/*
    <input
      type="range"
      min={q.ratingScale.min}
      max={q.ratingScale.max}
      value={formData.answers[q.aspect] || 0}
      onChange={(e) => updateAnswer(q.aspect, Number(e.target.value))}
    />
    */}
  </div>
))}
</div>
</div>
)}
{current.comments?.enabled && (
    <div className="evaluation-card-body-comment-container">
    <p className="question-title">Comentarios Adicionales</p>
    <p className="question-description">¿Tienes alguna sugerencia o comentario adicional? Tu opinión ayuda a mejorar Atlas</p>
  <textarea
    className="comment-textarea"
    placeholder={current.comments.placeholder}
    value={formData.comment}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        comment: e.target.value
      }))
    }
  />
  </div>

)}
{current.title === "Final" && (
    <div className="evaluation-card-body-final-container">
        <div className="checked-icon-container"><img src={checkedIcon.src} alt="checked" className="checked-icon" /></div>
        <div className="final-message-container">
            {canRate ? (
                <>
                <p className="final-message">Has calificado a </p> 
                <div className="tutor-name-container" style={{backgroundImage: `url(${vectorFinal.src})`}}><span className="tutor-name-final">{session.tutor.name}</span></div>
                </>
            ) : (
                <>
                <p className="final-message">Ya has calificado a </p> 
                <div className="tutor-name-container" style={{backgroundImage: `url(${vectorFinal.src})`}}><span className="tutor-name-final">{session.tutor.name}</span></div>
                </>
            )}
        </div>
    </div>
)}

</div>
)}
  </div>
  </dialog>
  );
}
