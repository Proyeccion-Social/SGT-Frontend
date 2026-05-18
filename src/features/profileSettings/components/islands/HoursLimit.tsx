import { useState, useEffect } from "react";
import { sileo } from "sileo";
import { useAuthStore } from "@/store/authStore";
import resaltadoSrc from "../../assets/resaltado.svg?url";
import "../../styles/hoursLimit.css";

export function HoursLimit() {
  const [hours, setHours]   = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/settings/tutor-hours?tutorId=${user.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setHours(data.weeklyHoursUsed + data.weeklyHoursRemaining);
      })
      .catch(() => {});
  }, [user?.id]);

  async function verifyUpdate() {
    if (!user?.id) return;
    const res = await fetch(`/api/settings/tutor-hours?tutorId=${user.id}`).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json().catch(() => null);
    if (data) setHours(data.weeklyHoursUsed + data.weeklyHoursRemaining);
  }

  async function handleSave() {
    if (hours === "" || (hours as number) < 1) return;
    const sessionCheck = await fetch("/api/auth/check-session");
    if (!sessionCheck.ok) {
      window.location.href = "/?session_expired=true";
      return;
    }
    setSaving(true);
    await sileo
      .promise(
        fetch("/api/settings/tutor-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ max_weekly_hours: hours }),
        }).then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message ?? "Error al actualizar el límite");
          }
          return res;
        }),
        {
          loading: { title: "Guardando límite…",  fill: "#8751ff" },
          success: { title: "Límite actualizado", fill: "#58d68d" },
          error:   { title: "No se pudo guardar", fill: "#f35761" },
        },
      )
      .then(() => verifyUpdate())
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
