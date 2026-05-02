import "../styles/ChooseSubjects.css";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

export interface StepHandle {
    triggerContinue: () => void;
    getData?: () => Record<string, unknown>;
}

type Subject = {
    id: string;
    name: string;
};

const SUBJECT_COLORS = [
    { color: "#E8D5FF", borderColor: "#D1C4F5" },
    { color: "#FFE5D5", borderColor: "#FFCCBB" },
    { color: "#D5FFE8", borderColor: "#BBE9D1" },
    { color: "#FFD5D5", borderColor: "#FFBBBB" },
    { color: "#D5F5D5", borderColor: "#BBEBB1" },
    { color: "#E0D5FF", borderColor: "#C9BBFF" },
    { color: "#D5EEFF", borderColor: "#BBDEFF" },
    { color: "#D5FFF5", borderColor: "#BBFFEE" },
    { color: "#FFECD5", borderColor: "#FFD9BB" },
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

const ChooseSubjects = forwardRef<StepHandle, { 
    onNext: (data: { subjectIds: string[] }) => void; 
    onCanContinueChange?: (canContinue: boolean) => void; 
    initialSelected?: string[];
    minSelections?: number;
    maxSelections?: number;
    title?: string;
}>(({ 
    onNext, 
    onCanContinueChange, 
    initialSelected, 
    minSelections = 1, 
    maxSelections = 3, 
    title = "Escoge las materias que vas a dar como tutor" 
}, ref) => {
    const [selected, setSelected] = useState<string[]>(initialSelected ?? []);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/subjects')
            .then(res => res.json())
            .then(result => {
                setSubjects(result.data ?? []);
            })
            .catch(() => setSubjects([]))
            .finally(() => setLoading(false));
    }, []);

    useImperativeHandle(ref, () => ({
        triggerContinue: () => onNext({ subjectIds: selected }),
        getData: () => ({ subjectIds: selected }),
    }), [selected, onNext]);

    useEffect(() => {
        onCanContinueChange?.(selected.length >= minSelections);
    }, [selected, onCanContinueChange, minSelections]);

    const toggleSubject = (id: string) => {
        setSelected((prev) => {
            if (prev.includes(id)) {
                return prev.filter((s) => s !== id);
            }
            if (prev.length >= maxSelections) return prev;
            return [...prev, id];
        });
    };

    const lastSelectedId = selected.length > 0 ? selected[selected.length - 1] : null;

    if (loading) {
        return <div className="drawer-body"><p>Cargando materias...</p></div>;
    }

    return (
        <>
            <div className="drawer-body">
                <div className="body-header-subjects">
                    <p className="body-header-title">{title}</p>
                    <p className="body-header-subtitle">Máximo: {maxSelections} materias</p>
                </div>
                
                <div className="body-content">
                    {subjects.map((subject, index) => {
                        const isSelected = selected.includes(subject.id);
                        const isLastSelected = subject.id === lastSelectedId;
                        const pos = POSITION_OFFSETS[index % POSITION_OFFSETS.length];
                        const colors = SUBJECT_COLORS[index % SUBJECT_COLORS.length];

                        return (
                            <button
                                key={subject.id}
                                className={`subject-tag ${isSelected ? "subject-tag--selected" : ""} ${isLastSelected ? "subject-tag--last" : ""}`}
                                style={{ 
                                    backgroundColor: colors.color,
                                    top: pos.top,
                                    left: pos.left,
                                    "--subject-color": colors.color,
                                    "--subject-border": colors.borderColor
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
