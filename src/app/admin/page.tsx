import Link from "next/link";
import {
  getAllMembersAdmin,
  getAllEventsAdmin,
  getAllListingsAdmin,
} from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [members, allEvents, allListings] = await Promise.all([
    getAllMembersAdmin(),
    getAllEventsAdmin(),
    getAllListingsAdmin(),
  ]);

  const pendingApproval = members.filter((m) => !m.approved);
  const upcomingEvents = allEvents.filter(
    (e) => new Date(e.startDate) > new Date() && e.status === "PUBLISHED"
  );
  const activeListings = allListings.filter((l) => l.status === "ACTIVE");

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Members"
          value={members.length}
          sub={`${pendingApproval.length} pending approval`}
          href="/admin/members"
        />
        <StatCard
          label="Events"
          value={allEvents.length}
          sub={`${upcomingEvents.length} upcoming`}
          href="/admin/events"
        />
        <StatCard
          label="Marketplace"
          value={activeListings.length}
          sub={`${allListings.length} total listings`}
          href="/admin/marketplace"
        />
      </div>

      {pendingApproval.length > 0 && (
        <div className="card mt-8 p-5">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
            Waiting on your approval
          </h2>
          <ul className="mt-3 divide-y divide-brz-line">
            {pendingApproval.slice(0, 8).map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium text-brz-white">{m.name}</p>
                  <p className="text-xs text-brz-mute">{m.email}</p>
                </div>
                <Link
                  href="/admin/members"
                  className="text-sm font-semibold text-brz-red hover:underline"
                >
                  Review →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="card block p-5 transition hover:border-brz-red">
      <p className="text-xs uppercase tracking-wide text-brz-mute">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-brz-red">
        {value}
      </p>
      <p className="mt-1 text-xs text-brz-mute">{sub}</p>
    </Link>
  );
}
