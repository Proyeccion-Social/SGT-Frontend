import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";
import ProfileChooseSubjects from "./ProfileChooseSubjects";
import type { PCSHandle } from "./ProfileChooseSubjects";
import "../../styles/preferencesView.css";

const MAX_SUBJECT_SELECTIONS = 10;

type Modality = "PRES" | "VIRT";

export function PreferencesView() {
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
    if (!data) return;

    setSaving(true);

    const saveSubjects = fetch("/api/settings/subjects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectIds: data.subjectIds }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "Error al guardar materias");
      }
    });

    const savePrefs = modality
      ? fetch("/api/settings/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredModality: modality }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error al guardar modalidad");
          }
        })
      : Promise.resolve();

    await sileo
      .promise(Promise.all([saveSubjects, savePrefs]), {
        loading: { title: "Guardando preferencias…", fill: "#8751ff" },
        success: { title: "Preferencias guardadas",  fill: "#58d68d" },
        error:   { title: "No se pudieron guardar las preferencias", fill: "#f35761" },
      })
      .finally(() => setSaving(false));
  }

  return (
    <div className="pv-view">
      <div className="pv-modality-bar">
        <div className="pv-modality-selector">
          <button
            type="button"
            className={`pv-modality-option${modality === "PRES" ? " pv-modality-option--selected" : ""}`}
            onClick={() => setModality("PRES")}
            aria-pressed={modality === "PRES"}
          >
            Presencial
          </button>
          <button
            type="button"
            className={`pv-modality-option${modality === "VIRT" ? " pv-modality-option--selected" : ""}`}
            onClick={() => setModality("VIRT")}
            aria-pressed={modality === "VIRT"}
          >
            Virtual
          </button>
        </div>
      </div>

      <div className="pv-subjects-wrapper">
        <ProfileChooseSubjects
          ref={subjectsRef}
          initialSelected={initialSelected}
          maxSelections={MAX_SUBJECT_SELECTIONS}
        />

        <div className="pv-subjects-actions">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
