import Link from "next/link";
import Image from "next/image";
import { getUpcomingEvents, getStats } from "@/lib/queries";
import EventCard from "@/components/event-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [upcoming, stats] = await Promise.all([
    getUpcomingEvents(3),
    getStats(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brz-line">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Team Brz rider"
            fill
            priority
            className="object-cover object-[70%_center] opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brz-black via-brz-black/90 to-brz-black/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-36">
          <span className="badge border border-brz-red/50 bg-brz-red/10 text-brz-red">
            🏁 Riders since day one
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold uppercase leading-[1.05] tracking-tight text-brz-white md:text-7xl">
            Team <span className="text-brz-red">Brz</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-brz-mute">
            A riding family, not just a club. Join tours across the country,
            earn your medals, and trade gear with people who actually ride.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-md bg-brz-red px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-brz-black transition hover:bg-brz-amber"
            >
              Join the club
            </Link>
            <Link
              href="/events"
              className="rounded-md border border-brz-line px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-brz-white transition hover:border-brz-red hover:text-brz-red"
            >
              See upcoming events
            </Link>
          </div>
        </div>
        <div className="h-1.5 checker-flag-red" />
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-3 divide-x divide-brz-line rounded-xl border border-brz-line bg-brz-charcoal text-center">
          <Stat value={stats.members} label="Verified riders" />
          <Stat value={stats.events} label="Events run" />
          <Stat value={stats.listings} label="Marketplace listings" />
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
          Why ride with us
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon="🗺️"
            title="Tours & meetups"
            desc="Register for group tours, city meetups, and workshops — see who else is riding."
          />
          <Feature
            icon="🎖️"
            title="Medals & rank"
            desc="Host a ride, lead a tour, hit a milestone — admins award medals that show on your profile."
          />
          <Feature
            icon="🛠️"
            title="Buy & sell"
            desc="A trusted marketplace for bikes and gear — engine oil, helmets, and more — between verified riders."
          />
          <Feature
            icon="✅"
            title="Verified members"
            desc="Every profile is reviewed and approved by admins, so you know you're riding with real people."
          />
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            Upcoming rides
          </h2>
          <Link
            href="/events"
            className="text-sm font-semibold uppercase tracking-wide text-brz-red hover:text-brz-amber"
          >
            View all →
          </Link>
        </div>
        {upcoming.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-brz-mute">
            Nothing on the calendar right now — check back soon.
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="absolute inset-x-0 top-0 h-1.5 checker-flag-red" />
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            Ready to ride with Team Brz?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-brz-mute">
            Create your rider profile in two minutes. An admin reviews and
            approves every new member.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-md bg-brz-red px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-brz-black transition hover:bg-brz-amber"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-4 py-8">
      <div className="font-display text-4xl font-bold text-brz-red">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-brz-mute">
        {label}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="card p-5">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-brz-mute">{desc}</p>
    </div>
  );
}
