import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getListingById } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import ListingActions from "@/components/listing-actions";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const [listing, session] = await Promise.all([
    getListingById(params.id),
    getServerSession(authOptions),
  ]);
  if (!listing) notFound();

  let images: string[] = [];
  try {
    images = JSON.parse(listing.images);
  } catch {}

  const isOwner = session?.user.id === listing.sellerId;
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <Link
        href="/marketplace"
        className="text-sm text-brz-mute hover:text-brz-red"
      >
        ← Marketplace
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-brz-line bg-brz-steel text-7xl">
          {images.length ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : listing.type === "BIKE" ? (
            "🏍️"
          ) : (
            "🛠️"
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge border border-brz-line text-brz-mute">
              {listing.category}
            </span>
            <span className="badge border border-brz-line text-brz-mute">
              {listing.condition.replace("_", " ")}
            </span>
            {listing.status !== "ACTIVE" && (
              <span className="badge border border-red-800 bg-red-950/40 text-red-300">
                {listing.status}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            {listing.title}
          </h1>
          <p className="mt-1 font-display text-3xl font-bold text-brz-amber">
            {formatPrice(listing.price)}
          </p>
          {listing.location && (
            <p className="mt-1 text-brz-mute">📍 {listing.location}</p>
          )}
          <p className="mt-1 text-xs text-brz-mute">
            Listed {formatDate(listing.createdAt)}
          </p>

          <div className="mt-6 whitespace-pre-line text-brz-white/90">
            {listing.description}
          </div>

          <div className="card mt-6 p-4">
            <p className="text-xs uppercase tracking-wide text-brz-mute">
              Seller
            </p>
            <Link
              href={`/members/${listing.seller.id}`}
              className="mt-1 block font-semibold text-brz-white hover:text-brz-red"
            >
              {listing.seller.name}{" "}
              {listing.seller.verified && "🛡️"}
            </Link>
            {listing.seller.phone && (
              <p className="mt-1 text-sm text-brz-mute">
                📞 {listing.seller.phone}
              </p>
            )}
          </div>

          {(isOwner || isAdmin) && listing.status === "ACTIVE" && (
            <ListingActions listingId={listing.id} />
          )}
        </div>
      </div>
    </div>
  );
}
