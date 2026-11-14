"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";

// Flow: pick any image → crop it (circle for avatars, 4:3 for bike photos)
// → only the cropped area is scaled down and re-encoded as JPEG in the
// browser → upload. Shrinking client-side matters because Vercel rejects
// any request body over 4.5MB before it reaches our route, so big phone
// photos can't be uploaded raw.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // keep under Vercel's 4.5MB cap
const OUTPUT_MAX = { avatar: 800, bike: 1600 } as const; // px, longest side
const ASPECT = { avatar: 1, bike: 4 / 3 } as const;

function isHeic(file: File) {
  return (
    /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  );
}

// iPhone HEIC photos: only Safari decodes them natively. Elsewhere, convert
// to JPEG with heic2any — loaded on demand so it never weighs down pages
// that don't need it.
async function heicToJpeg(file: File): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(out) ? out[0] : out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

// Returns an object URL the browser can actually display (needed both for
// the cropper and for drawing the result), converting HEIC if necessary.
async function toDisplayableUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    await loadImage(url);
    return url;
  } catch {
    URL.revokeObjectURL(url);
  }
  if (isHeic(file)) {
    try {
      const jpeg = URL.createObjectURL(await heicToJpeg(file));
      await loadImage(jpeg);
      return jpeg;
    } catch {
      throw new Error("Couldn't read this HEIC photo. Please try a JPG or PNG.");
    }
  }
  throw new Error(
    "This browser can't read that image format. Please try a JPG or PNG."
  );
}

// Draws just the cropped area (in the image's natural pixels, which is what
// react-easy-crop reports) onto a canvas, capped at maxSide, as a JPEG.
async function cropToJpeg(
  src: string,
  area: Area,
  maxSide: number,
  baseName: string
): Promise<File> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(area.width, area.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width * scale));
  canvas.height = Math.max(1, Math.round(area.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image in this browser.");
  // JPEG has no transparency — fill white so transparent PNGs don't go black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  for (const quality of [0.88, 0.75, 0.6, 0.45]) {
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", quality)
    );
    if (blob && blob.size <= MAX_UPLOAD_BYTES) {
      return new File([blob], `${baseName || "photo"}.jpg`, {
        type: "image/jpeg",
      });
    }
  }
  throw new Error("Couldn't shrink this image enough to upload.");
}

export default function PhotoUpload({
  kind,
  currentUrl,
  targetUserId,
  label,
  shape = "circle",
}: {
  kind: "avatar" | "bike";
  currentUrl: string | null;
  // Omit for "upload my own photo". Pass another member's id to let an
  // admin set it on their behalf (the API re-checks this server-side).
  targetUserId?: string;
  label: string;
  shape?: "circle" | "rect";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [baseName, setBaseName] = useState("photo");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const closeCropper = useCallback(() => {
    setCropSrc((src) => {
      if (src) URL.revokeObjectURL(src);
      return null;
    });
    resetInput();
  }, []);

  // Esc closes the dialog; stop the page scrolling behind it.
  useEffect(() => {
    if (!cropSrc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCropper();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [cropSrc, closeCropper]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setReading(true);
    try {
      const url = await toDisplayableUrl(file);
      setBaseName(file.name.replace(/\.[^.]*$/, "") || "photo");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setArea(null);
      setCropSrc(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that image.");
      resetInput();
    } finally {
      setReading(false);
    }
  }

  async function saveCrop() {
    if (!cropSrc || !area) return;
    setLoading(true);
    setError(null);

    let upload: File;
    try {
      upload = await cropToJpeg(cropSrc, area, OUTPUT_MAX[kind], baseName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't process that image.");
      setLoading(false);
      closeCropper();
      return;
    }
    closeCropper();
    setPreview(URL.createObjectURL(upload));

    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", upload);
    if (targetUserId) formData.append("targetUserId", targetUserId);

    try {
      const res = await fetch("/api/account/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Upload failed.");
        setPreview(null);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — upload may not have saved.");
      setPreview(null);
    }
    setLoading(false);
  }

  const shown = preview || currentUrl;
  const busy = loading || reading;

  return (
    <div>
      <p className="mb-1.5 text-xs uppercase tracking-wide text-brz-mute">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <div
          className={
            "shrink-0 overflow-hidden border border-brz-line bg-brz-steel " +
            (shape === "circle" ? "h-16 w-16 rounded-full" : "h-16 w-24 rounded-md")
          }
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brz-mute">
              {kind === "avatar" ? "🙂" : "🏍️"}
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-brz-line px-3 py-1.5 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red disabled:opacity-60"
          >
            {loading
              ? "Uploading..."
              : reading
                ? "Opening..."
                : shown
                  ? "Change photo"
                  : "Upload photo"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={onFileChange}
            className="hidden"
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {cropSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Crop ${label.toLowerCase()}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeCropper()}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-brz-line bg-brz-charcoal sm:rounded-2xl">
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="font-display text-base font-semibold uppercase tracking-wide text-brz-white">
                Crop photo
              </h2>
              <button
                type="button"
                onClick={closeCropper}
                className="text-2xl leading-none text-brz-mute hover:text-brz-white"
                aria-label="Cancel"
              >
                ×
              </button>
            </div>

            {/* Fixed dark stage — the crop area must read the same in
                light and dark themes. */}
            <div className="relative h-[55vh] max-h-[420px] w-full bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                minZoom={1}
                maxZoom={4}
                aspect={ASPECT[kind]}
                cropShape={kind === "avatar" ? "round" : "rect"}
                showGrid={kind !== "avatar"}
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
                  onClick={closeCropper}
                  className="flex-1 rounded-md border border-brz-line py-2.5 text-sm font-semibold text-brz-mute transition hover:border-brz-red hover:text-brz-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCrop}
                  disabled={!area || loading}
                  className="flex-1 rounded-md bg-brz-red py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
