import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/require-admin";
import { getMegaTourPaymentsAdmin } from "@/lib/admin-queries";
import MegaTourPaymentsTable from "@/components/admin/mega-tour-payments-table";

export const dynamic = "force-dynamic";

export default async function AdminMegaTourPage() {
  const [payments, session] = await Promise.all([
    getMegaTourPaymentsAdmin(),
    getServerSession(authOptions),
  ]);

  const confirmed = payments.filter((p) => p.confirmed).length;
  const riders = payments.filter((p) => p.role === "RIDER").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
          Mega Tour 2026 payments ({payments.length})
        </h2>
        <a
          href="/api/admin/mega-tour/export"
          className="rounded-md border border-brz-line px-4 py-2 text-sm font-semibold text-brz-white transition hover:border-brz-red hover:text-brz-red"
        >
          ⬇ Download CSV
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={payments.length} />
        <Stat label="Confirmed" value={confirmed} />
        <Stat label="Pending" value={payments.length - confirmed} />
        <Stat label="Riders / Pillions" value={`${riders} / ${payments.length - riders}`} />
      </div>

      <MegaTourPaymentsTable
        payments={payments.map((p) => ({
          id: p.id,
          createdAt: p.createdAt,
          name: p.name,
          phone: p.phone,
          role: p.role,
          bikeModel: p.bikeModel,
          regNumber: p.regNumber,
          bloodGroup: p.bloodGroup,
          emergencyContact: p.emergencyContact,
          reference: p.reference,
          method: p.method,
          senderNumber: p.senderNumber,
          txId: p.txId,
          confirmed: p.confirmed,
          confirmedBy: p.confirmedBy?.name ?? null,
        }))}
        canDelete={isAdminRole(session?.user.role)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-brz-mute">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-brz-white">{value}</p>
    </div>
  );
}
