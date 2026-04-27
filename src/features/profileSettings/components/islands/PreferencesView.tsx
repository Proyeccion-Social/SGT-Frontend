import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";
import ProfileChooseSubjects from "./ProfileChooseSubjects";
import type { PCSHandle } from "./ProfileChooseSubjects";

const MAX_SUBJECT_SELECTIONS = 10;

import materiasIconSrc from "../../assets/materias.svg?url";
import modalidadIconSrc from "../../assets/modalidad.svg?url";
import "../../styles/sidebar.css";
import "../../styles/preferencesView.css";

type PreferencesSubTab = "materias" | "modalidad";

// ─── Sidebar Button ───────────────────────────────────────────────────────────

interface SidebarButtonProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function SidebarButton({ icon, label, selected, onClick }: SidebarButtonProps) {
  return (
    <button
      type="button"
      className={`ps-sidebar-btn${selected ? " ps-sidebar-btn--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <img src={icon} alt="" aria-hidden="true" className="ps-sidebar-btn__icon" />
      <span className="ps-sidebar-btn__label">{label}</span>
    </button>
  );
}

// ─── Preferences View ─────────────────────────────────────────────────────────

interface PreferencesViewProps {
  initialTab?: PreferencesSubTab;
}

export function PreferencesView({ initialTab }: PreferencesViewProps) {
  const [activeTab, setActiveTab] = useState<PreferencesSubTab>(initialTab ?? "materias");
  const [initialSelected, setInitialSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const subjectsRef = useRef<PCSHandle>(null);

  // Cargar materias de interés actuales del estudiante al montar
  useEffect(() => {
    fetch("/api/settings/subjects")
      .then((r) => r.json())
      .then((data) => {
        const ids: string[] = (data.subjects ?? []).map((s: { id: string }) => s.id);
        setInitialSelected(ids);
      })
      .catch(() => {
        sileo.error({
          title: "No se pudieron cargar tus materias guardadas",
          description: "Inicia sesión o recarga la página.",
          fill: "#f35761",
        });
      });
  }, []);

  async function handleSaveSubjects() {
    const data = subjectsRef.current?.getData();
    if (!data) return;

    setSaving(true);
    await sileo.promise(
      fetch("/api/settings/subjects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: data.subjectIds }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message ?? "Error al guardar");
        }
        return res;
      }),
      {
        loading: { title: "Guardando materias…",  fill: "#8751ff" },
        success: { title: "Materias guardadas",    fill: "#58d68d" },
        error:   { title: "No se pudieron guardar las materias", fill: "#f35761" },
      },
    ).finally(() => setSaving(false));
  }

  return (
    <div className="pv-view">
      <aside className="ps-sidebar">
        <SidebarButton
          icon={materiasIconSrc}
          label="Materias"
          selected={activeTab === "materias"}
          onClick={() => setActiveTab("materias")}
        />
        <SidebarButton
          icon={modalidadIconSrc}
          label="Modalidad"
          selected={activeTab === "modalidad"}
          onClick={() => setActiveTab("modalidad")}
        />
      </aside>

      <main className="pv-main">
        {activeTab === "materias" && (
          <div className="pv-subjects-wrapper">
            <div className="pv-subjects-header">
              <p className="pv-subjects-header__title">Materias de tu interés</p>
              <p className="pv-subjects-header__subtitle">Máximo {MAX_SUBJECT_SELECTIONS} materias</p>
            </div>

            <ProfileChooseSubjects
              ref={subjectsRef}
              initialSelected={initialSelected}
              maxSelections={MAX_SUBJECT_SELECTIONS}
            />

            <div className="pv-subjects-actions">
              <Button type="button" onClick={handleSaveSubjects} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "modalidad" && (
          <div className="pv-modalidad-placeholder">
            {/* TODO: implementar vista de selección de modalidad */}
          </div>
        )}
      </main>
    </div>
  );
}
