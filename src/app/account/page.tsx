import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberById } from "@/lib/queries";
import MedalBadge from "@/components/medal-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account");

  const member = await getMemberById(session.user.id);
  if (!member) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brz-red bg-brz-steel font-display text-2xl font-bold text-brz-red">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-brz-white">
            {member.name}
          </h1>
          <p className="text-sm text-brz-mute">{member.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {member.approved ? (
          <span className="badge border border-green-700 bg-green-950/40 text-green-400">
            ✅ Approved member
          </span>
        ) : (
          <span className="badge border border-yellow-700 bg-yellow-950/40 text-yellow-400">
            ⏳ Pending admin approval
          </span>
        )}
        {member.verified && (
          <span className="badge border border-sky-700 bg-sky-950/40 text-sky-400">
            🛡️ Verified
          </span>
        )}
        {member.role === "ADMIN" && (
          <span className="badge border border-brz-red bg-brz-red/10 text-brz-red">
            ⚙️ Admin
          </span>
        )}
      </div>

      {!member.approved && (
        <p className="mt-4 rounded-md border border-yellow-800 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-200">
          Your account is waiting on admin approval. You can still browse
          events and the marketplace, but registering for rides and listing
          items unlocks once you&apos;re approved.
        </p>
      )}

      <div className="card mt-8 p-5">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
          Rider info
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Info label="Bike" value={member.bikeModel || "—"} />
          <Info label="City" value={member.city || "—"} />
          <Info label="Phone" value={member.phone || "—"} />
          <Info
            label="Joined"
            value={new Date(member.joinedAt).toLocaleDateString()}
          />
        </dl>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
          Medals
        </h2>
        {member.medals.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {member.medals.map((m) => (
              <MedalBadge
                key={m.medalId}
                icon={m.medal.icon}
                name={m.medal.name}
                color={m.medal.color}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-brz-mute">
            No medals yet — join a ride and earn your first one.
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/marketplace/new"
          className="rounded-md border border-brz-line px-4 py-2 text-sm font-semibold text-brz-white hover:border-brz-red hover:text-brz-red"
        >
          + List an item for sale
        </Link>
        <Link
          href="/members"
          className="rounded-md border border-brz-line px-4 py-2 text-sm font-semibold text-brz-white hover:border-brz-red hover:text-brz-red"
        >
          View member directory
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-brz-mute">
        {label}
      </dt>
      <dd className="text-brz-white">{value}</dd>
    </div>
  );
}
