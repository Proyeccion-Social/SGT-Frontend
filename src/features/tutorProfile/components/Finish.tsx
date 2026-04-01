import "../styles/Finish.css";
import { Button } from "@/components/ui/button";

export default function Finish({ onNext, userName }: { onNext: () => void; userName?: string }) {
    return (
        <>
            <div className="drawer-body finish-body">
                <div className="finish-content">
                    <h2 className="finish-title">
                        Has <span className="finish-highlight">completado</span> tu perfil
                    </h2>
                    <p className="finish-subtitle">Bienvenido {userName ?? "Johan"}</p>
                    <Button className="finish-button" onClick={onNext}>
                        Continuar
                    </Button>
                </div>
            </div>
        </>
    );
}