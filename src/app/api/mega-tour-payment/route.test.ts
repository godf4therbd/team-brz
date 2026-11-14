import assert from "node:assert/strict";
import test from "node:test";

import { normalizePhone } from "./route";

test("normalizePhone keeps digits only so lookups match however a number was typed", () => {
  assert.equal(normalizePhone("01700-000 000"), "01700000000");
  assert.equal(normalizePhone("+88 01700000000"), "01700000000");
  assert.equal(normalizePhone("8801700000000"), "01700000000");
  assert.equal(normalizePhone(""), "");
  assert.equal(normalizePhone(null), "");
  assert.equal(normalizePhone(undefined), "");
});
