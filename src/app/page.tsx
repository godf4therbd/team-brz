import Link from "next/link";
import Image from "next/image";
import { getUpcomingEvents, getStats, getFeaturedMembers } from "@/lib/queries";
import EventCard from "@/components/event-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [upcoming, stats, crew] = await Promise.all([
    getUpcomingEvents(3),
    getStats(),
    getFeaturedMembers(4),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brz-line">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Team Brz crew"
            fill
            priority
            className="object-cover object-[50%_30%] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brz-black/45 via-brz-black/20 to-brz-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-brz-black/70 via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-28 md:px-6 md:py-40">
          <span className="badge border border-brz-red/50 bg-brz-red/10 text-brz-red">
            🏁 Riders since day one
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight text-brz-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] md:text-8xl">
            We ride <span className="text-brz-red">together</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-brz-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            A riding family, not just a club. Join tours across the country,
            earn your medals, and trade gear with people who actually ride.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/events"
              className="rounded-md bg-brz-red px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-brz-black transition hover:bg-brz-amber"
            >
              Explore our rides
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-brz-line px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-brz-white transition hover:border-brz-red hover:text-brz-red"
            >
              Join the club
            </Link>
          </div>
        </div>
        <div className="h-1.5 checker-flag-red" />
      </section>

      {/* Welcome / stats */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brz-line">
            <Image
              src="/images/about.jpg"
              alt="Team Brz riders stopped on a hill tour"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red">
              Who we are
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight tracking-wide text-brz-white md:text-4xl">
              Built by riders, run by riders
            </h2>
            <p className="mt-4 text-brz-mute">
              Team Brz started with a handful of people who&rsquo;d rather be on
              the road than anywhere else. Today it&rsquo;s a full riding family —
              real members, admin-reviewed profiles, organized tours, and a
              marketplace you can actually trust. No fake accounts, no
              gatekeeping, just riders looking out for riders.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-brz-red hover:text-brz-amber"
            >
              Become one of us →
            </Link>
            <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-6">
              <BigStat value={stats.members} label="Verified riders" />
              <BigStat value={stats.events} label="Events run" />
              <BigStat value={stats.listings} label="Marketplace listings" />
            </div>
          </div>
        </div>
      </section>

      {/* Missions */}
      <section className="border-y border-brz-line bg-brz-charcoal/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            What we do
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-brz-mute">
            Everything Team Brz offers, built around one idea: get more
            people on the road, safely, together.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Mission
              icon={<IconRoute />}
              title="Group rides"
              desc="Tours, city meetups, and workshops — register in a click and see who else is riding."
            />
            <Mission
              icon={<IconShield />}
              title="Verified community"
              desc="Every profile is reviewed and approved by admins, so you always know who you're riding with."
            />
            <Mission
              icon={<IconTag />}
              title="Trusted marketplace"
              desc="Buy and sell bikes and gear directly with fellow verified riders — no strangers, no scams."
            />
          </div>
        </div>
      </section>

      {/* Ride gallery */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
              From the road
            </h2>
            <p className="mt-2 text-brz-mute">
              Moments from past tours and meetups — more added after every
              ride.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold uppercase tracking-wide text-brz-red hover:text-brz-amber"
          >
            See all rides →
          </Link>
        </div>
        <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-xl border border-brz-line">
          <Image
            src="/images/gallery-1.jpg"
            alt="Team Brz riders on a highway meetup"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Meet the crew */}
      {crew.length > 0 && (
        <section className="border-y border-brz-line bg-brz-charcoal/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
              Meet the crew
            </h2>
            <p className="mt-2 text-brz-mute">
              A few of the riders keeping Team Brz on the road.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {crew.map((m) => (
                <div key={m.id} className="card p-5 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brz-steel text-2xl font-bold text-brz-red">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      m.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <p className="mt-4 font-display font-semibold uppercase tracking-wide text-brz-white">
                    {m.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-brz-red">
                    {m.role === "ADMIN" ? "Admin" : "Member"}
                  </p>
                  <p className="mt-2 text-xs text-brz-mute">
                    {[m.bikeModel, m.city].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/members"
                className="font-display text-sm font-bold uppercase tracking-wider text-brz-red hover:text-brz-amber"
              >
                View all members →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
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

      {/* Testimonials */}
      {/*
        Sample/placeholder quotes — swap these for real member quotes
        (with their permission) whenever you have some. First names only,
        not tied to any real member record.
      */}
      <section className="border-y border-brz-line bg-brz-charcoal/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            What our members say
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="Found this club through a friend and never looked back. The tours are organized properly, and everyone actually rides."
              name="Tanvir"
              detail="Member since 2023"
            />
            <Testimonial
              quote="Sold my old helmet and bought a jacket through the marketplace — both from verified members. Way better than random Facebook groups."
              name="Nusrat"
              detail="Member since 2024"
            />
            <Testimonial
              quote="Earned my first medal on the hill-tour last year. This club actually recognizes the riders who show up."
              name="Fahim"
              detail="Member since 2022"
            />
          </div>
        </div>
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

function BigStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-5xl font-bold text-brz-white md:text-6xl">
        {value}
      </div>
      <div className="mt-2 h-1 w-10 bg-brz-red" />
      <div className="mt-2 text-xs uppercase tracking-wide text-brz-mute">
        {label}
      </div>
    </div>
  );
}

function Mission({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="card p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brz-red/40 bg-brz-red/10 text-brz-red">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-brz-mute">{desc}</p>
    </div>
  );
}

function Testimonial({
  quote,
  name,
  detail,
}: {
  quote: string;
  name: string;
  detail: string;
}) {
  return (
    <div className="card p-6">
      <p className="text-brz-mute">&ldquo;{quote}&rdquo;</p>
      <p className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-brz-white">
        {name}
      </p>
      <p className="text-xs text-brz-mute">{detail}</p>
    </div>
  );
}

function IconRoute() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h5a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4" strokeDasharray="2 3" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12l-8 8-9-9V4h7l10 10z" />
      <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
