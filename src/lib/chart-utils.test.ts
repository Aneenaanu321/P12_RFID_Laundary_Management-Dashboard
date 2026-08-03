import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectSeriesSpikes } from "./chart-utils";

describe("detectSeriesSpikes", () => {
  it("returns largest day-over-day spikes", () => {
    const series = [
      { dateLabel: "01-01", missing: 10 },
      { dateLabel: "01-02", missing: 12 },
      { dateLabel: "01-03", missing: 40 },
      { dateLabel: "01-04", missing: 41 },
      { dateLabel: "01-05", missing: 80 },
    ];
    const markers = detectSeriesSpikes(series, "missing", "dateLabel", {
      minDelta: 5,
      minPct: 0.05,
      limit: 2,
      href: "/loss/analytics",
    });
    assert.equal(markers.length, 2);
    assert.equal(markers[0].x, "01-05");
    assert.equal(markers[0].href, "/loss/analytics");
    assert.equal(markers[1].x, "01-03");
  });

  it("returns empty when no spikes qualify", () => {
    const series = [
      { dateLabel: "a", missing: 10 },
      { dateLabel: "b", missing: 11 },
    ];
    assert.deepEqual(detectSeriesSpikes(series, "missing"), []);
  });
});
