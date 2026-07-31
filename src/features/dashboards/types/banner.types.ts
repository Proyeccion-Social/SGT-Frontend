export interface DashboardBanner {
  imageUrl: string;
  targetUrl: string;
  updatedAt: string;
}

export interface BannerUploadSignature {
  timestamp: string;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id: string;
}

export interface ConfirmBannerPayload {
  secure_url: string;
  public_id: string;
  targetUrl: string;
}

export interface BannerApiResponse {
  success: boolean;
  data: DashboardBanner | null;
}

export interface ConfirmBannerResponse {
  message: string;
}

export interface DeleteBannerResponse {
  message: string;
}
