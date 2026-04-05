import "../styles/Finish.css";
import { Button } from "@/components/ui/button";
import marked from "../assets/marked.svg"
import arrow from "../assets/arrowContinuar.svg"

export default function Finish({ onNext, userName }: { onNext: () => void; userName?: string }) {
    return (
        <>
            <div className="drawer-body finish-body">
                <div className="finish-content">
                    <article className="marked-completed">
                        <h2 className="finish-title">Has completado tu perfil</h2>
                        <img src={marked.src} alt="Completado" className="finish-mark" />
                    </article>
                    <p className="finish-subtitle">Bienvenido {userName ?? "Johan"}</p>
                    <article className="arrow-continue">
                        <img src={arrow.src} alt="Continuar" className="finish-arrow" />
                        <a className="finish-anchord" onClick={onNext}>
                            Continuar
                        </a>
                    </article>
                </div>
            </div>
        </>
    );
}