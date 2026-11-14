"use client";

import { useEffect, useState } from "react";

/**
 * Current time (ms), ticking every `intervalMs`. Returns null until the
 * component has mounted, so server-rendered HTML and the first client
 * render match (no hydration mismatch from a clock that moved on).
 */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
