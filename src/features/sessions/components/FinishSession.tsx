import "@/features/sessions/styles/FinishSession.css"
import { Button } from "@/components/ui/button"
import ChequeredFlagIcon from "@/features/sessions/images/ChequeredFlagIcon.svg"
import CloseIcon from "@/features/sessions/images/CloseIcon.svg"
import type { Session } from "@/features/sessions/types/session.types"
import { createPortal } from "react-dom"

interface Props {
    session: Session;
    onClose: () => void;
    onConfirm: () => void;
}

export default function FinishSession({ session, onClose, onConfirm }: Props) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <>
            <div className="finish-session-overlay" onClick={onClose}></div>
            <div className="finish-session-container">
                <Button className="close-button"  onClick={onClose}>
                    <img src={CloseIcon.src} alt="Close"/>
                </Button>
                <div className="finish-session-header">
                    <img src={ChequeredFlagIcon.src} alt="Finish Session" />
                    <h6>¿Deseas terminar la tutoría?</h6>
                    <p className="finish-session-session-title">{session.title}</p>
                </div>
                <div className="finish-session-body">
                    <div className="finish-buttons-container">
                        <Button className="finish-button" onClick={onConfirm}>Si, terminar</Button>
                        <Button className="cancel-button" onClick={onClose}>No, no terminar</Button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}
