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

const REL_PATH = "pages/why-racktrack.html";
const { document } = loadPage(REL_PATH);

test("why-racktrack.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("why-racktrack.html: header nav, dropdown icons/chevrons, Why RackTrack marked current", () => {
  assertHeaderNav(document, "Why RackTrack");
});

test("why-racktrack.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("why-racktrack.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("why-racktrack.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("why-racktrack.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("why-racktrack.html: top-level sections (hero, steps, evidence stack, cta)", () => {
  assertTopLevelSections(document, [
    "section.why-hero",
    "section.why-steps-section",
    "section.why-stack-section",
    "section.why-cta",
  ]);
});

test("why-racktrack.html: 01/03 verification step cards are present", () => {
  const steps = document.querySelectorAll(".why-step-card");
  assert.equal(steps.length, 3, `expected 3 verification step cards, found ${steps.length}`);
});

// The evidence section is a drag-to-compare slider (unverified vs. verified
// rack state), not the sticky stacked-card treatment older project notes
// describe — this is the real, current markup (verified via jsdom).
test("why-racktrack.html: drag-to-compare evidence slider is present", () => {
  const compare = document.querySelector("[data-compare]");
  assert.ok(compare, "the drag-to-compare evidence element must exist");
});

// Regression test for the exact bug fixed this session: a comment-cleanup
// edit left an orphaned ".why-page," selector line feeding into a
// ".why-page img, ... { transform: translateZ(0) }" rule, so the transform
// landed on <body class="why-page"> itself instead of just <img> elements.
// A transform on any ancestor creates a new containing block for
// position:fixed descendants, which silently unpinned the header nav on
// scroll — only on this page. See CLAUDE.md for the full writeup.
test("REGRESSION: styles.css has no orphaned .why-page selector line (nav-unpin bug)", () => {
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf-8");
  assert.doesNotMatch(
    css,
    /^\.why-page,\s*$/m,
    "found a bare '.why-page,' selector line — check it isn't merging into an unrelated rule below it " +
    "(the translateZ(0)-on-<body> bug from earlier this project)"
  );
});
