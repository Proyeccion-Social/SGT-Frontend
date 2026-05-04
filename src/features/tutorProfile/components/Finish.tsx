import { useEffect } from "react";
import "../styles/Finish.css";
import { Button } from "@/components/ui/button";
import marked from "../assets/marked.svg"
import arrow from "../assets/arrowContinuar.svg"

export default function Finish({ onNext, userName }: { onNext: () => void; userName?: string }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onNext();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onNext]);

    return (
        <>
            <div className="drawer-body finish-body">
                <div className="finish-content">
                    <article className="marked-completed">
                        <h2 className="finish-title">Has completado tu perfil</h2>
                        <img src={marked.src} alt="Completado" className="finish-mark" />
                    </article>
                    <p className="finish-subtitle">{userName ? `Bienvenido ${userName}` : "Bienvenido"}</p>
                    <article className="arrow-continue">
                        <img src={arrow.src} alt="Continuar" className="finish-arrow" />
                        <button className="finish-anchord" onClick={onNext}>
                            Continuar
                        </button>
                    </article>
                </div>
            </div>
        </>
    );
}