import Link from "next/link";
import { getApprovedMembers } from "@/lib/queries";
import MedalBadge from "@/components/medal-badge";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getApprovedMembers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-brz-white">
        Members
      </h1>
      <p className="mt-1 text-brz-mute">
        {members.length} approved rider{members.length === 1 ? "" : "s"} in
        Team Brz.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/members/${m.id}`}
            className="card flex items-start gap-3 p-4 transition hover:border-brz-red"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brz-red bg-brz-steel font-display text-lg font-bold text-brz-red">
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate font-display font-semibold uppercase tracking-wide text-brz-white">
                {m.name}
                {m.verified && <span title="Verified">🛡️</span>}
                {m.role === "ADMIN" && <span title="Admin">⚙️</span>}
              </p>
              <p className="truncate text-sm text-brz-mute">
                {m.bikeModel || "No bike listed"}
                {m.city ? ` · ${m.city}` : ""}
              </p>
              {m.medals.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.medals.slice(0, 3).map((mm) => (
                    <MedalBadge
                      key={mm.medalId}
                      icon={mm.medal.icon}
                      name={mm.medal.name}
                      color={mm.medal.color}
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
