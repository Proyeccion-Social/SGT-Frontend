import {
  useCallback,
  useEffect,
  useState,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";
import {
  cloudinaryImage,
  getCloudinaryFallback,
  type CloudinarySizeKey,
  type CloudinaryTransformOptions,
  CLOUDINARY_SIZE,
} from "@/lib/cloudinary";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string | null | undefined;
  size: CloudinarySizeKey | CloudinaryTransformOptions;
  width?: number;
  height?: number;
  /** Default true for images below the fold. */
  lazy?: boolean;
};

function resolveDims(
  size: CloudinarySizeKey | CloudinaryTransformOptions,
  width?: number,
  height?: number,
): { width: number; height: number } {
  if (width != null && height != null) return { width, height };
  if (typeof size === "string") {
    const preset = CLOUDINARY_SIZE[size];
    return { width: width ?? preset.width, height: height ?? preset.height };
  }
  return {
    width: width ?? size.width ?? 64,
    height: height ?? size.height ?? 64,
  };
}

export function CloudinaryImage({
  src,
  size,
  alt = "",
  width,
  height,
  lazy = true,
  onError,
  className,
  ...rest
}: Props) {
  const dims = resolveDims(size, width, height);
  const optimized = cloudinaryImage(src, size);
  const fallback = getCloudinaryFallback();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src, optimized]);

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      if (failed) return;
      setFailed(true);
      onError?.(e);
    },
    [failed, onError],
  );

  return (
    <img
      src={failed ? fallback : optimized}
      alt={alt}
      width={dims.width}
      height={dims.height}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}

export default CloudinaryImage;
