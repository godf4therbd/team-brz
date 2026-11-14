"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const REG_AREAS = [
  { group: "মেট্রো", items: ["ঢাকা মেট্রো", "চট্টগ্রাম মেট্রো", "খুলনা মেট্রো", "রাজশাহী মেট্রো", "সিলেট মেট্রো", "বরিশাল মেট্রো"] },
  { group: "ঢাকা বিভাগ", items: ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "নরসিংদী", "মুন্সিগঞ্জ", "মানিকগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "রাজবাড়ী", "শরীয়তপুর"] },
  { group: "চট্টগ্রাম বিভাগ", items: ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "নোয়াখালী", "ফেনী", "লক্ষ্মীপুর", "রাঙ্গামাটি", "খাগড়াছড়ি", "বান্দরবান"] },
  { group: "রাজশাহী বিভাগ", items: ["রাজশাহী", "বগুড়া", "পাবনা", "সিরাজগঞ্জ", "নাটোর", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট"] },
  { group: "খুলনা বিভাগ", items: ["খুলনা", "যশোর", "সাতক্ষীরা", "বাগেরহাট", "কুষ্টিয়া", "চুয়াডাঙ্গা", "মেহেরপুর", "ঝিনাইদহ", "মাগুরা", "নড়াইল"] },
  { group: "বরিশাল বিভাগ", items: ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"] },
  { group: "সিলেট বিভাগ", items: ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"] },
  { group: "রংপুর বিভাগ", items: ["রংপুর", "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও"] },
  { group: "ময়মনসিংহ বিভাগ", items: ["ময়মনসিংহ", "জামালপুর", "নেত্রকোণা", "শেরপুর"] },
] as const;

const REFERENCES = [
  "Saidur Rahman Saeed",
  "Niamul Islam Sifat",
  "Fayzur Rahman Antu",
  "Md Jubair Ahmed (Monmoy)",
  "Biswajit Roy",
] as const;

const METHODS = [
  { key: "bkash",  label: "bKash",     border: "border-pink-600/60",   activeBorder: "border-pink-500",   bg: "bg-pink-950/20",   activeBg: "bg-pink-950/40"   },
  { key: "nagad",  label: "Nagad",     border: "border-orange-600/60", activeBorder: "border-orange-500", bg: "bg-orange-950/20", activeBg: "bg-orange-950/40" },
  { key: "rocket", label: "Rocket",    border: "border-purple-600/60", activeBorder: "border-purple-500", bg: "bg-purple-950/20", activeBg: "bg-purple-950/40" },
  { key: "bank",   label: "BRAC Bank", border: "border-green-700/60",  activeBorder: "border-green-500",  bg: "bg-green-950/20",  activeBg: "bg-green-950/40"  },
] as const;

type Method = typeof METHODS[number]["key"];

export default function MegaTourPaymentPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"rider" | "pillion">("rider");
  const [agreed, setAgreed] = useState(false);
  const [details, setDetails] = useState({ name: "", phone: "", bloodGroup: "", bikeModel: "", regNumber: "", emergencyContact: "", reference: "" });
  const [regArea, setRegArea] = useState("ঢাকা মেট্রো");
  const [regSeries, setRegSeries] = useState<"ল" | "হ">("ল");
  const [method, setMethod] = useState<Method>("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [txId, setTxId] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/mega-tour-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, regNumber: `${regArea}-${regSeries} ${details.regNumber}`, role, method, senderNumber, txId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(
          data?.error || "দুঃখিত, আপনার তথ্য সেভ করা যায়নি। আবার চেষ্টা করুন।"
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("নেটওয়ার্ক সমস্যা — তথ্য পাঠানো যায়নি। ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <Link href="/events/mega-tour-2026" className="text-sm text-brz-mute hover:text-brz-red">
        ← মেগা ট্যুর ২০২৬
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
        Registration
      </h1>

      {/* Step indicator */}
      <div className="mt-4 flex items-center gap-3">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? "bg-brz-red text-brz-ink" : "bg-green-600 text-white"}`}>
          {step === 1 ? "১" : "✓"}
        </div>
        <span className={`text-sm font-semibold ${step === 1 ? "text-brz-white" : "text-brz-mute"}`}>আপনার তথ্য</span>
        <div className="h-px flex-1 bg-brz-line" />
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? "bg-brz-red text-brz-ink" : "border border-brz-line text-brz-mute"}`}>
          ২
        </div>
        <span className={`text-sm font-semibold ${step === 2 ? "text-brz-white" : "text-brz-mute"}`}>পেমেন্ট</span>
      </div>

      {/* Fee summary — only on step 2 */}
      {step === 2 && !submitted && <div className="card mt-6 overflow-hidden">
        <div className="divide-y divide-brz-line p-5">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-brz-mute">Registration fee</span>
            <span className="font-semibold text-brz-white">৳৩,০০০</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-brz-mute">Cash out charge</span>
            <span className="font-semibold text-brz-white">৳৬০</span>
          </div>
          <div className="flex justify-between py-2 text-sm font-bold">
            <span className="text-brz-white">মোট পাঠাবেন</span>
            <span className="text-base text-brz-red">৳৩,০৬০</span>
          </div>
        </div>
        <div className="bg-red-950/40 px-5 py-3">
          <p className="text-xs font-semibold text-red-400">
            ⚠️ এই পেমেন্ট Non-Refundable — একবার পাঠালে ফেরত দেওয়া হবে না।
          </p>
        </div>
      </div>}

      {/* ── Step 1: Details ── */}
      {step === 1 && (
        <form
          onSubmit={(e) => { e.preventDefault(); setStep(2); }}
          className="card mt-6 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-brz-white">
            আপনার তথ্য দিন
          </h2>

          {/* Rider / Pillion */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-brz-mute">আপনি কি?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("rider")}
                className={`rounded-lg border py-3 text-sm font-bold transition ${
                  role === "rider"
                    ? "border-brz-red bg-brz-red/10 text-brz-red"
                    : "border-brz-line text-brz-mute hover:border-brz-red/50"
                }`}
              >
                🏍️ Rider
              </button>
              <button
                type="button"
                onClick={() => setRole("pillion")}
                className={`rounded-lg border py-3 text-sm font-bold transition ${
                  role === "pillion"
                    ? "border-brz-red bg-brz-red/10 text-brz-red"
                    : "border-brz-line text-brz-mute hover:border-brz-red/50"
                }`}
              >
                🧑‍🤝‍🧑 Pillion
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">পূর্ণ নাম</label>
            <input
              type="text"
              required
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              placeholder="আপনার নাম লিখুন"
              className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">ফোন নম্বর</label>
            <input
              type="tel"
              required
              minLength={11}
              maxLength={11}
              value={details.phone}
              onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-brz-mute">রক্তের গ্রুপ</label>
            <div className="grid grid-cols-4 gap-2">
              {["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setDetails({ ...details, bloodGroup: bg })}
                  className={`rounded-lg border py-2.5 text-sm font-bold transition ${
                    details.bloodGroup === bg
                      ? "border-brz-red bg-brz-red/10 text-brz-red"
                      : "border-brz-line text-brz-mute hover:border-brz-red/50"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            {details.bloodGroup && (() => {
              const compat: Record<string, { donateTo: string[]; receiveFrom: string[] }> = {
                "A+":  { donateTo: ["A+", "AB+"],                        receiveFrom: ["A+", "A−", "O+", "O−"] },
                "A−":  { donateTo: ["A+", "A−", "AB+", "AB−"],           receiveFrom: ["A−", "O−"] },
                "B+":  { donateTo: ["B+", "AB+"],                        receiveFrom: ["B+", "B−", "O+", "O−"] },
                "B−":  { donateTo: ["B+", "B−", "AB+", "AB−"],           receiveFrom: ["B−", "O−"] },
                "AB+": { donateTo: ["AB+"],                               receiveFrom: ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"] },
                "AB−": { donateTo: ["AB+", "AB−"],                        receiveFrom: ["A−", "B−", "AB−", "O−"] },
                "O+":  { donateTo: ["A+", "B+", "O+", "AB+"],            receiveFrom: ["O+", "O−"] },
                "O−":  { donateTo: ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"], receiveFrom: ["O−"] },
              };
              const info = compat[details.bloodGroup];
              const isDonorUniversal = details.bloodGroup === "O−";
              const isReceiverUniversal = details.bloodGroup === "AB+";
              return (
                <div className="mt-3 rounded-lg border border-brz-line bg-brz-black/40 px-4 py-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 text-brz-mute text-xs uppercase tracking-wide w-28 pt-0.5">দিতে পারবেন</span>
                    {isDonorUniversal
                      ? <span className="font-semibold text-green-400">সবাইকে (Universal Donor)</span>
                      : <span className="font-semibold text-brz-white">{info.donateTo.join(", ")}</span>
                    }
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 text-brz-mute text-xs uppercase tracking-wide w-28 pt-0.5">নিতে পারবেন</span>
                    {isReceiverUniversal
                      ? <span className="font-semibold text-brz-amber">সবার থেকে (Universal Recipient)</span>
                      : <span className="font-semibold text-brz-white">{info.receiveFrom.join(", ")}</span>
                    }
                  </div>
                </div>
              );
            })()}
          </div>

          {role === "rider" && (
            <>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">বাইকের মডেল</label>
                <input
                  type="text"
                  required
                  value={details.bikeModel}
                  onChange={(e) => setDetails({ ...details, bikeModel: e.target.value })}
                  placeholder="যেমন: Yamaha R15, Honda CB150R"
                  className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">বাইকের রেজিস্ট্রেশন নম্বর</label>
                <div className="flex items-stretch gap-0 rounded-md border border-brz-line bg-brz-black overflow-hidden focus-within:border-brz-red transition">
                  <select
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="bg-brz-black px-2 py-2 text-sm font-semibold text-brz-white border-r border-brz-line outline-none cursor-pointer"
                  >
                    {REG_AREAS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span className="flex items-center px-2 text-sm text-brz-mute select-none border-r border-brz-line">-</span>
                  <select
                    value={regSeries}
                    onChange={(e) => setRegSeries(e.target.value as "ল" | "হ")}
                    className="bg-brz-black px-2 py-2 text-sm font-bold text-brz-white border-r border-brz-line outline-none cursor-pointer"
                  >
                    <option value="ল">ল</option>
                    <option value="হ">হ</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={details.regNumber}
                    onChange={(e) => setDetails({ ...details, regNumber: e.target.value })}
                    placeholder="১১-১২৩৪"
                    className="flex-1 bg-transparent px-3 py-2 text-brz-white outline-none placeholder:text-brz-mute/50"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">Emergency Contact নম্বর</label>
            <input
              type="tel"
              required
              minLength={11}
              maxLength={11}
              value={details.emergencyContact}
              onChange={(e) => setDetails({ ...details, emergencyContact: e.target.value })}
              placeholder="পরিবার বা বন্ধুর নম্বর"
              className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
              Reference — যেকোনো একজন Admin/Moderator
            </label>
            <select
              required
              value={details.reference}
              onChange={(e) => setDetails({ ...details, reference: e.target.value })}
              className={`w-full cursor-pointer rounded-md border border-brz-line bg-brz-black px-3 py-2 outline-none focus:border-brz-red ${
                details.reference ? "text-brz-white" : "text-brz-mute/50"
              }`}
            >
              <option value="" disabled>Reference বেছে নিন</option>
              {REFERENCES.map((r) => (
                <option key={r} value={r} className="text-brz-white">{r}</option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brz-line p-4 transition hover:border-brz-red/50">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
            />
            <span className="text-sm text-brz-white/90">
              আমি ট্যুরের{" "}
              <a
                href="/events/mega-tour-2026#rules"
                target="_blank"
                className="text-brz-red underline underline-offset-2 hover:text-brz-amber"
              >
                Rules &amp; Regulations
              </a>{" "}
              পড়েছি এবং মেনে চলতে সম্মত আছি।
            </span>
          </label>

          <button
            type="submit"
            disabled={!agreed || !details.bloodGroup}
            className="w-full rounded-md bg-brz-red py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sign Up
          </button>
        </form>
      )}

      {/* ── Step 2: Payment ── */}
      {step === 2 && !submitted && (
        <>
          {/* Method tabs */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brz-mute">
              পেমেন্ট মাধ্যম বেছে নিন
            </p>
            <div className="grid grid-cols-4 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`rounded-lg border px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-brz-white transition ${
                    method === m.key
                      ? `${m.activeBorder} ${m.activeBg}`
                      : `${m.border} ${m.bg}`
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment details */}
          <div className="card mt-4 p-5 space-y-4">
            {(method === "bkash" || method === "nagad") && (
              <>
                <p className="text-xs uppercase tracking-wide text-brz-mute font-semibold">
                  {method === "bkash" ? "bKash" : "Nagad"} — Personal Number
                </p>
                {method === "bkash" && (
                  <div className="flex justify-center">
                    <Image
                      src="/images/bkash-qr.jpg"
                      alt="bKash Bangla QR"
                      width={260}
                      height={340}
                      className="rounded-xl border border-pink-700/40"
                    />
                  </div>
                )}
                <CopyRow label="নম্বর" value="01867790305" onCopy={() => copy("01867790305", "mobile")} copied={copied === "mobile"} />
                <p className="text-sm text-brz-mute">Send Money করুন এবং Transaction ID সংগ্রহ করুন।</p>
              </>
            )}

            {method === "rocket" && (
              <>
                <p className="text-xs uppercase tracking-wide text-brz-mute font-semibold">Rocket — Personal Number</p>
                <div className="flex justify-center">
                  <Image
                    src="/images/rocket-qr.jpg"
                    alt="Rocket QR Code"
                    width={260}
                    height={340}
                    className="rounded-xl border border-purple-700/40"
                  />
                </div>
                <CopyRow label="নম্বর" value="018677903052" onCopy={() => copy("018677903052", "rocket")} copied={copied === "rocket"} />
                <p className="text-sm text-brz-mute">Send Money করুন এবং Transaction ID সংগ্রহ করুন।</p>
              </>
            )}

            {method === "bank" && (
              <>
                <p className="text-xs uppercase tracking-wide text-brz-mute font-semibold">BRAC Bank PLC — Bank Transfer</p>
                <CopyRow label="Account Name" value="SAIDUR RAHMAN SAEED" onCopy={() => copy("SAIDUR RAHMAN SAEED", "accname")} copied={copied === "accname"} />
                <CopyRow label="Account No." value="1069992650001" onCopy={() => copy("1069992650001", "accno")} copied={copied === "accno"} />
                <CopyRow label="Branch" value="BASHABO BRANCH" onCopy={() => copy("BASHABO BRANCH", "branch")} copied={copied === "branch"} />
                <CopyRow label="Routing No." value="060262875" onCopy={() => copy("060262875", "routing")} copied={copied === "routing"} />
                <CopyRow label="SWIFT Code" value="BRAKBDDH" onCopy={() => copy("BRAKBDDH", "swift")} copied={copied === "swift"} />
                <p className="text-sm text-brz-mute">Transfer করার পর Transaction/Reference ID সংগ্রহ করুন।</p>
              </>
            )}
          </div>

          {/* Confirm form */}
          <form onSubmit={handlePaymentSubmit} className="card mt-4 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-brz-white">
              Payment Confirm করুন
            </h2>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">
                যে নম্বর থেকে পেমেন্ট করেছেন
                {method === "bank" && <span className="ml-1 normal-case text-brz-mute/60">(optional)</span>}
              </label>
              <input
                type="tel"
                required={method !== "bank"}
                minLength={11}
                maxLength={11}
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-brz-mute">Transaction ID</label>
              <input
                type="text"
                required
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="Transaction / Reference ID"
                className="w-full rounded-md border border-brz-line bg-brz-black px-3 py-2 text-brz-white outline-none focus:border-brz-red placeholder:text-brz-mute/50"
              />
            </div>

            {submitError && (
              <p
                role="alert"
                className="rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300"
              >
                {submitError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md border border-brz-line px-5 py-2.5 text-sm font-semibold text-brz-mute transition hover:border-brz-red hover:text-brz-red"
              >
                ← পেছনে
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-md bg-brz-red py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brz-ink transition hover:bg-brz-amber disabled:opacity-60"
              >
                {submitting ? "পাঠানো হচ্ছে..." : "Confirm করুন"}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Success */}
      {submitted && (
        <div className="card mt-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20 text-3xl">
            ✓
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-green-400">
            সাবমিট হয়েছে!
          </h2>
          <p className="mt-2 text-brz-mute">
            আমরা পেমেন্ট যাচাই করে আপনাকে জানাবো।
          </p>
        </div>
      )}

      {/* WhatsApp support */}
      <div className="card mt-4 p-5">
        <p className="text-xs uppercase tracking-wide text-brz-mute font-semibold mb-3">
          পেমেন্টের পর কোনো সমস্যা হলে WhatsApp করুন
        </p>
        <div className="flex flex-col gap-2">
          <a href="https://wa.me/8801867790305" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md border border-green-700/50 bg-green-950/20 px-4 py-3 transition hover:border-green-500">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-brz-white">01867790305</p>
              <p className="text-xs text-brz-mute">WhatsApp</p>
            </div>
          </a>
          <a href="https://wa.me/8801558006738" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md border border-green-700/50 bg-green-950/20 px-4 py-3 transition hover:border-green-500">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-brz-white">+880 1558-006738</p>
              <p className="text-xs text-brz-mute">WhatsApp</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function CopyRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-brz-line bg-brz-black/50 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-brz-mute">{label}</p>
        <p className="font-mono text-sm font-semibold text-brz-white">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 rounded border border-brz-line px-2.5 py-1 text-xs text-brz-mute transition hover:border-brz-red hover:text-brz-red"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}
