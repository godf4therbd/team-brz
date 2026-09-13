"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ListingActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: "SOLD" | "REMOVED") {
    setLoading(true);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2">
      <button
        disabled={loading}
        onClick={() => setStatus("SOLD")}
        className="rounded-md border border-green-700 px-4 py-2 text-sm font-semibold text-green-400 hover:bg-green-950/40"
      >
        Mark as sold
      </button>
      <button
        disabled={loading}
        onClick={() => setStatus("REMOVED")}
        className="rounded-md border border-red-800 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/40"
      >
        Remove listing
      </button>
    </div>
  );
}
