import Link from "next/link";
import { getAllEventsAdmin } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/utils";
import EventRowActions from "@/components/admin/event-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const allEvents = await getAllEventsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
          Events ({allEvents.length})
        </h2>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-brz-red px-4 py-2 text-sm font-bold uppercase tracking-wide text-brz-black hover:bg-brz-amber"
        >
          + New event
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {allEvents.map((e) => {
          const confirmed = e.registrations.filter(
            (r) => r.status === "CONFIRMED"
          ).length;
          return (
            <div
              key={e.id}
              className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-semibold uppercase tracking-wide text-brz-white">
                    {e.title}
                  </p>
                  <span className="badge border border-brz-line text-brz-mute">
                    {e.status}
                  </span>
                </div>
                <p className="text-xs text-brz-mute">
                  {formatDateTime(e.startDate)} · {e.location} · {confirmed}
                  {e.capacity ? `/${e.capacity}` : ""} registered
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/events/${e.slug}`}
                  className="text-sm text-brz-mute hover:text-brz-red"
                >
                  View
                </Link>
                <Link
                  href={`/admin/events/${e.id}/edit`}
                  className="text-sm font-semibold text-brz-red hover:underline"
                >
                  Edit
                </Link>
                <EventRowActions eventId={e.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
