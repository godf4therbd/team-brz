"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type MegaTourPaymentRow = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  role: "RIDER" | "PILLION";
  bikeModel: string | null;
  regNumber: string | null;
  bloodGroup: string | null;
  emergencyContact: string;
  reference: string | null;
  method: string;
  senderNumber: string | null;
  txId: string;
  confirmed: boolean;
  confirmedBy: string | null;
};

type Filter = "all" | "pending" | "confirmed";

function formatDhaka(createdAt: string) {
  // SQLite's current_timestamp is UTC without a zone marker.
  return new Date(createdAt + "Z").toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MegaTourPaymentsTable({
  payments,
  canDelete,
}: {
  payments: MegaTourPaymentRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return payments.filter((p) => {
      if (filter === "pending" && p.confirmed) return false;
      if (filter === "confirmed" && !p.confirmed) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.txId.toLowerCase().includes(q) ||
        (p.reference ?? "").toLowerCase().includes(q) ||
        (qDigits.length >= 3 &&
          [p.phone, p.senderNumber ?? ""].some((n) =>
            n.replace(/\D/g, "").includes(qDigits)
          ))
      );
    });
  }, [payments, query, filter]);

  async function send(id: string, init: RequestInit, failMsg: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/mega-tour/${id}`, init);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || `${failMsg} (${res.status})`);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — change may not have been saved.");
    } finally {
      setBusyId(null);
    }
  }

  function setConfirmed(p: MegaTourPaymentRow, confirmed: boolean) {
    if (
      !confirmed &&
      !window.confirm(`Mark ${p.name}'s payment as NOT confirmed?`)
    )
      return;
    send(
      p.id,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      },
      "Update failed"
    );
  }

  function remove(p: MegaTourPaymentRow) {
    if (
      !window.confirm(
        `Delete ${p.name}'s submission (TxID ${p.txId})? This can't be undone.`
      )
    )
      return;
    send(p.id, { method: "DELETE" }, "Delete failed");
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone, TxID, reference…"
          className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-sm text-brz-white outline-none placeholder:text-brz-mute/60 focus:border-brz-red sm:max-w-sm"
        />
        <div className="flex gap-1">
          {(["all", "pending", "confirmed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition " +
                (filter === f
                  ? "bg-brz-red text-brz-ink"
                  : "text-brz-mute hover:bg-brz-charcoal hover:text-brz-white")
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-6 text-sm text-brz-mute">
          {payments.length === 0
            ? "No submissions yet."
            : "No submissions match this search."}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {shown.map((p) => {
            const busy = busyId === p.id;
            const open = openId === p.id;
            return (
              <div key={p.id} className="card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : p.id)}
                    className="min-w-0 text-left"
                    aria-expanded={open}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold uppercase tracking-wide text-brz-white">
                        {p.name}
                      </span>
                      <span
                        className={
                          "badge border " +
                          (p.confirmed
                            ? "border-green-700 bg-green-950/40 text-green-400"
                            : "border-yellow-700 bg-yellow-950/40 text-yellow-300")
                        }
                      >
                        {p.confirmed ? "✓ Confirmed" : "Pending"}
                      </span>
                      <span className="badge border border-brz-line text-brz-mute">
                        {p.role === "PILLION" ? "Pillion" : "Rider"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brz-mute">
                      {p.phone} · {p.method} · TxID{" "}
                      <span className="font-mono text-brz-white">{p.txId}</span>
                    </p>
                    <p className="text-xs text-brz-mute">
                      {formatDhaka(p.createdAt)}
                      {p.reference ? ` · Ref: ${p.reference}` : ""}
                      {p.confirmed && p.confirmedBy
                        ? ` · confirmed by ${p.confirmedBy}`
                        : ""}
                      {" · "}
                      <span className="text-brz-red">
                        {open ? "Hide details ▲" : "Details ▼"}
                      </span>
                    </p>
                  </button>

                  <div className="flex shrink-0 items-center gap-3">
                    {p.confirmed ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmed(p, false)}
                        className="text-sm font-semibold text-brz-mute hover:text-brz-white disabled:opacity-50"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmed(p, true)}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        {busy ? "Saving…" : "Confirm"}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => remove(p)}
                        className="text-sm font-semibold text-red-400 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {open && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-brz-line pt-3 text-sm sm:grid-cols-2">
                    <Detail label="Sender number" value={p.senderNumber} />
                    <Detail label="Blood group" value={p.bloodGroup} />
                    <Detail label="Emergency contact" value={p.emergencyContact} />
                    {p.role === "RIDER" && (
                      <>
                        <Detail label="Bike" value={p.bikeModel} />
                        <Detail label="Reg number" value={p.regNumber} />
                      </>
                    )}
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 sm:block">
      <dt className="text-brz-mute">{label}</dt>
      <dd className="text-right font-semibold text-brz-white sm:text-left">
        {value || "—"}
      </dd>
    </div>
  );
}
