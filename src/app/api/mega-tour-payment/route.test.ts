import assert from "node:assert/strict";
import test from "node:test";

import { findMatchingRow } from "./route";

test("findMatchingRow matches either registration phone or sender number", () => {
  const rows = [
    ["2026-11-13", "Alice", "01700000000", "Rider", "", "", "", "bKash", "01911111111", "TXN123", "O+", "done"],
    ["2026-11-13", "Bob", "01812345678", "Pillion", "", "", "", "Nagad", "", "TXN456", "A+", "pending"],
  ];

  assert.deepEqual(findMatchingRow(rows, "01911111111"), rows[0]);
  assert.deepEqual(findMatchingRow(rows, "01812345678"), rows[1]);
  assert.equal(findMatchingRow(rows, "99999999999"), undefined);
});
