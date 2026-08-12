/**
 * Runtime Cloudinary URL transforms.
 * Base URLs from the API stay unchanged; transformations are applied here.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/image/upload/";

/** Display sizes (CSS px). With dpr_auto Cloudinary serves retina when needed. */
export const CLOUDINARY_SIZE = {
  /** Dashboard incoming-session cards (~48px CSS; 2× for sharpness) */
  avatarSm: { width: 96, height: 96 },
  /** Session detail header (~62px CSS; 2× for sharpness) */
  avatarMd: { width: 128, height: 128 },
  /** Email / evaluation dialogs (~92px) */
  avatarLg: { width: 96, height: 96 },
  /** History session card (~160px) */
  avatarXl: { width: 160, height: 160 },
  /** Search accordion panels (~250px tall) */
  list: { width: 400, height: 500 },
  /** Tutor detail profile (~260×225) */
  profile: { width: 400, height: 400 },
  /**
   * Scheduling tutor cards (paso 1 del agendamiento).
   *
   * Cuadrada a propósito: la caja CSS usa `aspect-ratio: 1 / 1` con la misma
   * proporción en Desktop y móvil, de modo que el `object-fit: cover` del CSS
   * quede neutro y no vuelva a recortar lo que ya encuadró Cloudinary.
   *
   * `g_auto:faces` y **no** `g_face`/`g_auto:face`: sobre las fotos reales de
   * tutores, la detección devuelve una caja delimitadora inflada que abarca de
   * la cabeza a la cintura. Como la gravedad de rostro ancla en el *centro* de
   * esa caja, el recorte aterriza en el pecho y corta la cabeza (issue #270).
   *
   * Tampoco `c_thumb` + `z_`: el zoom se calcula sobre esa misma caja inflada,
   * así que agrava el problema en vez de corregirlo.
   */
  cover: {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "auto:faces",
  },
  /** Dashboard promo banner 4:5 (~300×375 CSS; 2× for sharpness) */
  banner: { width: 600, height: 750 },
} as const;

export type CloudinarySizeKey = keyof typeof CLOUDINARY_SIZE;

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  /** Crop mode. Default `fill` for avatars. */
  crop?: "fill" | "fit" | "limit" | "scale" | "thumb";
  /**
   * Gravity. Default `face` for avatars.
   *
   * `face` ancla en el centro de la caja detectada y degrada al **centro
   * geométrico** si no hay rostro; con cajas mal detectadas (demasiado
   * grandes) el recorte se va al torso. `auto:faces` pondera el rostro dentro
   * del análisis de saliencia, lo que resiste ese caso y degrada a recorte por
   * contenido. Ver el preset `cover` y el issue #270.
   */
  gravity?: "face" | "auto" | "auto:face" | "auto:faces" | "center";
  /** Skip face gravity (e.g. non-portrait images). */
  face?: boolean;
};

const DEFAULT_FALLBACK = "/default-avatar.svg";

export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === CLOUDINARY_HOST && parsed.pathname.includes(UPLOAD_SEGMENT);
  } catch {
    return false;
  }
}

/**
 * Inserts transformation segment after `/image/upload/`.
 * Idempotent: strips a previous transform block if present.
 */
export function buildCloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {},
): string {
  if (!url?.trim()) return DEFAULT_FALLBACK;
  if (!isCloudinaryUrl(url)) return url;

  const {
    width,
    height,
    crop = "fill",
    gravity = "face",
    face = true,
  } = options;

  const parts = [
    "f_auto",
    "q_auto",
    "dpr_auto",
    crop ? `c_${crop}` : null,
    face ? `g_${gravity}` : null,
    width != null ? `w_${Math.round(width)}` : null,
    height != null ? `h_${Math.round(height)}` : null,
  ].filter(Boolean);

  const transform = parts.join(",");
  const marker = UPLOAD_SEGMENT;
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const afterUpload = url.slice(idx + marker.length);
  const withoutOldTransform = stripExistingTransforms(afterUpload);

  return `${url.slice(0, idx + marker.length)}${transform}/${withoutOldTransform}`;
}

/** Removes a single transformation segment if present (idempotent re-apply). */
function stripExistingTransforms(afterUpload: string): string {
  if (/^v\d+\//.test(afterUpload)) return afterUpload;

  const slash = afterUpload.indexOf("/");
  if (slash === -1) return afterUpload;

  const first = afterUpload.slice(0, slash);
  const looksLikeTransform =
    first.includes(",") ||
    /^(?:f_|q_|w_|h_|c_|g_|z_|dpr_|e_|b_|r_|a_|o_|l_)/.test(first);

  return looksLikeTransform ? afterUpload.slice(slash + 1) : afterUpload;
}

/** Convenience: named preset → optimized URL (or fallback). */
export function cloudinaryImage(
  url: string | null | undefined,
  size: CloudinarySizeKey | CloudinaryTransformOptions,
): string {
  if (!url?.trim()) return DEFAULT_FALLBACK;

  const opts: CloudinaryTransformOptions =
    typeof size === "string" ? CLOUDINARY_SIZE[size] : size;

  return buildCloudinaryUrl(url, opts);
}

export function getCloudinaryFallback(): string {
  return DEFAULT_FALLBACK;
}
