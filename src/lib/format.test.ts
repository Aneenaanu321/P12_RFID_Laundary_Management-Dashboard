import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fmtAED, fmtNumber, fmtPct, titleCase } from "./format";

describe("format helpers", () => {
  it("formats AED currency", () => {
    assert.equal(fmtAED(1200), "AED 1,200");
    assert.equal(fmtAED(12.5), "AED 12.5");
  });

  it("formats numbers and percents", () => {
    assert.equal(fmtNumber(125420), "125,420");
    assert.equal(fmtPct(12.345, 1), "12.3%");
  });

  it("title-cases status tokens", () => {
    assert.equal(titleCase("IN_LAUNDRY"), "In Laundry");
    assert.equal(titleCase("missing"), "Missing");
  });
});
