import { useState, useRef, useEffect } from "react";
import { sileo } from "sileo";
import ProfileChooseSubjects from "./ProfileChooseSubjects";
import type { PCSHandle } from "./ProfileChooseSubjects";
import "../../styles/tutorSubjectsView.css";

const MAX_SUBJECT_SELECTIONS = 3;

interface TutorSubjectsViewProps {
  initialSubjectIds?: string[];
  onSuccess?: () => void;
}

export function TutorSubjectsView({ initialSubjectIds = [], onSuccess }: TutorSubjectsViewProps) {
  const [initialSelected, setInitialSelected] = useState<string[]>(initialSubjectIds);
  const [saving, setSaving] = useState(false);
  const subjectsRef = useRef<PCSHandle>(null);

  useEffect(() => {
    setInitialSelected(initialSubjectIds);
  }, [initialSubjectIds]);

  async function handleSave() {
    const data = subjectsRef.current?.getData();
    if (!data) return;

    setSaving(true);

    await sileo
      .promise(
        fetch("/api/settings/tutor-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectIds: data.subjectIds }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error al guardar materias");
          }
        }),
        {
          loading: { title: "Guardando materias…", fill: "#8751ff" },
          success: { title: "Materias guardadas",  fill: "#58d68d" },
          error:   { title: "No se pudieron guardar las materias", fill: "#f35761" },
        }
      )
      .then(() => {
        onSuccess?.();
      })
      .finally(() => setSaving(false));
  }

  return (
    <div className="tsv-root">
      <div className="tsv-subjects">
        <ProfileChooseSubjects
          ref={subjectsRef}
          initialSelected={initialSelected}
          maxSelections={MAX_SUBJECT_SELECTIONS}
        />
      </div>

      <div className="tsv-actions">
        <button
          type="button"
          className="tp-btn tp-btn-guardar"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar materias"}
        </button>
      </div>
    </div>
  );
}
