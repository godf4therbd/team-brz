"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CropDialog from "@/components/crop-dialog";
import {
  cropToJpeg,
  toDisplayableUrl,
  type CropArea,
} from "@/lib/image-client";

// Flow: pick any image → crop it (circle for avatars, 4:3 for bike photos)
// → only the cropped area is scaled down and re-encoded as JPEG in the
// browser (lib/image-client.ts) → upload.
const OUTPUT_MAX = { avatar: 800, bike: 1600 } as const; // px, longest side
const ASPECT = { avatar: 1, bike: 4 / 3 } as const;

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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [baseName, setBaseName] = useState("photo");

  const closeCropper = useCallback(() => {
    setCropSrc((src) => {
      if (src) URL.revokeObjectURL(src);
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setReading(true);
    try {
      setBaseName(file.name.replace(/\.[^.]*$/, "") || "photo");
      setCropSrc(await toDisplayableUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that image.");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setReading(false);
    }
  }

  async function saveCrop(area: CropArea) {
    if (!cropSrc) return;
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
        <CropDialog
          src={cropSrc}
          aspect={ASPECT[kind]}
          round={kind === "avatar"}
          title={`Crop ${label.toLowerCase()}`}
          saving={loading}
          onCancel={closeCropper}
          onSave={saveCrop}
        />
      )}
    </div>
  );
}
