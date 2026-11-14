"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { CropArea } from "@/lib/image-client";

// Modal crop step used by every photo upload. Drag to move, pinch or use
// the slider to zoom. Calls onSave with the crop in natural image pixels.
export default function CropDialog({
  src,
  aspect,
  round = false,
  title = "Crop photo",
  saving = false,
  onCancel,
  onSave,
}: {
  src: string;
  aspect: number;
  round?: boolean;
  title?: string;
  saving?: boolean;
  onCancel: () => void;
  onSave: (area: CropArea) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(null);

  // Esc closes the dialog; stop the page scrolling behind it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-brz-line bg-brz-charcoal sm:rounded-2xl">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-display text-base font-semibold uppercase tracking-wide text-brz-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-2xl leading-none text-brz-mute hover:text-brz-white"
            aria-label="Cancel"
          >
            ×
          </button>
        </div>

        {/* Fixed dark stage — the crop area must read the same in light
            and dark themes. */}
        <div className="relative h-[55vh] max-h-[420px] w-full bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={4}
            aspect={aspect}
            cropShape={round ? "round" : "rect"}
            showGrid={!round}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="flex items-center gap-3 text-sm text-brz-mute">
            <span aria-hidden="true">−</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-brz-red"
              aria-label="Zoom"
            />
            <span aria-hidden="true">+</span>
          </label>
          <p className="text-center text-xs text-brz-mute">
            Drag to move · pinch or use the slider to zoom
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-brz-line py-2.5 text-sm font-semibold text-brz-mute transition hover:border-brz-red hover:text-brz-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => area && onSave(area)}
              disabled={!area || saving}
              className="flex-1 rounded-md bg-brz-red py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
