"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GEAR_LABEL, type GearCategory } from "@/lib/gear";

export type GearItem = {
  id: string;
  category: GearCategory;
  brand: string;
  model: string | null;
  note: string | null;
  photoUrl: string | null;
};

// Grid of gear cards. Shown on the public profile and on the member's own
// account page; `canDelete` adds a remove button (owner, or an admin).
export default function GearList({
  items,
  canDelete = false,
}: {
  items: GearItem[];
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(item: GearItem) {
    const name = [item.brand, item.model].filter(Boolean).join(" ");
    if (!window.confirm(`Remove ${name} from the gear list?`)) return;
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/account/gear/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || `Couldn't remove it (${res.status}).`);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — item may not have been removed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-400">
          {error}
        </p>
      )}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((g) => {
          const meta = GEAR_LABEL[g.category] ?? GEAR_LABEL.OTHER;
          return (
            <li
              key={g.id}
              className="overflow-hidden rounded-lg border border-brz-line bg-brz-black"
            >
              <div className="relative aspect-square bg-brz-steel">
                {g.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.photoUrl}
                    alt={`${g.brand} ${g.model ?? ""}`.trim()}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-5xl"
                    aria-hidden="true"
                  >
                    {meta.icon}
                  </div>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => remove(g)}
                    disabled={busyId === g.id}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white transition hover:bg-brz-red disabled:opacity-50"
                    aria-label={`Remove ${g.brand}`}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brz-red">
                  <span aria-hidden="true">{meta.icon} </span>
                  {meta.label}
                </p>
                <p className="mt-1 break-words font-display font-semibold uppercase leading-tight tracking-wide text-brz-white">
                  {g.brand}
                </p>
                {g.model && (
                  <p className="break-words text-sm text-brz-white/80">{g.model}</p>
                )}
                {g.note && (
                  <p className="mt-1 break-words text-xs text-brz-mute">{g.note}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
