import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChooseSubjects from "@/features/tutorProfile/components/ChooseSubjects";
import type { StepHandle } from "@/features/tutorProfile/components/ChooseSubjects";

import materiasIconSrc from "../../assets/materias.svg?url";
import modalidadIconSrc from "../../assets/modalidad.svg?url";
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
      className={`pv-sidebar-btn${selected ? " pv-sidebar-btn--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <img src={icon} alt="" aria-hidden="true" className="pv-sidebar-btn__icon" />
      <span className="pv-sidebar-btn__label">{label}</span>
    </button>
  );
}

// ─── Preferences View ─────────────────────────────────────────────────────────

interface PreferencesViewProps {
  initialTab?: PreferencesSubTab;
}

export function PreferencesView({ initialTab }: PreferencesViewProps) {
  const [activeTab, setActiveTab] = useState<PreferencesSubTab>(initialTab ?? "materias");
  const subjectsRef = useRef<StepHandle>(null);

  function handleSaveSubjects() {
    const data = subjectsRef.current?.getData?.() as { subject_ids: string[] } | undefined;
    if (!data) return;

    // TODO: llamar BFF para guardar materias seleccionadas del perfil
    // fetch('/api/bff/profile/subjects', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subject_ids: data.subject_ids }),
    // })
    //   .then(res => res.json())
    //   .then(() => { /* feedback al usuario */ });
  }

  return (
    <div className="pv-view">
      <aside className="pv-sidebar">
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
            <ChooseSubjects
              ref={subjectsRef}
              onNext={(data) => {
                // TODO: llamar BFF para guardar materias (invocado via triggerContinue)
                // fetch('/api/bff/profile/subjects', {
                //   method: 'PUT',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(data),
                // });
              }}
            />
            <div className="pv-subjects-actions">
              <Button type="button" onClick={handleSaveSubjects}>
                Guardar
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
