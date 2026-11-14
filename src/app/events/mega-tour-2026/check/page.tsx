"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import MegaTourPass from "@/components/mega-tour-pass";
import { passId } from "@/lib/mega-tour";

type Result =
  | { found: false }
  | {
      found: true;
      submittedAt: string;
      name: string;
      role: string;
      method: string;
      txId: string;
      bloodGroup: string;
      regNumber: string;
      serial: number | null;
      phone: string;
      confirmed: boolean;
    };

const CHECK_PATH = "/events/mega-tour-2026/check";

// useSearchParams needs a Suspense boundary on a statically rendered page.
export default function CheckPaymentPage() {
  return (
    <Suspense>
      <CheckPayment />
    </Suspense>
  );
}

function CheckPayment() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");
  const autoChecked = useRef(false);

  const check = useCallback(async (number: string) => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(
        `/api/mega-tour-payment?phone=${encodeURIComponent(number)}`
      );
      if (!res.ok) throw new Error();
      setResult(await res.json());
      // Keep the number in the URL so a refresh shows the same pass.
      window.history.replaceState(
        null,
        "",
        `${CHECK_PATH}?phone=${encodeURIComponent(number)}`
      );
    } catch {
      setError("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    }
    setLoading(false);
  }, []);

  // Opened from a pass's QR code (…/check?phone=017…): fill in and check.
  useEffect(() => {
    setOrigin(window.location.origin);
    if (autoChecked.current) return;
    const fromUrl = (searchParams.get("phone") ?? "").replace(/\D/g, "");
    if (fromUrl.length >= 11) {
      autoChecked.current = true;
      setPhone(fromUrl);
      check(fromUrl);
    }
  }, [searchParams, check]);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    check(phone);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6">
      <Link href="/events/mega-tour-2026" className="text-sm text-brz-mute hover:text-brz-red">
        ← মেগা ট্যুর ২০২৬
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Payment Check
      </h1>
      <p className="mt-2 text-sm text-brz-mute">
        যে নম্বর দিয়ে registration বা payment করেছেন, সেই নম্বর দিয়ে আপনার pass ও payment status দেখুন।
      </p>

      <form onSubmit={handleCheck} className="card mt-8 p-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">মোবাইল নম্বর</label>
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
        <div className="mt-8">
          <MegaTourPass
            data={result}
            checkUrl={`${origin}${CHECK_PATH}?phone=${result.phone}`}
          />

          <p
            className={
              "mx-auto mt-5 max-w-[360px] text-center text-sm " +
              (result.confirmed ? "text-green-400" : "text-yellow-300")
            }
          >
            {result.confirmed
              ? "✅ Payment confirmed — এই pass-এর screenshot রেখে দিন।"
              : "⏳ Submission পাওয়া গেছে। Admin যাচাই করে confirm করলে status “Paid” হয়ে যাবে।"}
          </p>

          <dl className="card mx-auto mt-4 max-w-[360px] divide-y divide-brz-line px-5 py-1 text-sm">
            <Row label="Pass ID" value={passId(result.serial)} />
            <Row label="Payment Method" value={result.method} />
            <Row label="Transaction ID" value={result.txId} />
            <Row label="Submitted" value={result.submittedAt} />
          </dl>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-brz-mute">{label}</dt>
      <dd className="text-right font-semibold text-brz-white">{value}</dd>
    </div>
  );
}
