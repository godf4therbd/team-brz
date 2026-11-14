"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Vercel rejects any request body over 4.5MB before it reaches our route,
// so big phone photos can't be uploaded raw. Instead, any image the
// browser can decode (JPEG, PNG, WebP, GIF, BMP, AVIF, HEIC on Safari, …)
// is scaled down and re-encoded as JPEG here, so members can pick any
// type and any size of image and it still arrives small.
const MAX_DIMENSION = 1600; // px, longest side
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // keep under Vercel's 4.5MB cap

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Some browsers/formats only decode through an <img> element.
    const url = URL.createObjectURL(file);
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("decode failed"));
        img.src = url;
      });
    } finally {
      // Revoke after a tick so the decoded image stays drawable.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  }
}

function isHeic(file: File) {
  return (
    /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  );
}

// iPhone HEIC photos: only Safari decodes them natively. Elsewhere, convert
// to JPEG with heic2any — loaded on demand so it never weighs down pages
// that don't need it.
async function heicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(out) ? out[0] : out;
  return new File([blob], file.name.replace(/\.[^.]*$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

async function prepareImage(file: File): Promise<File> {
  // Small GIFs go up untouched so animated avatars keep their animation.
  if (file.type === "image/gif" && file.size <= MAX_UPLOAD_BYTES) return file;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decodeImage(file);
  } catch {
    if (isHeic(file)) {
      try {
        source = await decodeImage(await heicToJpeg(file));
      } catch {
        throw new Error("Couldn't read this HEIC photo. Please try a JPG or PNG.");
      }
      return encodeJpeg(source, file.name);
    }
    // Browser can't read it (e.g. HEIC outside Safari). Send it as-is if
    // it's already a small, supported file; otherwise explain.
    if (
      ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
      file.size <= MAX_UPLOAD_BYTES
    ) {
      return file;
    }
    throw new Error(
      "This browser can't read that image format. Please try a JPG or PNG."
    );
  }

  return encodeJpeg(source, file.name);
}

async function encodeJpeg(
  source: ImageBitmap | HTMLImageElement,
  originalName: string
): Promise<File> {
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image in this browser.");
  // JPEG has no transparency — fill white so transparent PNGs don't go black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", quality)
    );
    if (blob && blob.size <= MAX_UPLOAD_BYTES) {
      const name = originalName.replace(/\.[^.]*$/, "") || "photo";
      return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
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
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);

    let upload: File;
    try {
      upload = await prepareImage(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that image.");
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
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
    if (inputRef.current) inputRef.current.value = "";
  }

  const shown = preview || currentUrl;

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
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-brz-line px-3 py-1.5 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red disabled:opacity-60"
          >
            {loading ? "Uploading..." : shown ? "Change photo" : "Upload photo"}
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
    </div>
  );
}
