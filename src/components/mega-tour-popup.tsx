"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useNow } from "@/components/use-now";
import { MEGA_TOUR_START, timeLeft, tourPhase } from "@/lib/mega-tour";

const SEEN_KEY = "brz-mega-tour-popup-seen";
const SHOW_AFTER_MS = 1500;
const ONCE_PER_MS = 24 * 60 * 60 * 1000; // at most once a day per browser

function seenRecently() {
  try {
    const t = Number(localStorage.getItem(SEEN_KEY));
    return Number.isFinite(t) && Date.now() - t < ONCE_PER_MS;
  } catch {
    return false; // storage blocked (private mode) — just show it
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

// "Join Mega Tour" popup on the homepage. Animates in shortly after load,
// at most once a day, and only before the tour departs.
export default function MegaTourPopup() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const now = useNow();

  useEffect(() => {
    if (Date.now() >= MEGA_TOUR_START.getTime() || seenRecently()) return;
    const t = setTimeout(() => {
      setOpen(true);
      markSeen();
    }, SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || (now !== null && tourPhase(now) !== "upcoming")) return null;
  const left = now === null ? null : timeLeft(now);

  return (
    <div
      className={
        "fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center " +
        (closing
          ? "motion-safe:animate-[brzFadeOut_0.22s_ease-in_forwards]"
          : "motion-safe:animate-[brzFadeIn_0.3s_ease-out]")
      }
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mega-popup-title"
        className={
          "relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#141417] text-white shadow-[0_30px_80px_-20px_rgba(245,37,31,0.45)] " +
          (closing
            ? "motion-safe:animate-[brzPopOut_0.22s_ease-in_forwards]"
            : "motion-safe:animate-[brzPopIn_0.55s_cubic-bezier(0.2,0.9,0.3,1.25)]")
        }
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg text-white transition hover:bg-[#f5251f]"
        >
          ×
        </button>

        <div className="relative h-40 overflow-hidden">
          <Image
            src="/images/tours/brz-mega-tour-1/5.jpg"
            alt="Team Brz crew on Mega Tour 1"
            fill
            sizes="384px"
            className="object-cover object-[50%_30%] motion-safe:animate-[brzKenBurns_8s_ease-out_forwards]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-black/30 to-transparent" />
          {/* A bike that rides across the banner once */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-0 text-3xl motion-safe:animate-[brzRide_2.2s_ease-in-out_0.4s_both] motion-reduce:hidden"
          >
            🏍️
          </span>
        </div>

        <div className="px-6 pb-6 pt-1 text-center">
          {/* No letter-spacing: it breaks up Bangla glyphs. */}
          <p className="text-sm font-bold text-[#ff6b66]">
            ১৬ ডিসেম্বর · রাত ১২টা
          </p>
          <h2
            id="mega-popup-title"
            className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight"
          >
            Join Mega Tour <span className="text-[#f5251f]">2026</span>
          </h2>
          <p className="mt-2 text-sm text-white/65">
            ৫ দিন, বান্দরবানের সবচেয়ে সুন্দর পাহাড়ি রাস্তা — বগালেক, তিন্দু, হোয়াইট পিক।
          </p>

          <div className="mt-4 flex justify-center gap-2">
            {(
              [
                ["days", "দিন"],
                ["hours", "ঘণ্টা"],
                ["minutes", "মিনিট"],
                ["seconds", "সেকেন্ড"],
              ] as const
            ).map(([k, label]) => (
              <div
                key={k}
                className="w-14 rounded-lg border border-white/10 bg-white/[0.05] py-1.5"
              >
                <div className="font-display text-xl font-bold tabular-nums">
                  {left ? String(left[k]).padStart(2, "0") : "--"}
                </div>
                <div className="text-[10px] text-white/50">{label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/events/mega-tour-2026/payment"
            onClick={close}
            className="mt-5 block rounded-md bg-[#f5251f] py-3 font-display text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(245,37,31,0.45)] transition hover:bg-[#ff4a44] motion-safe:animate-[brzGlow_2.4s_ease-in-out_infinite]"
          >
            Join now
          </Link>
          <Link
            href="/events/mega-tour-2026"
            onClick={close}
            className="mt-2 block py-2 text-sm font-semibold text-white/70 hover:text-white"
          >
            বিস্তারিত দেখুন →
          </Link>
        </div>
      </div>
    </div>
  );
}
