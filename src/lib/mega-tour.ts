/** Pass/seat label shown on a Mega Tour 2026 pass, e.g. 7 → "BRZ-007". */
export function passId(serial: number | null) {
  return serial ? `BRZ-${String(serial).padStart(3, "0")}` : "BRZ-—";
}
