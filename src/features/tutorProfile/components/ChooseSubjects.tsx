import "../styles/ChooseSubjects.css";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

export interface StepHandle {
    triggerContinue: () => void;
}

const SUBJECTS = [
    { id: 1, name: "Diferencial", color: "#E8D5FF", borderColor: "#D1C4F5" },
    { id: 3, name: "Avanzada", color: "#FFE5D5", borderColor: "#FFCCBB" },
    { id: 4, name: "POO", color: "#D5FFE8", borderColor: "#BBE9D1" },
    { id: 5, name: "Integral", color: "#FFD5D5", borderColor: "#FFBBBB" },
    { id: 6, name: "Ecuaciones", color: "#D5F5D5", borderColor: "#BBEBB1" },
    { id: 7, name: "Física 1", color: "#E0D5FF", borderColor: "#C9BBFF" },
    { id: 9, name: "POO", color: "#D5EEFF", borderColor: "#BBDEFF" },
    { id: 10, name: "Básica", color: "#D5FFF5", borderColor: "#BBFFEE" },
];

const MAX_SELECTIONS = 3;

const POSITION_OFFSETS = [
    // Fila 1 (Casi al tope)
    { top: "10%", left: "15%" }, { top: "18%", left: "42%" }, { top: "12%", left: "70%" }, { top: "15%", left: "90%" },
    // Fila 2 (Centro superior)
    { top: "35%", left: "8%" },  { top: "42%", left: "30%" }, { top: "38%", left: "55%" }, { top: "45%", left: "82%" },
    // Fila 3 (Centro inferior)
    { top: "65%", left: "20%" }, { top: "72%", left: "45%" }, { top: "68%", left: "70%" }, { top: "75%", left: "92%" },
    // Fila 4 (Cerca del borde inferior del contenedor)
    { top: "85%", left: "12%" }, { top: "90%", left: "38%" }, { top: "88%", left: "62%" }, { top: "92%", left: "85%" },
    // Rellenos estratégicos
    { top: "25%", left: "22%" }, { top: "55%", left: "38%" }, { top: "28%", left: "68%" }, { top: "60%", left: "80%" }
];

const ChooseSubjects = forwardRef<StepHandle, { onNext: (data: { subject_ids: string[], phone: string }) => void; onCanContinueChange?: (canContinue: boolean) => void }>(({ onNext, onCanContinueChange }, ref) => {
    const [selected, setSelected] = useState<number[]>([]);
    const [phone, setPhone] = useState("");

    useImperativeHandle(ref, () => ({
        triggerContinue: () => onNext({ subject_ids: selected.map(s => String(s)), phone }),
    }), [selected, phone, onNext]);

    useEffect(() => {
        onCanContinueChange?.(selected.length > 0);
    }, [selected, onCanContinueChange]);

    const toggleSubject = (id: number) => {
        setSelected((prev) => {
            if (prev.includes(id)) {
                return prev.filter((s) => s !== id);
            }
            if (prev.length >= MAX_SELECTIONS) return prev;
            return [...prev, id];
        });
    };

    const lastSelectedId = selected.length > 0 ? selected[selected.length - 1] : null;
    const canContinue = selected.length;

    return (
        <>
            <div className="drawer-body">
                <div className="body-header-subjects">
                    <p className="body-header-title">Escoge las materias que vas a dar como tutor</p>
                    <p className="body-header-subtitle">Máximo: {MAX_SELECTIONS} materias</p>
                </div>
                
                <div className="body-content">
                    {SUBJECTS.map((subject, index) => {
                        const isSelected = selected.includes(subject.id);
                        const isLastSelected = subject.id === lastSelectedId;
                        const pos = POSITION_OFFSETS[index % POSITION_OFFSETS.length];

                        return (
                            <button
                                key={subject.id}
                                className={`subject-tag ${isSelected ? "subject-tag--selected" : ""} ${isLastSelected ? "subject-tag--last" : ""}`}
                                style={{ 
                                    backgroundColor: subject.color,
                                    top: pos.top,
                                    left: pos.left,
                                    "--subject-color": subject.color,
                                    "--subject-border": subject.borderColor
                                } as React.CSSProperties}
                                onClick={() => toggleSubject(subject.id)}
                            >
                                {isSelected && <span className="subject-tag-tick">✓</span>}
                                {subject.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
});

export default ChooseSubjects;
