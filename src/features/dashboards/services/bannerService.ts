import type {
  BannerApiResponse,
  BannerUploadSignature,
  ConfirmBannerPayload,
  ConfirmBannerResponse,
  DashboardBanner,
  DeleteBannerResponse,
} from "../types/banner.types";

const API_BASE = (import.meta.env.API_URL ?? "").replace(/\/$/, "");

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(
    `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    },
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const err = new Error(
      errorBody?.message ?? `HTTP ${res.status}: ${res.statusText}`,
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getDashboardBanner(
  token: string,
): Promise<DashboardBanner | null> {
  const body = await request<BannerApiResponse | DashboardBanner | null>(
    "/dashboard/banner",
    token,
  );
  if (body == null) return null;
  if (typeof body === "object" && "data" in body) {
    return (body as BannerApiResponse).data ?? null;
  }
  if (typeof body === "object" && "imageUrl" in body) {
    return body as DashboardBanner;
  }
  return null;
}

export async function getBannerUploadSignature(
  token: string,
): Promise<BannerUploadSignature> {
  return request<BannerUploadSignature>(
    "/dashboard/banner/upload-signature",
    token,
  );
}

export async function confirmDashboardBanner(
  token: string,
  payload: ConfirmBannerPayload,
): Promise<ConfirmBannerResponse> {
  return request<ConfirmBannerResponse>("/dashboard/banner/confirm", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteDashboardBanner(
  token: string,
): Promise<DeleteBannerResponse> {
  return request<DeleteBannerResponse>("/dashboard/banner", token, {
    method: "DELETE",
  });
}

export async function fetchBannerBFF(): Promise<DashboardBanner | null> {
  const res = await fetch("/api/dashboard/banner");
  if (res.status === 401) {
    window.location.href = "/?session_expired=true";
    throw new Error("No autenticado");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Error al obtener el banner");
  }
  const body = await res.json();
  if (body == null) return null;
  if (typeof body === "object" && "data" in body) return body.data ?? null;
  if (typeof body === "object" && "imageUrl" in body) return body as DashboardBanner;
  return null;
}

export async function fetchBannerSignatureBFF(): Promise<BannerUploadSignature> {
  const res = await fetch("/api/dashboard/banner/upload-signature");
  if (res.status === 401) {
    window.location.href = "/?session_expired=true";
    throw new Error("No autenticado");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Error al obtener la firma de subida");
  }
  return res.json();
}

export async function confirmBannerBFF(
  payload: ConfirmBannerPayload,
): Promise<ConfirmBannerResponse> {
  const res = await fetch("/api/dashboard/banner/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 401) {
    window.location.href = "/?session_expired=true";
    throw new Error("No autenticado");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Error al confirmar el banner");
  }
  return res.json();
}

export async function deleteBannerBFF(): Promise<DeleteBannerResponse> {
  const res = await fetch("/api/dashboard/banner", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status === 401) {
    window.location.href = "/?session_expired=true";
    throw new Error("No autenticado");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Error al eliminar el banner");
  }
  return res.json();
}

export async function uploadBannerToCloudinary(
  file: File | Blob,
  signature: BannerUploadSignature,
): Promise<{ secure_url: string; public_id: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.api_key);
  form.append("timestamp", String(signature.timestamp));
  form.append("signature", signature.signature);
  form.append("folder", signature.folder);
  form.append("public_id", signature.public_id);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.error?.message ?? "Error al subir la imagen a Cloudinary",
    );
  }

  const data = await res.json();
  const secure_url = data.secure_url ?? data.url;
  const public_id = data.public_id ?? signature.public_id;
  if (!secure_url) throw new Error("Cloudinary no devolvió secure_url");
  return { secure_url, public_id };
}
