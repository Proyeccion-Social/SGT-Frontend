import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useImperativeHandle,
    forwardRef,
    useMemo,
} from "react";
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

// ─── Color palette (idéntica a ChooseSubjects) ────────────────────────────────

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

function seededRandom(seed: number): number {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
}

/**
 * Estima el ancho en píxeles de un tag dado su nombre.
 * Fuente: 11px, padding horizontal 0.7rem × 2 ≈ 22px.
 */
function estimateTagPx(name: string): { w: number; h: number } {
    // ~6.2px por carácter promedio a 11px de fuente
    return { w: Math.ceil(name.length * 6.2 + 24), h: 26 };
}

/**
 * Distribuye N tags en una grilla centrada sin que ninguno quede fuera
 * del contenedor ni se superponga estructuralmente con otro.
 *
 * Estrategia:
 * 1. Calcular cols/rows usando el ancho promedio estimado de los tags.
 * 2. Ordenar las celdas por distancia euclídea al centro (center-out).
 * 3. Asignar sujeto[i] → celda[i] según ese orden.
 * 4. Jitter seeded dentro del margen libre de la celda.
 * 5. Clamp en px con margen de seguridad para que el tag nunca se corte.
 */
function computePositions(
    subjects: Subject[],
    containerW: number,
    containerH: number,
): Array<{ left: number; top: number }> {
    const n = subjects.length;
    if (n === 0 || containerW === 0 || containerH === 0) return [];

    const GAP = 14; // separación mínima entre tags
    const SAFE = 6; // margen de seguridad respecto al borde del contenedor

    const avgTagW =
        subjects.reduce((s, sub) => s + estimateTagPx(sub.name).w, 0) / n;
    const tagH = 26;

    // Número de columnas que caben cómodamente
    const cols = Math.max(1, Math.floor(containerW / (avgTagW + GAP)));
    const rows = Math.max(1, Math.ceil(n / cols));

    // Tamaño de celda que reparte uniformemente todo el contenedor
    const cellW = containerW / cols;
    const cellH = containerH / rows;

    // Ordenar celdas: la más cercana al centro primero
    const centerCol = (cols - 1) / 2;
    const centerRow = (rows - 1) / 2;

    const cells: Array<{ col: number; row: number }> = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            cells.push({ col: c, row: r });
        }
    }
    cells.sort((a, b) => {
        const da = Math.hypot(a.col - centerCol, a.row - centerRow);
        const db = Math.hypot(b.col - centerCol, b.row - centerRow);
        return da - db;
    });

    return subjects.map((sub, i) => {
        const cell = cells[i % cells.length];
        const { w, h } = estimateTagPx(sub.name);

        // Centro de la celda
        const cx = (cell.col + 0.5) * cellW;
        const cy = (cell.row + 0.5) * cellH;

        // Jitter acotado al espacio libre dentro de la celda
        const freeX = Math.max(0, cellW - w);
        const freeY = Math.max(0, cellH - h);
        const jx = (seededRandom(i * 7 + 1) - 0.5) * freeX * 0.55;
        const jy = (seededRandom(i * 7 + 2) - 0.5) * freeY * 0.55;

        // Esquina superior-izquierda del tag, clampeada en px
        const left = Math.max(SAFE, Math.min(containerW - w - SAFE, cx + jx - w / 2));
        const top  = Math.max(SAFE, Math.min(containerH - h - SAFE, cy + jy - h / 2));

        return { left, top };
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProfileChooseSubjects = forwardRef<PCSHandle, ProfileChooseSubjectsProps>(
    ({ initialSelected = [], maxSelections = 10, onChange }, ref) => {
        const [subjects, setSubjects]     = useState<Subject[]>([]);
        const [selected, setSelected]     = useState<string[]>(initialSelected);
        const [loading, setLoading]       = useState(true);
        const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

        const contentRef  = useRef<HTMLDivElement>(null);
        const didInitRef  = useRef(false);

        // Sincronizar initialSelected cuando el padre lo cargue
        useEffect(() => {
            if (!didInitRef.current && initialSelected.length > 0) {
                setSelected(initialSelected);
                didInitRef.current = true;
            }
        }, [initialSelected]);

        // Medir el contenedor y escuchar cambios de tamaño
        useLayoutEffect(() => {
            const el = contentRef.current;
            if (!el) return;

            const measure = () => {
                const { width, height } = el.getBoundingClientRect();
                setContainerSize((prev) =>
                    prev.w === width && prev.h === height
                        ? prev
                        : { w: width, h: height },
                );
            };

            measure();
            const ro = new ResizeObserver(measure);
            ro.observe(el);
            return () => ro.disconnect();
        }, []);

        // Fetch de todas las materias disponibles
        useEffect(() => {
            fetch("/api/subjects")
                .then((r) => r.json())
                .then((result) => setSubjects(result.data ?? []))
                .catch(() => setSubjects([]))
                .finally(() => setLoading(false));
        }, []);

        useImperativeHandle(ref, () => ({
            getData: () => ({ subjectIds: selected }),
        }), [selected]);

        // Recalcular posiciones solo cuando cambia el listado o el contenedor
        const positions = useMemo(
            () => computePositions(subjects, containerSize.w, containerSize.h),
            [subjects, containerSize],
        );

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
                    <div className="pcs-content" ref={contentRef}>
                        <div className="pcs-empty">Cargando materias…</div>
                    </div>
                </div>
            );
        }

        if (subjects.length === 0) {
            return (
                <div className="pcs-root">
                    <div className="pcs-content" ref={contentRef}>
                        <div className="pcs-empty">No hay materias disponibles</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="pcs-root">
                <div className="pcs-content" ref={contentRef}>
                    {positions.length > 0 &&
                        subjects.map((subject, index) => {
                            const isSelected = selected.includes(subject.id);
                            const isLast     = subject.id === lastSelectedId;
                            const pos        = positions[index];
                            const colors     = SUBJECT_COLORS[index % SUBJECT_COLORS.length];

                            return (
                                <button
                                    key={subject.id}
                                    type="button"
                                    className={`pcs-tag${isLast ? " pcs-tag--last" : ""}`}
                                    style={{
                                        left: pos.left,
                                        top:  pos.top,
                                        backgroundColor: colors.color,
                                        "--subject-color":  colors.color,
                                        "--subject-border": colors.borderColor,
                                        opacity:
                                            !isSelected && selected.length >= maxSelections
                                                ? 0.4
                                                : 1,
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
