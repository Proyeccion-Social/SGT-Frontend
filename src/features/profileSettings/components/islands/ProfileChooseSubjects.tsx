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

type Subject = { id: string; name: string; color?: string; borderColor?: string; };

/** Distinguishes user-facing fetch errors from unexpected runtime errors. */
class FetchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FetchError";
    }
}

export interface PCSHandle {
    getData: () => { subjectIds: string[] };
}

interface ProfileChooseSubjectsProps {
    initialSelected?: string[];
    maxSelections?: number;
    onChange?: (ids: string[]) => void;
}

// Removed SUBJECT_COLORS
// Layout is handled by CSS flexbox now

// ─── Component ────────────────────────────────────────────────────────────────

const ProfileChooseSubjects = forwardRef<PCSHandle, ProfileChooseSubjectsProps>(
    ({ initialSelected = [], maxSelections = 10, onChange }, ref) => {
        const [subjects, setSubjects]     = useState<Subject[]>([]);
        const [selected, setSelected]     = useState<string[]>(initialSelected);
        const [loading, setLoading]       = useState(true);
        const [fetchError, setFetchError] = useState<string | null>(null);

        const contentRef  = useRef<HTMLDivElement>(null);
        const didInitRef  = useRef(false);

        // Sincronizar initialSelected cuando el padre lo cargue
        useEffect(() => {
            if (!didInitRef.current && initialSelected.length > 0) {
                setSelected(initialSelected);
                didInitRef.current = true;
            }
        }, [initialSelected]);



        // Fetch de todas las materias disponibles
        useEffect(() => {
            fetch("/api/subjects")
                .then((r) => {
                    if (!r.ok) {
                        const msg =
                            r.status === 401
                                ? "Tu sesión ha expirado. Vuelve a iniciar sesión para ver las materias."
                                : `Error al cargar materias (${r.status})`;
                        throw new FetchError(msg);
                    }
                    return r.json();
                })
                .then((result) => setSubjects(result.data ?? []))
                .catch((err: unknown) => {
                    const msg =
                        err instanceof FetchError
                            ? err.message
                            : "No se pudieron cargar las materias. Intenta nuevamente.";
                    setFetchError(msg);
                    setSubjects([]);
                })
                .finally(() => setLoading(false));
        }, []);

        useImperativeHandle(ref, () => ({
            getData: () => ({ subjectIds: selected }),
        }), [selected]);


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

        if (loading) {
            return (
                <div className="pcs-root">
                    <div className="pcs-content" ref={contentRef}>
                        <div className="pcs-empty">Cargando materias…</div>
                    </div>
                </div>
            );
        }

        if (fetchError) {
            return (
                <div className="pcs-root">
                    <div className="pcs-content" ref={contentRef}>
                        <div className="pcs-empty" role="alert" aria-live="polite">{fetchError}</div>
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
                    {subjects.map((subject, index) => {
                            const isSelected = selected.includes(subject.id);
                            const colors = {
                                color: subject.color || "transparent",
                                borderColor: subject.borderColor || "transparent"
                            };

                            return (
                                <button
                                    key={subject.id}
                                    type="button"
                                    className="pcs-tag"
                                    style={{
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
