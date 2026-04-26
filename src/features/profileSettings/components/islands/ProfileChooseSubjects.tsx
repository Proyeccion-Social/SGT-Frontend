import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import "../../styles/profileChooseSubjects.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Subject = { id: string; name: string };

export interface PCSHandle {
    getData: () => { subjectIds: string[] };
}

interface ProfileChooseSubjectsProps {
    initialSelected?: string[];
    maxSelections?: number;
    onChange?: (ids: string[]) => void;
}

// ─── Color palette (identical to ChooseSubjects) ─────────────────────────────

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

// ─── Position algorithm ───────────────────────────────────────────────────────

/**
 * Pseudorandom float [0,1) determinístico para un seed dado.
 * Basado en sin — suficiente distribución para scatter visual.
 */
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
}

/**
 * Distribuye N tags en una grilla dinámica con jitter controlado.
 * Devuelve posiciones como porcentajes del contenedor para que funcionen
 * a cualquier tamaño real del elemento.
 *
 * Estrategia:
 * 1. Calcular cols/rows óptimos según la proporción del contenedor (aspect ~2:1).
 * 2. Crear tantos slots como celdas (cols×rows) y barajarlos con seed = count,
 *    de modo que el orden cambie cuando hay más o menos materias.
 * 3. Asignar a cada materia el slot i-ésimo del array barajado.
 * 4. Desplazar el centro de la celda con un jitter de hasta ±25 % del tamaño
 *    de la celda, asegurando que los tags queden dentro del rango seguro.
 */
function computePositions(count: number): Array<{ left: string; top: string }> {
    if (count === 0) return [];

    // Relación ancho:alto aproximada del área de scatter (dialog 579px × 277px)
    const ASPECT = 579 / 277;

    const cols = Math.max(1, Math.ceil(Math.sqrt(count * ASPECT)));
    const rows = Math.max(1, Math.ceil(count / cols));

    const cellW = 100 / cols;   // % por celda en X
    const cellH = 100 / rows;   // % por celda en Y

    // Barajar slots (Fisher-Yates con seed = count)
    const slots = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(count * 100 + i) * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    return Array.from({ length: count }, (_, i) => {
        const slot = slots[i];
        const col = slot % cols;
        const row = Math.floor(slot / cols);

        // Centro de la celda (%)
        const cx = (col + 0.5) * cellW;
        const cy = (row + 0.5) * cellH;

        // Jitter: ±25 % del tamaño de la celda, único por índice
        const jx = (seededRandom(i * 7 + 3) - 0.5) * cellW * 0.5;
        const jy = (seededRandom(i * 7 + 5) - 0.5) * cellH * 0.5;

        // Rango seguro: 3 %–82 % (deja margen para el tag)
        const left = Math.max(3, Math.min(82, cx + jx));
        const top  = Math.max(3, Math.min(82, cy + jy));

        return { left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` };
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProfileChooseSubjects = forwardRef<PCSHandle, ProfileChooseSubjectsProps>(
    ({ initialSelected = [], maxSelections = 10, onChange }, ref) => {
        const [subjects, setSubjects] = useState<Subject[]>([]);
        const [selected, setSelected] = useState<string[]>(initialSelected);
        const [loading, setLoading] = useState(true);

        // Sincronizar initialSelected cuando el padre lo cargue (lazy fetch)
        const didInitRef = useRef(false);
        useEffect(() => {
            if (!didInitRef.current && initialSelected.length > 0) {
                setSelected(initialSelected);
                didInitRef.current = true;
            }
        }, [initialSelected]);

        // Fetch de todas las materias disponibles en el sistema
        useEffect(() => {
            fetch("/api/subjects")
                .then((r) => r.json())
                .then((result) => setSubjects(result.data ?? []))
                .catch(() => setSubjects([]))
                .finally(() => setLoading(false));
        }, []);

        // Exposición del handle para que PreferencesView recoja los datos
        useImperativeHandle(ref, () => ({
            getData: () => ({ subjectIds: selected }),
        }), [selected]);

        // Posiciones calculadas solo cuando cambia la cantidad de materias
        const positions = useMemo(() => computePositions(subjects.length), [subjects.length]);

        function toggleSubject(id: string) {
            setSelected((prev) => {
                let next: string[];
                if (prev.includes(id)) {
                    next = prev.filter((s) => s !== id);
                } else {
                    if (prev.length >= maxSelections) return prev;
                    next = [...prev, id];
                }
                onChange?.(next);
                return next;
            });
        }

        const lastSelectedId = selected.length > 0 ? selected[selected.length - 1] : null;

        if (loading) {
            return (
                <div className="pcs-root">
                    <div className="pcs-content">
                        <div className="pcs-empty">Cargando materias…</div>
                    </div>
                </div>
            );
        }

        if (subjects.length === 0) {
            return (
                <div className="pcs-root">
                    <div className="pcs-content">
                        <div className="pcs-empty">No hay materias disponibles</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="pcs-root">
                <div className="pcs-content">
                    {subjects.map((subject, index) => {
                        const isSelected  = selected.includes(subject.id);
                        const isLast      = subject.id === lastSelectedId;
                        const pos         = positions[index];
                        const colors      = SUBJECT_COLORS[index % SUBJECT_COLORS.length];

                        return (
                            <button
                                key={subject.id}
                                type="button"
                                className={`pcs-tag${isLast ? " pcs-tag--last" : ""}`}
                                style={{
                                    backgroundColor: colors.color,
                                    left: pos.left,
                                    top:  pos.top,
                                    "--subject-color":  colors.color,
                                    "--subject-border": colors.borderColor,
                                    opacity: !isSelected && selected.length >= maxSelections ? 0.45 : 1,
                                } as React.CSSProperties}
                                onClick={() => toggleSubject(subject.id)}
                                aria-pressed={isSelected}
                            >
                                {isSelected && <span className="pcs-tick">✓</span>}
                                {subject.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    },
);

ProfileChooseSubjects.displayName = "ProfileChooseSubjects";
export default ProfileChooseSubjects;
