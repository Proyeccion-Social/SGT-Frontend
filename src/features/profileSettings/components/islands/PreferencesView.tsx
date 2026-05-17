import { useState, useRef, useEffect } from "react";
import { sileo } from "sileo";
import ProfileChooseSubjects from "./ProfileChooseSubjects";
import type { PCSHandle } from "./ProfileChooseSubjects";
import "../../styles/preferencesView.css";

const MAX_SUBJECT_SELECTIONS = 10;

type Modality   = "PRES" | "VIRT";
type PrefSubTab = "modality" | "subjects";

export function PreferencesView() {
  const [activeTab, setActiveTab] = useState<PrefSubTab>("modality");

  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [modality, setModality] = useState<Modality | null>(null);
  const [saving, setSaving] = useState(false);
  const subjectsRef = useRef<PCSHandle>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings/subjects").then((r) => r.json()),
      fetch("/api/settings/preferences").then((r) => r.json()),
    ])
      .then(([subjData, prefData]) => {
        const ids: string[] = (subjData.subjects ?? []).map((s: { id: string }) => s.id);
        setInitialSelected(ids);
        if (prefData.preferredModality) setModality(prefData.preferredModality as Modality);
      })
      .catch(() => {
        sileo.error({
          title: "No se pudieron cargar tus preferencias",
          description: "Inicia sesión o recarga la página.",
          fill: "#f35761",
        });
      });
  }, []);

  async function handleSave() {
    const data = subjectsRef.current?.getData();
    setSaving(true);

    const requests: Promise<void>[] = [];

    if (data) {
      requests.push(
        fetch("/api/settings/subjects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectIds: data.subjectIds }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error al guardar materias");
          }
        }),
      );
    }

    if (modality) {
      requests.push(
        fetch("/api/settings/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredModality: modality }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error al guardar modalidad");
          }
        }),
      );
    }

    await sileo
      .promise(Promise.all(requests), {
        loading: { title: "Guardando preferencias…",    fill: "#8751ff" },
        success: { title: "Preferencias actualizadas",  fill: "#58d68d" },
        error:   { title: "No se pudieron guardar",     fill: "#f35761" },
      })
      .finally(() => setSaving(false));
  }

  return (
    <div className="pv-view">
      {/* ── Píldora de tabs: Modalidad / Materias ──────── */}
      <div className="pv-tab-bar">
        <button
          type="button"
          className={`pv-tab-btn${activeTab === "modality" ? " pv-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("modality")}
          aria-pressed={activeTab === "modality"}
        >
          Modalidad
        </button>
        <button
          type="button"
          className={`pv-tab-btn${activeTab === "subjects" ? " pv-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("subjects")}
          aria-pressed={activeTab === "subjects"}
        >
          Materias
        </button>
      </div>

      {/* ── Panel derecho ───────────────────────────────── */}
      <main className="pv-main">

        {activeTab === "modality" && (
          <div className="pv-modality-panel">
            <button
              type="button"
              className={`pv-modality-card${modality === "PRES" ? " pv-modality-card--active" : ""}`}
              onClick={() => setModality("PRES")}
              aria-pressed={modality === "PRES"}
            >
              <span className="pv-modality-label">Presencial</span>
            </button>

            <button
              type="button"
              className={`pv-modality-card${modality === "VIRT" ? " pv-modality-card--active" : ""}`}
              onClick={() => setModality("VIRT")}
              aria-pressed={modality === "VIRT"}
            >
              <span className="pv-modality-label">Virtual</span>
            </button>
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="pv-subjects-panel">
            <ProfileChooseSubjects
              ref={subjectsRef}
              initialSelected={initialSelected}
              maxSelections={MAX_SUBJECT_SELECTIONS}
            />
          </div>
        )}

        {/* ── Botón único centrado en el borde inferior ── */}
        <div className="pv-actions">
          <button
            type="button"
            className="gs-submit-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </main>
    </div>
  );
}
