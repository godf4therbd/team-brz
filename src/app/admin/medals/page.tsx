import { getAllMedalsAdmin } from "@/lib/admin-queries";
import MedalBadge from "@/components/medal-badge";
import NewMedalForm from "@/components/admin/new-medal-form";

export const dynamic = "force-dynamic";

export default async function AdminMedalsPage() {
  const medals = await getAllMedalsAdmin();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        Medal types
      </h2>
      <p className="mt-1 text-sm text-brz-mute">
        Define the medals riders can earn (Host, Leader, Founding Member,
        etc). Award them to individual members from the Members tab.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {medals.map((m) => (
          <MedalBadge key={m.id} icon={m.icon} name={m.name} color={m.color} />
        ))}
      </div>

      <NewMedalForm />
    </div>
  );
}
