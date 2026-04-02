import { useState, useEffect } from "react";
import SessionCardView from "./SessionCardView";
import MultiStepDialog from "./MultiStepRating";

interface Props {
  sessions: any[];
  userId: string;
}

export default function SessionDialogManager({ sessions, userId }: Props) {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [view, setView] = useState<"card" | "evaluation">("card");

  // Escuchar clicks en la tabla
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail;
      const session = sessions.find((s) => s.id === detail.sessionId);
      if (session) {
        setActiveSession(session);
        setView("card");
      }
    }

    document.addEventListener("open-session-dialog", handler);
    return () => document.removeEventListener("open-session-dialog", handler);
  }, [sessions]);

  function handleClose() {
    setActiveSession(null);
    setView("card");
  }

  if (!activeSession) return null;

  return (
    <div className="sdm-backdrop" onClick={handleClose}>
      <div className="sdm-content" onClick={(e) => e.stopPropagation()}>
        {view === "card" ? (
          <SessionCardView
            session={activeSession}
            userId={userId}
            onClose={handleClose}
            onEvaluate={() => setView("evaluation")}
          />
        ) : (
          <MultiStepDialog
            session={activeSession}
            userId={userId}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
