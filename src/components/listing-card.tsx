import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function ListingCard({
  listing,
}: {
  listing: {
    id: string;
    title: string;
    type: string;
    category: string;
    price: number;
    condition: string;
    location?: string | null;
    images: string;
  };
}) {
  let firstImage: string | null = null;
  try {
    const arr = JSON.parse(listing.images);
    firstImage = Array.isArray(arr) && arr.length ? arr[0] : null;
  } catch {}

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="card group block overflow-hidden transition hover:border-brz-red"
    >
      <div className="flex h-40 items-center justify-center border-b border-brz-line bg-brz-steel text-4xl">
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImage}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : listing.type === "BIKE" ? (
          "🏍️"
        ) : (
          "🛠️"
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="badge border border-brz-line text-brz-mute">
            {listing.category}
          </span>
          <span className="badge border border-brz-line text-brz-mute">
            {listing.condition.replace("_", " ")}
          </span>
        </div>
        <h3 className="mt-2 truncate font-display text-lg font-semibold uppercase tracking-wide text-brz-white group-hover:text-brz-red">
          {listing.title}
        </h3>
        <p className="mt-1 text-lg font-bold text-brz-amber">
          {formatPrice(listing.price)}
        </p>
        {listing.location && (
          <p className="text-xs text-brz-mute">📍 {listing.location}</p>
        )}
      </div>
    </Link>
  );
}
