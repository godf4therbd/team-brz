// Shared by the DB schema, the API and the UI (client-safe — no DB imports).
export const GEAR_CATEGORIES = [
  "HELMET",
  "GLOVES",
  "JACKET",
  "BOOTS",
  "COMMUNICATOR",
  "AUX_LIGHT",
  "OTHER",
] as const;

export type GearCategory = (typeof GEAR_CATEGORIES)[number];

export const GEAR_LABEL: Record<GearCategory, { label: string; icon: string }> = {
  HELMET: { label: "Helmet", icon: "🪖" },
  GLOVES: { label: "Gloves", icon: "🧤" },
  JACKET: { label: "Riding jacket", icon: "🧥" },
  BOOTS: { label: "Riding shoes / boots", icon: "🥾" },
  COMMUNICATOR: { label: "Communicator", icon: "🎧" },
  AUX_LIGHT: { label: "Auxiliary light", icon: "💡" },
  OTHER: { label: "Other gear", icon: "🛠️" },
};

/** Most gear a single member can list — keeps profiles tidy. */
export const MAX_GEAR_ITEMS = 20;
