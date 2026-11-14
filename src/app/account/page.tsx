import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberById } from "@/lib/queries";
import MedalBadge from "@/components/medal-badge";
import PhotoUpload from "@/components/photo-upload";
import GearManager from "@/components/gear-manager";
import MemberCard from "@/components/member-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account");

  const member = await getMemberById(session.user.id);
  if (!member) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <MemberCard
        name={member.name}
        avatarUrl={member.avatarUrl}
        verified={member.verified}
        role={member.role}
        bikeModel={member.bikeModel}
        city={member.city}
      />
      <p className="mt-3 text-center text-sm text-brz-mute">{member.email}</p>
      {member.approved && (
        <p className="mt-1 text-center text-sm">
          <Link
            href={`/members/${member.id}`}
            className="font-semibold text-brz-red hover:text-brz-amber"
          >
            View my public profile →
          </Link>
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {member.approved ? (
          <span className="badge border border-green-700 bg-green-950/40 text-green-400">
            ✅ Approved member
          </span>
        ) : (
          <span className="badge border border-yellow-700 bg-yellow-950/40 text-yellow-400">
            ⏳ Pending admin approval
          </span>
        )}
        {/* Verified / role badges are on the member card above. */}
      </div>

      {!member.approved && (
        <p className="mt-4 rounded-md border border-yellow-800 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-200">
          Your account is waiting on admin approval. You can still browse
          the marketplace, but listing items unlocks once you&apos;re
          approved.
        </p>
      )}

      <div className="card mt-8 space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
          Photos
        </h2>
        <PhotoUpload
          kind="avatar"
          currentUrl={member.avatarUrl}
          label="Profile picture"
        />
        <PhotoUpload
          kind="bike"
          currentUrl={member.bikePhotoUrl}
          label="Bike picture"
          shape="rect"
        />
      </div>

      <div className="card mt-6 p-5">
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
          My gear
        </h2>
        <div className="mt-3">
          <GearManager items={member.gear} />
        </div>
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
            No medals yet.
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
