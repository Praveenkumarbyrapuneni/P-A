import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadPage, ROOT } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/trust-security.html";
const { document } = loadPage(REL_PATH);

test("trust-security.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("trust-security.html: header nav, dropdown icons/chevrons, Trust & Security marked current", () => {
  assertHeaderNav(document, "Trust & Security");
});

test("trust-security.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("trust-security.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("trust-security.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("trust-security.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("trust-security.html: top-level sections (hero, figure, body, cta)", () => {
  assertTopLevelSections(document, [
    "section.tsec-hero",
    "figure.tsec-figure",
    "div.tsec-body",
    "section.tsec-cta",
  ]);
});

test("trust-security.html: deployment spectrum has all 4 stops", () => {
  const stops = document.querySelectorAll("[data-spectrum] .tsec-spectrum-stop");
  assert.equal(stops.length, 4, `expected 4 deployment stops, found ${stops.length}`);
  const details = document.querySelectorAll("[data-spectrum-detail]");
  assert.equal(details.length, 4, `expected 4 detail paragraphs, found ${details.length}`);
});

test("trust-security.html: security posture ledger and left-rail index are present", () => {
  assert.ok(document.querySelectorAll("[data-index-section]").length > 0, "index sections must exist");
  assert.ok(document.querySelectorAll("[data-index-link]").length > 0, "index rail links must exist");
});

test("trust-security.html: all 3 photo exhibits are present with FIG. captions", () => {
  const figures = document.querySelectorAll(".tsec-figure");
  assert.ok(figures.length >= 1, "at least one .tsec-figure must be a direct <main> child");
  const allFigures = document.querySelectorAll("figure.tsec-figure, .tsec-body figure.tsec-figure");
  assert.ok(allFigures.length >= 1);
});

// Regression test for the exact bug fixed this session: the deployment
// spectrum's fill line is positioned at left:12.5% on a track whose
// visible line only spans 75% of the container (left:12.5% to right:12.5%
// in styles.css), but the JS was scaling fill width to 100% of the full
// container — overshooting past the last stop. See CLAUDE.md for the
// full writeup and js/trust-security.js:activateStop.
test("REGRESSION: deployment spectrum fill scales to 75%, not 100% (overshoot bug)", () => {
  const js = fs.readFileSync(path.join(ROOT, "js/trust-security.js"), "utf-8");
  assert.match(
    js,
    /\(index \/ \(stops\.length - 1\)\) \* 75/,
    "spectrum fill width must scale to 75% of the track (matching the 12.5%-inset line in styles.css), not 100%"
  );
});
