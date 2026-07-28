import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sileo } from "sileo";
import {
  confirmBannerBFF,
  deleteBannerBFF,
  fetchBannerBFF,
  fetchBannerSignatureBFF,
  uploadBannerToCloudinary,
} from "../services/bannerService";
import type { DashboardBanner } from "../types/banner.types";
import { buildCloudinaryUrl, CLOUDINARY_SIZE } from "@/lib/cloudinary";
import "../styles/BannerManager.css";

const ASPECT = 4 / 5;

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function previewSrc(url: string): string {
  return buildCloudinaryUrl(url, {
    ...CLOUDINARY_SIZE.banner,
    crop: "fill",
    gravity: "center",
    face: false,
  });
}

export default function BannerManager() {
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState<DashboardBanner | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBanner = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBannerBFF();
      setBanner(data);
      setTargetUrl(data?.targetUrl ?? "");
    } catch {
      setBanner(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setLocalPreview(null);
    setFieldError(null);
    loadBanner();
  }, [open, loadBanner]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    if (localPreview) URL.revokeObjectURL(localPreview);
    if (!next) {
      setFile(null);
      setLocalPreview(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      setFieldError("Selecciona un archivo de imagen.");
      setFile(null);
      setLocalPreview(null);
      return;
    }
    setFieldError(null);
    setFile(next);
    setLocalPreview(URL.createObjectURL(next));
  };

  const handleSave = async () => {
    setFieldError(null);
    const url = targetUrl.trim();
    if (!url || !isValidHttpUrl(url)) {
      setFieldError("Ingresa una URL de destino válida (https://…).");
      return;
    }
    if (!file && !banner) {
      setFieldError("Selecciona una imagen para el banner.");
      return;
    }

    setSaving(true);
    try {
      let secure_url: string;
      let public_id: string;

      if (file) {
        const signature = await fetchBannerSignatureBFF();
        const uploaded = await uploadBannerToCloudinary(file, signature);
        secure_url = uploaded.secure_url;
        public_id = uploaded.public_id || signature.public_id;
      } else if (banner?.imageUrl) {
        secure_url = banner.imageUrl;
        public_id = "dashboard/banner/current";
      } else {
        setFieldError("Selecciona una imagen para el banner.");
        setSaving(false);
        return;
      }

      await confirmBannerBFF({ secure_url, public_id, targetUrl: url });

      sileo.success({
        title: "Banner actualizado",
        fill: "#58d68d",
        duration: 2500,
      });

      setFile(null);
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadBanner();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo guardar el banner";
      sileo.error({
        title: "Error al guardar",
        description: msg,
        fill: "#f35761",
        duration: 3500,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!banner) return;
    setDeleting(true);
    try {
      await deleteBannerBFF();
      sileo.success({
        title: "Banner eliminado",
        fill: "#58d68d",
        duration: 2500,
      });
      setBanner(null);
      setTargetUrl("");
      setFile(null);
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo eliminar el banner";
      sileo.error({
        title: "Error al eliminar",
        description: msg,
        fill: "#f35761",
        duration: 3500,
      });
    } finally {
      setDeleting(false);
    }
  };

  const displayPreview = localPreview
    ? localPreview
    : banner?.imageUrl
      ? previewSrc(banner.imageUrl)
      : null;

  const busy = saving || deleting || loading;

  return (
    <>
      <button
        type="button"
        className="banner-manager__trigger"
        onClick={() => setOpen(true)}
      >
        Banner
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="banner-manager-dialog" showCloseButton>
          <DialogHeader>
            <DialogTitle className="banner-manager__title">
              Banner del dashboard
            </DialogTitle>
            <DialogDescription className="banner-manager__description">
              Imagen promocional en el dashboard del estudiante (proporción fija
              4:5). Al subir una nueva se reemplaza la anterior.
            </DialogDescription>
          </DialogHeader>

          <div
            className="banner-manager__preview"
            style={{ aspectRatio: ASPECT }}
            aria-label="Vista previa del banner"
          >
            {loading ? (
              <span className="banner-manager__preview-empty">Cargando…</span>
            ) : displayPreview ? (
              <img
                className="banner-manager__preview-img"
                src={displayPreview}
                alt="Vista previa"
              />
            ) : (
              <span className="banner-manager__preview-empty">
                Sin banner configurado
              </span>
            )}
          </div>

          <div className="banner-manager__field">
            <label className="banner-manager__label" htmlFor="banner-file">
              Imagen
            </label>
            <input
              id="banner-file"
              ref={fileInputRef}
              className="banner-manager__file"
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={handleFileChange}
            />
            <p className="banner-manager__hint">
              Se muestra con recorte centrado 4:5. Formatos: JPG, PNG, WebP.
            </p>
          </div>

          <div className="banner-manager__field">
            <label className="banner-manager__label" htmlFor="banner-target">
              URL de destino
            </label>
            <input
              id="banner-target"
              className="banner-manager__input"
              type="url"
              inputMode="url"
              placeholder="https://ejemplo.com/evento"
              value={targetUrl}
              disabled={busy}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>

          {fieldError && (
            <p className="banner-manager__error" role="alert">
              {fieldError}
            </p>
          )}

          <div className="banner-manager__actions">
            {banner && (
              <button
                type="button"
                className="banner-manager__btn banner-manager__btn--danger"
                disabled={busy}
                onClick={handleDelete}
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            )}
            <button
              type="button"
              className="banner-manager__btn banner-manager__btn--ghost"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="banner-manager__btn banner-manager__btn--primary"
              disabled={busy || (!file && !banner)}
              onClick={handleSave}
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
