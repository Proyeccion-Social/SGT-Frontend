import { useAuthStore } from "@/store/authStore";
import margenFotoSrc from "../../assets/margen_foto_perfil.svg?url";
import "../../styles/basicInformation.css";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:    "Activo",
  INACTIVE:  "Inactivo",
  SUSPENDED: "Suspendido",
};

export function BasicInformation() {
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "T";

  const status      = user?.status ?? "INACTIVE";
  const statusLabel = STATUS_LABEL[status] ?? status;

  return (
    <div className="bi-card">
      <div className="bi-status">
        <span className={`bi-status-dot bi-status-dot--${status.toLowerCase()}`} />
        <span className="bi-status-label">{statusLabel}</span>
      </div>

      <div className="bi-photo-area">
        <div className="bi-margen-wrapper">
          <img src={margenFotoSrc} alt="" aria-hidden="true" className="bi-margen" />
          <div className="bi-avatar" aria-hidden="true">{initials}</div>
        </div>
      </div>

      <p className="bi-name">{user?.name ?? "Tutor"}</p>
      <span className="bi-role">Tutor</span>
    </div>
  );
}
