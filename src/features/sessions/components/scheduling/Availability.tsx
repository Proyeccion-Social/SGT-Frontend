import { useState, useEffect } from "react";
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
  onSelect: (tutorId: string) => void;
}

export default function AvailabilityStep({ tutorIds, subject, subjectColor, tutorProfiles = {}, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Pre-populate from SSR profiles; only fetch what's missing
  const buildInitialTutors = (): Record<string, TutorInfo> => {
    const map: Record<string, TutorInfo> = {};
    for (const id of tutorIds) {
      const p = tutorProfiles[id];
      if (p) {
        map[id] = { id, name: p.name, photo: p.photo, modality: "", type: "", subjects: p.subjects };
      }
    }
    return map;
  };

  const [tutors, setTutors] = useState<Record<string, TutorInfo>>(buildInitialTutors);
  const [loading, setLoading] = useState(false);

  // Cargar info de tutores desde el BFF solo para los no pre-cargados
  useEffect(() => {
    const uncachedIds = tutorIds.filter((id) => !tutorProfiles[id]);

    if (uncachedIds.length === 0) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          uncachedIds.map(async (id) => {
            const res = await fetch(`/api/sessions/scheduleapi?tutorId=${id}`)

            if (!res.ok) {
              throw new Error("No se pudo obtener el tutor");
            }
            const t = (await res.json()) as TutorInfo;
            return t;
          })
        );

        if (cancelled) return;

        setTutors((prev) => {
          const updated = { ...prev };
          for (const t of results) {
            updated[t.id] = t;
          }
          return updated;
        });
      } catch (e) {
        console.error("Error cargando tutores", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tutorIds]);

  return (
    <div>
      <div className="availability-card">

        {/* ── Lista de tutores ── */}
        <div className="tutor-list">
          {tutorIds.map((tutorId) => {
            const info = tutors[tutorId];
            const isSelected = selected === tutorId;

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
                {/* ── Foto del tutor ── */}
                <div className="tutor-card__photo-wrapper">
                  {info?.photo ? (
                    <CloudinaryImage
                      src={info.photo}
                      size="cover"
                      alt={info.name}
                      className="tutor-card__photo"
                    />
                  ) : (
                    <span className="tutor-card__photo-placeholder">Sin foto</span>
                  )}
                </div>

                {/* ── Nombre superpuesto ── */}
                <div className="tutor-card__name-overlay">
                  {info?.name ?? tutorId}
                </div>

                {/* ── Información del tutor ── */}
                <div className="tutor-card__info">
                  <p className="tutor-card__info-text">
                    <strong>Modalidades disponibles:</strong>{" "}
                    {info?.modality === "PRES"
                      ? "Presencial"
                      : info?.modality === "VIRT"
                      ? "Virtual"
                      : "Presencial o virtual"}
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