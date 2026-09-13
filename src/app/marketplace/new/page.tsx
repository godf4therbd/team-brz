"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/spinner";

const bikeCategories = [
  "Sport Bike",
  "Cruiser",
  "Naked",
  "Commuter",
  "Off-road",
  "Scooter",
];
const accessoryCategories = [
  "Helmet",
  "Jacket",
  "Gloves",
  "Engine Oil",
  "Tyres",
  "Riding Boots",
  "Parts",
  "Other",
];

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [type, setType] = useState<"BIKE" | "ACCESSORY">("BIKE");
  const [form, setForm] = useState({
    category: "Sport Bike",
    title: "",
    description: "",
    price: "",
    condition: "GOOD",
    location: "",
    imageUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:px-6">
        <p className="text-brz-mute">Sign in to list an item for sale.</p>
        <Link
          href="/login?callbackUrl=/marketplace/new"
          className="mt-4 inline-block rounded-md bg-brz-red px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-black hover:bg-brz-amber"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!session.user.approved) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:px-6">
        <p className="text-brz-mute">
          Your membership is pending admin approval — you&apos;ll be able to
          list items once you&apos;re approved.
        </p>
      </div>
    );
  }

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = parseInt(form.price, 10);
    if (!price || price <= 0) {
      setError("Enter a valid price.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        category: form.category,
        title: form.title,
        description: form.description,
        price,
        condition: form.condition,
        location: form.location,
        images: form.imageUrl ? [form.imageUrl] : [],
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push(`/marketplace/${data.id}`);
  }

  const categories = type === "BIKE" ? bikeCategories : accessoryCategories;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Sell an item
      </h1>
      <p className="mt-2 text-sm text-brz-mute">
        List a bike or accessory for other Team Brz members to see.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <p className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          {(["BIKE", "ACCESSORY"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setType(t);
                update(
                  "category",
                  t === "BIKE" ? bikeCategories[0] : accessoryCategories[0]
                );
              }}
              className={
                type === t
                  ? "flex-1 rounded-md bg-brz-red py-2 font-display text-sm font-bold uppercase tracking-wide text-brz-black"
                  : "flex-1 rounded-md border border-brz-line py-2 font-display text-sm font-bold uppercase tracking-wide text-brz-mute"
              }
            >
              {t === "BIKE" ? "🏍️ Bike" : "🛠️ Accessory"}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="field"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Title
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={
              type === "BIKE" ? "2022 Yamaha MT15 V2" : "Motul 5100 Engine Oil"
            }
            className="field"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Description
          </label>
          <textarea
            required
            minLength={10}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="field"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
              Price (৳)
            </label>
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
              Condition
            </label>
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value)}
              className="field"
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like new</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Location
          </label>
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Dhaka"
            className="field"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
            Photo URL (optional)
          </label>
          <input
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://..."
            className="field"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brz-red py-2.5 font-display font-bold uppercase tracking-wide text-brz-black transition hover:bg-brz-amber disabled:opacity-60"
        >
          {loading && <Spinner size="1.1em" />}
          {loading ? "Publishing..." : "Publish listing"}
        </button>
      </form>
    </div>
  );
}
