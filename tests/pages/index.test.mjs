import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "index.html";
const { document } = loadPage(REL_PATH);

test("index.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("index.html: header nav present, dropdown icons/chevrons (no current item — homepage isn't in its own nav)", () => {
  assertHeaderNav(document, null);
});

test("index.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("index.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("index.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("index.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

// No .hero-shell section exists as a separate top-level section — the hero
// content lives inside .sequence-story. This is the real, current structure
// (verified via jsdom), not the older 5-chapter framing some project docs
// still describe — see AGENTS.md's note that only world-timeline.js's own
// section is authoritative for Ch4-8, everything else there is historical.
test("index.html: top-level sections (scan sequence, bridge, world story, proof tour, cta)", () => {
  assertTopLevelSections(document, [
    "section.sequence-story",
    "section.story-bridge",
    "section.world-story",
    "section.proof-tour",
    "section.home-cta",
  ]);
});

test("index.html: continuous world-story has all 5 narrative beats", () => {
  const beats = document.querySelectorAll(".world-beat");
  assert.equal(beats.length, 5, `expected 5 world-story beats, found ${beats.length}`);
});

test("index.html: proof tour has all 6 floor-plan views", () => {
  const views = document.querySelectorAll(".tour-view");
  assert.equal(views.length, 6, `expected 6 proof-tour views, found ${views.length}`);
});

test("index.html: loads js/homepage.js, which imports world-timeline.js as a sibling", () => {
  const script = document.querySelector("script[src*=\"homepage.js\"]");
  assert.ok(script, "index.html must load js/homepage.js");
});

test("index.html: no Chapter 9 / Final CTA section exists (explicitly cancelled)", () => {
  assert.equal(document.querySelector(".chapter-9, .final-cta, #chapter-9"), null,
    "Chapter 9 was cancelled and must never be reintroduced without being asked for again");
});
