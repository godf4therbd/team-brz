"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);
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
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onFileChange}
            className="hidden"
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
