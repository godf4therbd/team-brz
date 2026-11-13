"use client";

import Link from "next/link";
import { useState } from "react";

type Result =
  | { found: false }
  | { found: true; submittedAt: string; name: string; role: string; method: string; txId: string; bloodGroup: string; confirmed: boolean };

export default function CheckPaymentPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(`/api/mega-tour-payment?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    }
    setLoading(false);
  }

  const methodLabel: Record<string, string> = {
    bKash: "bKash", Nagad: "Nagad", Rocket: "Rocket", "BRAC Bank": "BRAC Bank",
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6">
      <Link href="/events/mega-tour-2026" className="text-sm text-brz-mute hover:text-brz-red">
        ← মেগা ট্যুর ২০২৬
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Payment Check
      </h1>
      <p className="mt-2 text-sm text-brz-mute">
        যে নম্বর থেকে payment করেছেন, সেই নম্বর দিয়ে payment status দেখুন।
      </p>

      <form onSubmit={handleCheck} className="card mt-8 p-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">যে নম্বর থেকে পেমেন্ট করেছেন</label>
          <input
            type="tel"
            required
            minLength={11}
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brz-red py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-60"
        >
          {loading ? "খোঁজা হচ্ছে..." : "Check করুন"}
        </button>
      </form>

      {error && (
        <div className="card mt-4 p-4 text-sm text-red-400">{error}</div>
      )}

      {result && !result.found && (
        <div className="card mt-4 p-6 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-3 font-semibold text-brz-white">কোনো registration পাওয়া যায়নি</p>
          <p className="mt-1 text-sm text-brz-mute">
            এই নম্বরে কোনো submission নেই। নম্বরটি ঠিক আছে কিনা দেখুন।
          </p>
          <Link
            href="/events/mega-tour-2026/payment"
            className="mt-4 inline-block rounded-md bg-brz-red px-5 py-2 text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber"
          >
            Register করুন
          </Link>
        </div>
      )}

      {result && result.found && (
        <div className="card mt-4 overflow-hidden">
          {result.confirmed ? (
            <div className="flex items-center gap-3 bg-green-950/40 px-5 py-3 border-b border-brz-line">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold text-green-400 text-sm">Payment Confirmed!</p>
                <p className="text-xs text-brz-mute">আপনার registration সম্পন্ন হয়েছে।</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-yellow-950/40 px-5 py-3 border-b border-brz-line">
              <span className="text-xl">⏳</span>
              <div>
                <p className="font-semibold text-yellow-300 text-sm">Submission পাওয়া গেছে</p>
                <p className="text-xs text-brz-mute">Admin যাচাই করার পর confirm করা হবে।</p>
              </div>
            </div>
          )}
          <div className="divide-y divide-brz-line p-5 space-y-0">
            <Row label="নাম" value={result.name} />
            <Row label="ধরন" value={result.role} />
            {result.bloodGroup && <Row label="রক্তের গ্রুপ" value={result.bloodGroup} />}
            <Row label="Payment Method" value={methodLabel[result.method] ?? result.method} />
            <Row label="Transaction ID" value={result.txId} />
            <Row label="Submitted" value={result.submittedAt} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <span className="text-brz-mute">{label}</span>
      <span className="font-semibold text-brz-white text-right">{value}</span>
    </div>
  );
}
