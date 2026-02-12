"use client";

import { useRef, useState } from "react";


interface ImageUploadProps {
  currentImageUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ currentImageUrl, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Formato no válido. Use JPG, PNG o WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es muy grande. Máximo 5MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] || null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  }

  const displayUrl = preview || currentImageUrl;

  return (
    <div className="space-y-3">
      {displayUrl && (
        <div className="relative w-full max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {preview && (
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          )}
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <p className="text-sm text-muted-foreground">
          {currentImageUrl && !preview
            ? "Arrastra una imagen para reemplazar"
            : "Arrastra una imagen o haz clic para seleccionar"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG o WebP. Máximo 5MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
