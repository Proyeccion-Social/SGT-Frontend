import { useState } from "react";
import { sileo } from "sileo";
import resaltadoSrc from "../../assets/resaltado.svg?url";
import "../../styles/hoursLimit.css";

export function HoursLimit() {
  const [hours, setHours]   = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (hours === "" || (hours as number) < 1) return;
    setSaving(true);
    // TODO: BFF endpoint para actualizar límite de horas
    await sileo
      .promise(new Promise<void>((res) => setTimeout(res, 800)), {
        loading: { title: "Guardando límite…",  fill: "#8751ff" },
        success: { title: "Límite actualizado", fill: "#58d68d" },
        error:   { title: "No se pudo guardar", fill: "#f35761" },
      })
      .finally(() => setSaving(false));
  }

  return (
    <div className="hl-card">
      <h2 className="hl-title">
        <span className="hl-highlight">
          <img src={resaltadoSrc} alt="" aria-hidden="true" className="hl-resaltado" />
          <span className="hl-highlight-text">Límite de horas</span>
        </span>
        {" semanales"}
      </h2>

      <p className="hl-description">
        Define cuántas horas semanales deseas dedicar a tutorías.
        Este límite te ayuda a gestionar mejor tu disponibilidad.
      </p>

      <div className="hl-input-wrapper">
        <input
          className="hl-input"
          type="number"
          min={1}
          max={168}
          value={hours}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setHours(isNaN(v) ? "" : v);
          }}
          placeholder="0"
          aria-label="Límite de horas semanales"
        />
      </div>

      <div className="hl-actions">
        <button type="button" className="tp-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
