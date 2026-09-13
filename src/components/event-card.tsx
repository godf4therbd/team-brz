import Link from "next/link";
import { formatDate } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  TOUR: "Tour",
  MEETUP: "Meetup",
  WORKSHOP: "Workshop",
  CHARITY: "Charity",
  OTHER: "Event",
};

export default function EventCard({
  event,
}: {
  event: {
    slug: string;
    title: string;
    type: string;
    location: string;
    startDate: string;
    capacity?: number | null;
    registrations?: { status: string }[];
  };
}) {
  const confirmed =
    event.registrations?.filter((r) => r.status === "CONFIRMED").length ?? 0;
  const isPast = new Date(event.startDate) < new Date();

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card group block overflow-hidden p-5 transition hover:border-brz-red"
    >
      <div className="flex items-center justify-between">
        <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red">
          {typeLabel[event.type] ?? "Event"}
        </span>
        {isPast && (
          <span className="badge border border-brz-line text-brz-mute">
            Past
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-brz-white group-hover:text-brz-red">
        {event.title}
      </h3>
      <p className="mt-2 text-sm text-brz-mute">{formatDate(event.startDate)}</p>
      <p className="text-sm text-brz-mute">📍 {event.location}</p>
      {event.capacity ? (
        <p className="mt-3 text-xs uppercase tracking-wide text-brz-mute">
          {confirmed} / {event.capacity} riders registered
        </p>
      ) : (
        <p className="mt-3 text-xs uppercase tracking-wide text-brz-mute">
          {confirmed} rider{confirmed === 1 ? "" : "s"} registered
        </p>
      )}
    </Link>
  );
}
