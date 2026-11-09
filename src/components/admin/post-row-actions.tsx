"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostRowActions({
  deleteUrl,
}: {
  deleteUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || `Delete failed (${res.status}).`);
      }
    } catch {
      setError("Network error — post may not have been deleted.");
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <span className="flex items-center gap-2">
      <button
        disabled={loading}
        onClick={remove}
        className="text-sm font-semibold text-red-400 hover:underline disabled:opacity-60"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </span>
  );
}
