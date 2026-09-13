"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventRowActions({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      disabled={loading}
      onClick={remove}
      className="text-sm font-semibold text-red-400 hover:underline"
    >
      Delete
    </button>
  );
}
