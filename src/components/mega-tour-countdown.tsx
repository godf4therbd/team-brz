"use client";

import Link from "next/link";
import { useNow } from "@/components/use-now";
import { timeLeft, tourPhase } from "@/lib/mega-tour";

const UNITS = [
  { key: "days", label: "দিন" },
  { key: "hours", label: "ঘণ্টা" },
  { key: "minutes", label: "মিনিট" },
  { key: "seconds", label: "সেকেন্ড" },
] as const;

// Homepage strip counting down to Mega Tour 2026 departure. Switches to a
// "tour is on" message during the tour and disappears once it's over.
export default function MegaTourCountdown() {
  const now = useNow();
  const phase = now === null ? "upcoming" : tourPhase(now);
  if (phase === "over") return null;

  const left = now === null ? null : timeLeft(now);

  return (
    <section
      aria-label="Mega Tour 2026 countdown"
      className="relative overflow-hidden border-b border-brz-line bg-[#0d0d10] text-white"
    >
      {/* Red glow + faint road lines — fixed dark band in either theme */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 120% at 50% 120%, rgba(245,37,31,0.35), transparent 70%), repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,0.03) 46px 48px)",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 md:px-6 lg:flex-row lg:justify-between 2xl:max-w-[1500px]">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#f5251f]/50 bg-[#f5251f]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#ff6b66]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5251f] opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5251f]" />
            </span>
            {phase === "live" ? "Tour is live" : "Registration open"}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            Mega Tour <span className="text-[#f5251f]">2026</span>
          </h2>
          <p className="mt-1 text-sm text-white/60">
            ১৬ ডিসেম্বর · রাত ১২টা · ঢাকা → বান্দরবান → বগালেক → তিন্দু → হোয়াইট পিক
          </p>
        </div>

        {phase === "live" ? (
          <p className="font-display text-2xl font-bold uppercase tracking-wide text-[#f5251f] md:text-3xl">
            🏍️ ট্যুর চলছে — নিরাপদে চালান!
          </p>
        ) : (
          <div className="flex gap-2 sm:gap-3" role="timer" aria-live="off">
            {UNITS.map(({ key, label }) => {
              const v = left ? left[key] : null;
              const text = v === null ? "--" : String(v).padStart(2, "0");
              return (
                <div
                  key={key}
                  className="flex w-[4.25rem] flex-col items-center rounded-xl border border-white/10 bg-white/[0.04] py-3 backdrop-blur sm:w-20"
                >
                  <span className="relative h-9 overflow-hidden sm:h-11">
                    {/* key={text} remounts the digits so they tick in */}
                    <span
                      key={text}
                      className="block font-display text-3xl font-bold tabular-nums leading-9 text-white sm:text-4xl sm:leading-[2.75rem] motion-safe:animate-[brzTick_0.35s_ease-out]"
                    >
                      {text}
                    </span>
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {phase === "upcoming" && (
            <Link
              href="/events/mega-tour-2026/payment"
              className="rounded-md bg-[#f5251f] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(245,37,31,0.45)] transition hover:bg-[#ff4a44] motion-safe:animate-[brzGlow_2.4s_ease-in-out_infinite]"
            >
              Register now
            </Link>
          )}
          <Link
            href="/events/mega-tour-2026"
            className="rounded-md border border-white/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:border-[#f5251f] hover:text-[#f5251f]"
          >
            Details
          </Link>
        </div>
      </div>
    </section>
  );
}
