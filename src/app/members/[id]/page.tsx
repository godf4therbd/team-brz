import { getMemberById } from "@/lib/queries";
import { notFound } from "next/navigation";
import MedalBadge from "@/components/medal-badge";
import ListingCard from "@/components/listing-card";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const member = await getMemberById(params.id);
  if (!member || !member.approved) notFound();

  const activeListings = member.listings.filter((l) => l.status === "ACTIVE");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brz-red bg-brz-steel font-display text-3xl font-bold text-brz-red">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-wide text-brz-white">
            {member.name}
            {member.verified && <span title="Verified">🛡️</span>}
            {member.role === "ADMIN" && <span title="Admin">⚙️</span>}
          </h1>
          <p className="text-sm text-brz-mute">
            {member.bikeModel || "No bike listed"}
            {member.city ? ` · ${member.city}` : ""}
          </p>
        </div>
      </div>

      {member.bio && (
        <p className="mt-6 text-brz-white/90">{member.bio}</p>
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
