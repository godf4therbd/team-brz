import { getAllListingsAdmin } from "@/lib/admin-queries";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import ListingModerationActions from "@/components/admin/listing-moderation-actions";

export const dynamic = "force-dynamic";

export default async function AdminMarketplacePage() {
  const listings = await getAllListingsAdmin();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        Marketplace ({listings.length})
      </h2>
      <div className="mt-5 space-y-3">
        {listings.map((l) => (
          <div
            key={l.id}
            className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/marketplace/${l.id}`}
                  className="font-display font-semibold uppercase tracking-wide text-brz-white hover:text-brz-red"
                >
                  {l.title}
                </Link>
                <span className="badge border border-brz-line text-brz-mute">
                  {l.status}
                </span>
              </div>
              <p className="text-xs text-brz-mute">
                {formatPrice(l.price)} · {l.category} · by {l.seller.name} ·{" "}
                {formatDate(l.createdAt)}
              </p>
            </div>
            {l.status === "ACTIVE" && (
              <ListingModerationActions listingId={l.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
