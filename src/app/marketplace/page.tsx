import Link from "next/link";
import { getActiveListings } from "@/lib/queries";
import ListingCard from "@/components/listing-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type =
    searchParams.type === "BIKE" || searchParams.type === "ACCESSORY"
      ? searchParams.type
      : undefined;

  const listings = await getActiveListings({ type });

  const tabs = [
    { key: undefined, label: "All" },
    { key: "BIKE", label: "🏍️ Bikes" },
    { key: "ACCESSORY", label: "🛠️ Accessories" },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-brz-white">
            Marketplace
          </h1>
          <p className="mt-1 text-brz-mute">
            Buy and sell bikes and gear with fellow Team Brz members.
          </p>
        </div>
        <Link
          href="/marketplace/new"
          className="rounded-md bg-brz-red px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-black hover:bg-brz-amber"
        >
          + Sell an item
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/marketplace?type=${t.key}` : "/marketplace"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold",
              type === t.key || (!type && !t.key)
                ? "border-brz-red bg-brz-red/10 text-brz-red"
                : "border-brz-line text-brz-mute hover:text-brz-white"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {listings.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-brz-mute">
          No listings here yet — be the first to sell something.
        </p>
      )}
    </div>
  );
}
