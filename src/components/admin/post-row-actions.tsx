"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostRowActions({
  deleteUrl,
}: {
  // Full API path, e.g. `/api/admin/blog/${id}` or `/api/admin/news/${id}`.
  deleteUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setLoading(true);
    await fetch(deleteUrl, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      disabled={loading}
      onClick={remove}
      className="text-sm font-semibold text-red-400 hover:underline disabled:opacity-60"
    >
      Delete
    </button>
  );
}
