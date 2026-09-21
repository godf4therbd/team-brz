"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { photosToJson } from "@/lib/utils";

type EventType = "TOUR" | "MEETUP" | "WORKSHOP" | "CHARITY" | "OTHER";
type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({
  eventId,
  initial,
}: {
  eventId?: string;
  initial?: {
    title: string;
    description: string;
    type: EventType;
    location: string;
    startDate: string;
    endDate: string | null;
    capacity: number | null;
    status: EventStatus;
    photos?: string[];
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    type: initial?.type ?? ("TOUR" as EventType),
    location: initial?.location ?? "",
    startDate: toLocalInput(initial?.startDate) ,
    endDate: toLocalInput(initial?.endDate),
    capacity: initial?.capacity?.toString() ?? "",
    status: initial?.status ?? ("PUBLISHED" as EventStatus),
    photosText: initial?.photos?.join("\n") ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.startDate) {
      setError("Start date/time is required.");
      return;
    }
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      location: form.location,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
      status: form.status,
      photos: photosToJson(form.photosText),
    };

    const res = await fetch(
      eventId ? `/api/admin/events/${eventId}` : "/api/admin/events",
      {
        method: eventId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mt-5 max-w-2xl space-y-4 p-6">
      {error && (
        <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Title
        </label>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="field"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Description
        </label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="field"
          >
            <option value="TOUR">Tour</option>
            <option value="MEETUP">Meetup</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="CHARITY">Charity</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="field"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Location
        </label>
        <input
          required
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Start date & time
          </label>
          <input
            required
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            End date & time (optional)
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Capacity (optional)
        </label>
        <input
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) => update("capacity", e.target.value)}
          className="field"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
          Photos (optional)
        </label>
        <textarea
          rows={4}
          value={form.photosText}
          onChange={(e) => update("photosText", e.target.value)}
          placeholder={"One image path per line, e.g.\n/images/tours/brz-mega-tour-1/1.jpg\n/images/tours/brz-mega-tour-1/2.jpg"}
          className="field font-mono text-xs"
        />
        <p className="mt-1 text-xs text-brz-mute">
          Shown as a photo gallery on the event page. One image path or URL
          per line.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brz-red py-2.5 font-display font-bold uppercase tracking-wide text-brz-black transition hover:bg-brz-amber disabled:opacity-60"
      >
        {loading ? "Saving..." : eventId ? "Save changes" : "Create event"}
      </button>
    </form>
  );
}
