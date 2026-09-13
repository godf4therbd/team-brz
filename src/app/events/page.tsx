import Link from "next/link";
import { getUpcomingEvents, getPastEvents } from "@/lib/queries";
import EventCard from "@/components/event-card";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-brz-white">
            Events
          </h1>
          <p className="mt-1 text-brz-mute">
            Tours, meetups, and workshops — register below.
          </p>
        </div>
        <Link
          href="/feed.xml"
          className="badge border border-brz-line text-brz-mute hover:border-brz-red hover:text-brz-red"
        >
          📡 RSS feed
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-red">
          Upcoming
        </h2>
        {upcoming.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-brz-mute">No upcoming events scheduled.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-mute">
          Past events
        </h2>
        {past.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-brz-mute">No past events yet.</p>
        )}
      </section>
    </div>
  );
}
