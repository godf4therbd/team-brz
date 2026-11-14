/** Pass/seat label shown on a Mega Tour 2026 pass, e.g. 7 → "BRZ-007". */
export function passId(serial: number | null) {
  return serial ? `BRZ-${String(serial).padStart(3, "0")}` : "BRZ-—";
}

/** Departure: midnight between 15 and 16 December 2026, Dhaka time (UTC+6). */
export const MEGA_TOUR_START = new Date("2026-12-16T00:00:00+06:00");

/** 5 days / 4 nights — after this the countdown and popup disappear. */
export const MEGA_TOUR_END = new Date("2026-12-21T00:00:00+06:00");

export type TourPhase = "upcoming" | "live" | "over";

export function tourPhase(now: number): TourPhase {
  if (now < MEGA_TOUR_START.getTime()) return "upcoming";
  if (now < MEGA_TOUR_END.getTime()) return "live";
  return "over";
}

/** Remaining time until departure, split for display (all ≥ 0). */
export function timeLeft(now: number) {
  const ms = Math.max(0, MEGA_TOUR_START.getTime() - now);
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
