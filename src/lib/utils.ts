import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPrice(taka: number): string {
  return `৳${taka.toLocaleString("en-US")}`;
}

export function id(): string {
  return crypto.randomUUID();
}

/** Parses an event's `photos` column (JSON array of image paths, or null)
 * into a plain string array. Never throws — bad/missing data just yields
 * an empty gallery instead of crashing the page. */
export function parsePhotos(photos: string | null | undefined): string[] {
  if (!photos) return [];
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed)
      ? parsed.filter(
          (p): p is string => typeof p === "string" && p.trim().length > 0
        )
      : [];
  } catch {
    return [];
  }
}

/** Turns admin-form textarea input (one image path/URL per line) into the
 * JSON string stored in the `photos` column. Returns null when empty so
 * we store NULL rather than "[]" for events with no gallery. */
export function photosToJson(text: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? JSON.stringify(lines) : null;
}
