import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEventBySlug } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import RegisterButton from "@/components/register-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const typeLabel: Record<string, string> = {
  TOUR: "Tour",
  MEETUP: "Meetup",
  WORKSHOP: "Workshop",
  CHARITY: "Charity ride",
  OTHER: "Event",
};

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [event, session] = await Promise.all([
    getEventBySlug(params.slug),
    getServerSession(authOptions),
  ]);
  if (!event) notFound();

  const confirmed = event.registrations.filter(
    (r) => r.status === "CONFIRMED"
  );
  const waitlisted = event.registrations.filter((r) => r.status === "PENDING");
  const isPast = new Date(event.startDate) < new Date();
  const isFull = event.capacity != null && confirmed.length >= event.capacity;
  const isRegistered = session
    ? event.registrations.some((r) => r.userId === session.user.id)
    : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <Link href="/events" className="text-sm text-brz-mute hover:text-brz-red">
        ← All events
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red">
          {typeLabel[event.type] ?? "Event"}
        </span>
        {isPast && (
          <span className="badge border border-brz-line text-brz-mute">
            Past event
          </span>
        )}
        {!isPast && isFull && (
          <span className="badge border border-red-800 bg-red-950/40 text-red-300">
            Full — waitlist open
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-brz-white">
        {event.title}
      </h1>

      <div className="mt-4 grid gap-1 text-brz-mute">
        <p>🗓️ {formatDateTime(event.startDate)}</p>
        {event.endDate && <p>🏁 Ends {formatDateTime(event.endDate)}</p>}
        <p>📍 {event.location}</p>
        {event.createdBy && <p>👤 Organized by {event.createdBy.name}</p>}
      </div>

      <div className="mt-8 whitespace-pre-line text-brz-white/90">
        {event.description}
      </div>

      <div className="card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-brz-mute">
            {confirmed.length}
            {event.capacity ? ` / ${event.capacity}` : ""} riders registered
            {waitlisted.length > 0 && ` · ${waitlisted.length} on waitlist`}
          </p>
        </div>
        <RegisterButton
          slug={event.slug}
          isRegistered={isRegistered}
          isPast={isPast}
          isFull={isFull}
        />
      </div>

      {confirmed.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
            Who&apos;s riding
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {confirmed.map((r) => (
              <Link
                key={r.userId}
                href={`/members/${r.userId}`}
                className="badge border border-brz-line text-brz-white hover:border-brz-red hover:text-brz-red"
              >
                {r.user.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
