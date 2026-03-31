import { useState, useEffect } from "react";
import type { Slot } from "../../../availability/services/availabilityService";
import { Rotate } from "@hugeicons/core-free-icons";

interface TutorInfo {
  id: string;
  name: string;
  photoUrl: string | null; // TODO: reemplazar con método de fetch real
  modality: string;
  type: string;
  subjects: { id: string; name: string }[];
  
}

interface Props {
  tutorIds: string[];
  slot: Slot | null;
  subject: string;
  token:String;
  onSelect: (tutorId: string) => void;
}

export default function AvailabilityStep({ tutorIds, slot, subject, onSelect, token }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [tutors, setTutors] = useState<Record<string, TutorInfo>>({});
  const [loading, setLoading] = useState(false);

  // Cargar info de tutores desde el BFF
  useEffect(() => {
    if (!tutorIds || tutorIds.length === 0) {
      setTutors({});
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          tutorIds.map(async (id) => {
            const res = await fetch(
      `/api/sessions/scheduleapi?tutorId=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
            console.log("STATUS BACKEND /tutors:", res.status);

            if (!res.ok) {
              const body = await res.text();
              console.error("BODY BACKEND /tutors:", body);
              throw new Error("No se pudo obtener el tutor");
            }
            const t = (await res.json()) as TutorInfo;
            return t;
          })
        );

        if (cancelled) return;

        const byId: Record<string, TutorInfo> = {};
        for (const t of results) {
          byId[t.id] = t;
        }

        // DEBUG opcional
        console.log("TUTORES CARGADOS:", byId);

        setTutors(byId);
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

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div>
      <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 8px", lineHeight: 1.2 }}>
        <span style={{ background: "#ede9fe", borderRadius: "6px", padding: "0 4px" }}>
          Selecciona
        </span>{" "}
        el tutor de tu preferencia
      </h2>
      <p style={{ color: "#6b7280", fontSize: "15px", margin: "0 0 32px" }}>
        Estás agendando un espacio nuevo
      </p>

      <div style={{
        border: "1px solid #e5e7eb", borderRadius: "16px",
        padding: "40px 32px", background: "#fafafa",
      }}>
        {/* Tutores centrados */}
        <div style={{
          display: "flex", gap: "24px",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {tutorIds.map((tutorId) => {
            const info = tutors[tutorId];

            return (
              <button
                key={tutorId}
                onClick={() => setSelected(tutorId)}
                style={{
                  position: "relative",
                  border: "none",
                  borderRadius: "16px",
                  overflow: "visible",
                  width: "240px",
                  background: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                  boxShadow:
                    selected === tutorId
                      ? "0 0 0 2px #7c3aed"
                      : "0 0 0 1px #e5e7eb",
                }}
              >
                {/* Check esquina superior izquierda — igual al diseño */}
                {selected === tutorId && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "-10px",
                      width: "24px",
                      height: "24px",
                      background: "#CFB9FF",
                      borderRadius: "100px",
                      transform: "rotate(20deg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                  >
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 3.5L3.5 6.5L9 1"
                        stroke="#3C3C3C"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Badge materia */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#ede9fe",
                    color: "#6d28d9",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    zIndex: 2,
                  }}
                >
                  {subject}
                </div>

                {/* Foto */}
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background: "#e5e7eb",
                    borderRadius: "16px 16px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {info?.photoUrl ? (
                    <img
                      src={info.photoUrl}
                      alt={info.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                      Sin foto
                    </span>
                  )}
                </div>

                {/* Nombre sobre la foto */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginTop: "-32px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {info?.name ?? tutorId}
                </div>

                {/* Info */}
                <div style={{ padding: "12px 14px" }}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 2px",
                      fontStyle: "italic",
                    }}
                  >
                    <strong>Modalidades disponibles:</strong>{" "}
                    {info?.modality ?? "Presencial o virtual"}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    <strong>Tipo:</strong>{" "}
                    {info?.type ?? "Virtual o integral"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px" }}>
          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            style={{
              background: selected ? "#7c3aed" : "#c4b5fd",
              color: "#fff", border: "none",
              borderRadius: "10px", padding: "12px 28px",
              fontSize: "15px", fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}