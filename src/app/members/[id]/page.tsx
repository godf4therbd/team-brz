import { getMemberById } from "@/lib/queries";
import { notFound } from "next/navigation";
import MedalBadge from "@/components/medal-badge";
import ListingCard from "@/components/listing-card";
import GearList from "@/components/gear-list";
import MemberCard from "@/components/member-card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15+: params is a Promise — reading `.id` without awaiting gave
  // undefined, so every profile 404'd.
  const { id } = await params;
  const [member, session] = await Promise.all([
    getMemberById(id),
    getServerSession(authOptions),
  ]);
  if (!member || !member.approved) notFound();

  const activeListings = member.listings.filter((l) => l.status === "ACTIVE");

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

      {member.bio && (
        <p className="mt-6 text-center text-brz-white/90">{member.bio}</p>
      )}

      {member.bikePhotoUrl && (
        <div className="card mt-6 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={member.bikePhotoUrl}
            alt={`${member.name}'s bike`}
            className="max-h-96 w-full object-cover"
          />
        </div>
      )}

      {member.gear.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
            Gear
          </h2>
          <div className="mt-3">
            {/* Owner manages gear from /account; admins can remove
                anything inappropriate right here. */}
            <GearList
              items={member.gear}
              canDelete={isAdminRole(session?.user.role)}
            />
          </div>
        </div>
      )}

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
          <p className="mt-2 text-sm text-brz-mute">No medals yet.</p>
        )}
      </div>

      {activeListings.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
            Listings from {member.name.split(" ")[0]}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {activeListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
