import React, { useState, useCallback, useRef } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import "../styles/UploadProfileImage.css";
import { Button } from "@/components/ui/button";
import uploadImageIcon from "../assets/uploadImageIcon.svg";
import sliderIcon from "../assets/sliderIcon.svg";
import rotateLeftIcon from "../assets/rotateLeftIcon.svg";
import rotateRightIcon from "../assets/rotateRightIcon.svg";

interface UploadProfileImageProps {
  tutorName?: string;
  onNext: (croppedBlob: Blob | null) => void;
  onBack?: () => void;
  onSkip?: () => void;
  isMandatory?: boolean;
  isSubmitting?: boolean;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((resolve) => { image.onload = () => resolve(); });

  // Área segura: diagonal del rectángulo original para no cortar al rotar
  const maxSize  = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // 1. Dibujar imagen rotada sobre canvas grande
  const rotCanvas = document.createElement("canvas");
  rotCanvas.width  = safeArea;
  rotCanvas.height = safeArea;
  const rotCtx = rotCanvas.getContext("2d")!;

  rotCtx.translate(safeArea / 2, safeArea / 2);
  rotCtx.rotate((rotation * Math.PI) / 180);
  rotCtx.translate(-image.width / 2, -image.height / 2);
  rotCtx.drawImage(image, 0, 0);

  // 2. Extraer solo el área del recorte
  const data = rotCtx.getImageData(0, 0, safeArea, safeArea);

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width  = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  const cropCtx = cropCanvas.getContext("2d")!;

  cropCtx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width  * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas vacío"))),
      "image/jpeg",
      0.92
    );
  });
}

export default function UploadProfileImage({ onNext, onBack, onSkip, isMandatory, isSubmitting }: UploadProfileImageProps) {
  const [image,             setImage]             = useState<string | null>(null);
  const [crop,              setCrop]              = useState<Point>({ x: 0, y: 0 });
  const [zoom,              setZoom]              = useState<number>(1);
  const [rotation,          setRotation]          = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDragging,        setIsDragging]        = useState(false);
  const [isProcessing,      setIsProcessing]      = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Leer archivo ── */
  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    });
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) readFile(e.target.files[0]);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) readFile(e.dataTransfer.files[0]);
  }, []);

  /* ── Recorte completo ── */
  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  /* ── Continuar ── */
  const handleContinue = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels, rotation);
      onNext(blob);
    } catch (err) {
      console.error("Error procesando imagen:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  /* ── Zoom con botones ── */
  const zoomOut = () => setZoom((z) => Math.max(1,   parseFloat((z - 0.1).toFixed(2))));
  const zoomIn  = () => setZoom((z) => Math.min(3,   parseFloat((z + 0.1).toFixed(2))));

  /* ── Rotación 90° ── */
  const rotateLeft  = () => setRotation((r) => (r - 90 + 360) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  /* ─────────────────────── RENDER ─────────────────────────── */
  return (
    <>
      <div className="drawer-body">
        <div className="body-header">
            <p className="body-header-title">Sube tu foto de perfil</p>
            <p className="body-header-subtitle">Recuerda seguir los lineamientos definidos</p>
        </div>
        <div className="body-content">
          {!image ? (
            /* == ESTADO 1: Upload == */
            <div className="upload-container">
                <div 
                    className={`upload-dropzone${isDragging ? " upload-dropzone-over" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                    <div className="upload-icon-container">
                        <img
                          src={uploadImageIcon.src}
                          className="upload-icon"
                          alt="Icono para subir una imagen de perfil"
                        />
                    </div>
                    {isDragging && (
                        <p className="upload-dropzone-drag-msg">Suelta la imagen aquí</p>
                    )}
                </div>
            </div>

          ) : (
            /* == ESTADO 2: Editar recorte == */
            <div className="editor-container">
              {/* Área de recorte */}
              <div className="editor-crop-wrap">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: {
                      background: "#f3f4f6",
                      borderRadius: "12px",
                    },
                    cropAreaStyle: {
                      border: "2.5px solid rgba(255,255,255,0.95)",
                      boxShadow: "0 0 0 9999px rgba(20,15,45,0.45)",
                    },
                  }}
                />
              </div>

              {/* Barra de controles: rotar — zoom — rotar */}
              <div className="editor-controls">

                {/* Rotar izquierda */}
                <button
                  type="button"
                  className="rotate-button"
                  onClick={rotateLeft}
                  aria-label="Rotar 90° a la izquierda"
                  title="Rotar izquierda"
                >
                  <img src={rotateLeftIcon.src} alt="Rotate Left" />
                </button>

                {/* Controles de zoom */}
                <div className="zoom-container">
                    <div className="zoom-header">
                        <img src={sliderIcon.src} alt="Slider Icon" />
                        <span className="zoom-label">Acerca y ajusta</span>
                    </div>
                    <div className="zoom-track">
                        <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="zoom-slider"
                        aria-label="Nivel de zoom"
                        style={{
                            background: `linear-gradient(to right, #B797FF ${((zoom - 1) / 2) * 100}%, #E5E7EB ${((zoom - 1) / 2) * 100}%)`
                        }}
                        />
                    </div>
                </div>

                {/* Rotar derecha */}
                <Button className="rotate-button" onClick={rotateRight} aria-label="Rotar 90° a la derecha">
                  <img src={rotateRightIcon.src} alt="Rotate Right" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="body-footer-buttons">
          {image ? (
            <>
                {isProcessing ? (
                  <Button className="next-button" disabled>
                    <span className="loading-spinner" /> Procesando…
                  </Button>
                ) : (
                  <>
                    <Button className="back-button" onClick={handleCancel}>Cancelar</Button>
                    <Button className="next-button" onClick={handleContinue}>Continuar</Button>
                  </>
                )}
            </>
          ) : (
            <>
              {onBack && (
                  <Button className="back-button" onClick={onBack}>Cancelar</Button>
              )}
              <Button className="skip-button" onClick={onSkip} disabled={isMandatory || isSubmitting}>
                  Omitir
              </Button>
              <Button className="next-button" onClick={() => onNext(null)} disabled={!image || isSubmitting}>
                  {isSubmitting ? "Cargando..." : "Continuar"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </>
  );
}