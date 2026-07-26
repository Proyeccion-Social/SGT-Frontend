import "../../assets/styles/SchedulingFinish.css";
import marked from "../../assets/marked.svg";
import arrow from "../../assets/arrowContinuar.svg";

// Pantalla de cierre del wizard tras un agendamiento exitoso. Réplica del patrón de
// tutorProfile/components/Finish.tsx. No se cierra sola: el estudiante debe leer que
// la sesión queda a la espera de la confirmación del tutor (PENDING_TUTOR_CONFIRMATION).
export default function SchedulingFinish({ onNext }: { onNext: () => void }) {
  return (
    <div className="drawer-body finish-body scheduling-finish">
      <div className="finish-content">
        <article className="marked-completed">
          <h2 className="finish-title">
            Has{" "}
            <span className="finish-title__marked">
              agendado
              <img src={marked.src} alt="" className="finish-mark" />
            </span>{" "}
            un espacio
          </h2>
        </article>
        <p className="finish-subtitle">Espera la confirmación del tutor</p>
        <article className="arrow-continue">
          <img src={arrow.src} alt="" className="finish-arrow" />
          <button className="finish-anchord" onClick={onNext}>
            Continuar
          </button>
        </article>
      </div>
    </div>
  );
}
