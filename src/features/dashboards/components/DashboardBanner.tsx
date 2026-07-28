import { useEffect, useState } from "react";
import { fetchBannerBFF } from "../services/bannerService";
import type { DashboardBanner as BannerData } from "../types/banner.types";
import { buildCloudinaryUrl } from "@/lib/cloudinary";
import { CLOUDINARY_SIZE } from "@/lib/cloudinary";
import ImageIcon from "./icons/ImageIcon.svg?url";
import "../styles/DashboardBanner.css";

function bannerImageSrc(url: string): string {
  return buildCloudinaryUrl(url, {
    ...CLOUDINARY_SIZE.banner,
    crop: "fill",
    gravity: "center",
    face: false,
  });
}

export default function DashboardBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBannerBFF();
        if (!cancelled) setBanner(data);
      } catch {
        if (!cancelled) setBanner(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-banner" aria-busy="true" aria-label="Cargando banner">
        <div className="dashboard-banner__skeleton" />
      </div>
    );
  }

  if (banner?.imageUrl) {
    const src = bannerImageSrc(banner.imageUrl);
    const img = (
      <img
        className="dashboard-banner__image"
        src={src}
        alt="Banner del dashboard"
        width={CLOUDINARY_SIZE.banner.width}
        height={CLOUDINARY_SIZE.banner.height}
      />
    );

    if (banner.targetUrl) {
      return (
        <div className="dashboard-banner">
          <a
            className="dashboard-banner__link"
            href={banner.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {img}
          </a>
        </div>
      );
    }

    return <div className="dashboard-banner">{img}</div>;
  }

  return (
    <div className="dashboard-banner">
      <div className="dashboard-banner__fallback">
        <img
          className="dashboard-banner__fallback-icon"
          src={ImageIcon}
          alt=""
          aria-hidden
        />
      </div>
    </div>
  );
}
