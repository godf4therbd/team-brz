import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllMembersAdmin } from "@/lib/admin-queries";
import { getAllMedals } from "@/lib/queries";
import MembersTable from "@/components/admin/members-table";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const [members, medals, session] = await Promise.all([
    getAllMembersAdmin(),
    getAllMedals(),
    getServerSession(authOptions),
  ]);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        Members ({members.length})
      </h2>
      <p className="mt-1 text-sm text-brz-mute">
        Approve new sign-ups, verify riders, promote admins, and award
        medals.
      </p>
      <MembersTable
        members={members}
        medals={medals}
        viewerRole={session!.user.role}
      />
    </div>
  );
}
