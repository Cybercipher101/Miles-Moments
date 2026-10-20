import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingTotal,
  nightsBetween,
  filterDestinations,
  safeReturn,
  escapeHTML,
} from "../dist/js/core.js";
import { destinations } from "../dist/js/data.js";
test("hotel totals charge per room, include nights, and handle odd guest counts", () => {
  assert.equal(bookingTotal("hotel", 6200, 3, 3), 37200);
  assert.equal(bookingTotal("package", 42900, 2), 85800);
  assert.equal(bookingTotal("flight", 24900, 1), 24900);
});
test("invalid stay lengths and traveler counts are rejected", () => {
  for (const g of [0, -1, 9, 1.5, NaN])
    assert.throws(() => bookingTotal("hotel", 100, g, 2));
  for (const n of [0, -2, 31, NaN])
    assert.throws(() => bookingTotal("hotel", 100, 2, n));
});
test("night count stays correct over month and daylight-saving boundaries", () => {
  assert.equal(nightsBetween("2026-10-31", "2026-11-02"), 2);
  assert.equal(nightsBetween("2026-12-31", "2027-01-02"), 2);
  assert.equal(nightsBetween("2026-01-02", "2026-01-01"), -1);
  assert.equal(nightsBetween("", ""), 0);
});
test("combined filters and sorts preserve the original catalog", () => {
  const ids = destinations.map((d) => d.id);
  assert.deepEqual(
    filterDestinations(destinations, { category: "Coast", budget: 80000 }).map(
      (d) => d.id,
    ),
    ["santorini"],
  );
  assert.equal(
    filterDestinations(destinations, { q: "bamboo" })[0].id,
    "kyoto",
  );
  assert.equal(
    filterDestinations(destinations, { sort: "price-low" })[0].id,
    "jaipur",
  );
  assert.equal(
    filterDestinations(destinations, { q: "no-such-place" }).length,
    0,
  );
  assert.deepEqual(
    destinations.map((d) => d.id),
    ids,
  );
});
test("return destinations reject external and executable redirects", () => {
  assert.equal(safeReturn("package.html?id=bali"), "package.html?id=bali");
  for (const s of [
    "https://evil.test",
    "//evil.test",
    "javascript:alert(1)",
    "../../x",
    "admin.html/evil",
  ])
    assert.equal(safeReturn(s), "home.html");
});
test("user text is escaped before interpolation", () => {
  assert.equal(
    escapeHTML('<img src=x onerror="1">'),
    "&lt;img src=x onerror=&quot;1&quot;&gt;",
  );
  assert.equal(escapeHTML("a&b's"), "a&amp;b&#39;s");
});
