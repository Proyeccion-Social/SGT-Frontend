import { useState, useEffect, useRef, useCallback } from "react";
import checkmarkIcon from "../../assets/CheckmarkIcon.svg";
import type { Slot, TutorProfileInfo } from "@features/availability/services/availabilityService";
import { CloudinaryImage } from "@/components/CloudinaryImage";
import "../../assets/styles/Availability.css";

interface TutorInfo {
  id: string;
  name: string;
  photo: string | null; // TODO: reemplazar con método de fetch real
  modality: string;
  type: string;
  subjects: { id: string; name: string }[];
}

interface Props {
  tutorIds: string[];
  subject: string;
  subjectColor?: { color: string; borderColor: string };
  tutorProfiles?: Record<string, TutorProfileInfo>;
  /** Modalidades del slot de cada tutor en la franja (una o ambas: PRES / VIRT). */
  modalityByTutor?: Record<string, string[]>;
  onSelect: (tutorId: string) => void;
}

export default function AvailabilityStep({ tutorIds, subject, subjectColor, tutorProfiles = {}, modalityByTutor = {}, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  /** Solo los tutores traídos del BFF; los de SSR se derivan en `infoFor`. */
  const [tutors, setTutors] = useState<Record<string, TutorInfo>>({});

  /**
   * Perfil a mostrar: primero lo ya cargado del BFF, si no lo pre-cargado por
   * SSR. Se deriva en vez de copiarse al estado en el montaje, porque si
   * `tutorProfiles` llega después el estado inicial ya no se recalcularía y la
   * tarjeta se quedaría en skeleton indefinidamente.
   */
  const infoFor = (id: string): TutorInfo | undefined => {
    const fetched = tutors[id];
    if (fetched) return fetched;

    const p = tutorProfiles[id];
    if (!p) return undefined;

    return { id, name: p.name, photo: p.photo, modality: "", type: "", subjects: p.subjects };
  };
  /** Tutores cuya carga falló: se les muestra tarjeta de error con reintento. */
  const [failedIds, setFailedIds] = useState<Record<string, true>>({});
  /**
   * Ids ya intentados. Vive en un ref y no en el estado para que el efecto no
   * se re-dispare al registrar el resultado y entre en bucle de reintentos.
   */
  const attemptedRef = useRef<Set<string>>(new Set());
  const [retryNonce, setRetryNonce] = useState(0);

  // Cargar info de tutores desde el BFF solo para los no pre-cargados
  useEffect(() => {
    const pendingIds = tutorIds.filter(
      (id) =>
        !tutorProfiles[id] &&
        !tutors[id] &&
        !failedIds[id] &&
        !attemptedRef.current.has(id)
    );

    if (pendingIds.length === 0) return;

    pendingIds.forEach((id) => attemptedRef.current.add(id));

    let cancelled = false;

    const load = async () => {
      // `allSettled` y no `all`: con `all`, un único tutor que falle rechaza
      // todo el lote y deja sin cargar a los demás (criterio de aceptación 9).
      const results = await Promise.allSettled(
        pendingIds.map(async (id) => {
          const res = await fetch(`/api/sessions/scheduleapi?tutorId=${id}`);

          if (!res.ok) {
            throw new Error("No se pudo obtener el tutor");
          }
          const t = (await res.json()) as TutorInfo;
          return { ...t, id };
        })
      );

      if (cancelled) return;

      const loaded: Record<string, TutorInfo> = {};
      const failed: Record<string, true> = {};

      results.forEach((result, i) => {
        const id = pendingIds[i];
        if (result.status === "fulfilled") {
          loaded[id] = result.value;
        } else {
          failed[id] = true;
          console.error(`Error cargando el tutor ${id}`, result.reason);
        }
      });

      if (Object.keys(loaded).length > 0) {
        setTutors((prev) => ({ ...prev, ...loaded }));
      }
      if (Object.keys(failed).length > 0) {
        setFailedIds((prev) => ({ ...prev, ...failed }));
      }
    };

    load();
    return () => {
      cancelled = true;
      // Si el efecto se cancela antes de resolver, estos ids vuelven a quedar
      // disponibles: de lo contrario seguirían marcados como intentados y su
      // tarjeta se quedaría en skeleton para siempre.
      pendingIds.forEach((id) => attemptedRef.current.delete(id));
    };
  }, [tutorIds, retryNonce]);

  const handleRetry = useCallback((tutorId: string) => {
    attemptedRef.current.delete(tutorId);
    setFailedIds((prev) => {
      const next = { ...prev };
      delete next[tutorId];
      return next;
    });
    setRetryNonce((n) => n + 1);
  }, []);

  /** Hay al menos un tutor sin resolver todavía (ni cargado ni fallido). */
  const hasPending = tutorIds.some((id) => !infoFor(id) && !failedIds[id]);

  return (
    <div>
      <div className="availability-card">

        {/* ── Lista de tutores ── */}
        <div className="tutor-list" aria-busy={hasPending}>
          {tutorIds.length === 0 && (
            <p className="tutor-list__empty">
              No hay tutores disponibles en esta franja.
            </p>
          )}

          {tutorIds.map((tutorId) => {
            const info = infoFor(tutorId);
            const isSelected = selected === tutorId;

            // ── Error: la carga de este tutor falló, el resto sigue usable ──
            if (!info && failedIds[tutorId]) {
              return (
                <div
                  key={tutorId}
                  className="tutor-card tutor-card--error"
                  role="alert"
                >
                  <div className="tutor-card__photo-wrapper" />
                  <div className="tutor-card__error">
                    <p className="tutor-card__error-text">
                      No se pudo cargar este tutor.
                    </p>
                    <button
                      type="button"
                      className="tutor-card__retry-btn"
                      onClick={() => handleRetry(tutorId)}
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              );
            }

            // ── Carga: nunca mostrar el id crudo como nombre ──
            if (!info) {
              return (
                <div
                  key={tutorId}
                  className="tutor-card tutor-card--skeleton"
                  aria-hidden="true"
                >
                  <div className="tutor-card__photo-wrapper tutor-card__photo-wrapper--skeleton tutor-card__skeleton-block" />
                  <div className="tutor-card__info">
                    <div className="tutor-card__skeleton-block tutor-card__skeleton-line" />
                    <div className="tutor-card__skeleton-block tutor-card__skeleton-line tutor-card__skeleton-line--short" />
                  </div>
                </div>
              );
            }

            return (
              <button
                key={tutorId}
                onClick={() => setSelected(isSelected ? null : tutorId)}
                className={`tutor-card${isSelected ? " tutor-card--selected" : ""}`}
              >
                {/* ── Indicador de selección ── */}
                {isSelected && (
                  <div className="tutor-card__check-badge">
                    <img src={checkmarkIcon.src} alt="" aria-hidden="true" width="10" height="8" />
                  </div>
                )}

                {/* ── Badge de materia ── */}
                <div
                  className="tutor-card__subject-badge"
                  style={subjectColor?.color && subjectColor.color !== 'transparent' ? { backgroundColor: subjectColor.color, borderColor: subjectColor.borderColor } : undefined}
                >{subject}</div>
                {/* ── Foto del tutor ──
                    Sin foto, `CloudinaryImage` ya resuelve el vacío con
                    /default-avatar.svg: se usa ese mismo fallback en vez de un
                    texto "Sin foto", para no tener dos tratamientos del mismo
                    caso ni descuadrar la caja. */}
                <div className="tutor-card__photo-wrapper">
                  <CloudinaryImage
                    src={info.photo}
                    size="cover"
                    alt={info.name}
                    className={`tutor-card__photo${
                      info.photo ? "" : " tutor-card__photo--fallback"
                    }`}
                  />
                </div>

                {/* ── Nombre superpuesto ── */}
                <div className="tutor-card__name-overlay">
                  {info.name}
                </div>

                {/* ── Información del tutor ── */}
                <div className="tutor-card__info">
                  <p className="tutor-card__info-text">
                    <strong>Modalidad:</strong>{" "}
                    {(() => {
                      // Fuente de verdad: las modalidades del slot del tutor en esta
                      // franja. Puede ofrecer una o ambas.
                      const mods = modalityByTutor[tutorId] ?? [];
                      if (mods.length > 1) return "Presencial y virtual";
                      const modality = mods[0] ?? info.modality;
                      return modality === "PRES"
                        ? "Presencial"
                        : modality === "VIRT"
                        ? "Virtual"
                        : "Presencial o virtual";
                    })()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Pie con botón de continuar ── */}
        <div className="availability-footer">
          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className={`availability-footer__continue-btn${
              selected ? " availability-footer__continue-btn--active" : ""
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}