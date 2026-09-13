"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ListingModerationActions({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Remove this listing?")) return;
    setLoading(true);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REMOVED" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      disabled={loading}
      onClick={remove}
      className="rounded-md border border-red-800 px-3 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-950/40"
    >
      Remove
    </button>
  );
}
