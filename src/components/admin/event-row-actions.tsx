"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventRowActions({
  eventId,
  canDelete,
}: {
  eventId: string;
  // Moderators can only cancel an event, not delete it outright — that
  // stays an Admin/Co-Admin action. See /api/admin/events/[id]/route.ts.
  canDelete: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function cancelEvent() {
    if (!confirm("Cancel this event?")) return;
    setLoading(true);
    await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setLoading(false);
    router.refresh();
  }

  if (!canDelete) {
    return (
      <button
        disabled={loading}
        onClick={cancelEvent}
        className="text-sm font-semibold text-red-400 hover:underline"
      >
        Cancel
      </button>
    );
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
