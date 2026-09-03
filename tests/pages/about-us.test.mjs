import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/about-us.html";
const { document } = loadPage(REL_PATH);

test("about-us.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("about-us.html: header nav present, dropdown icons/chevrons (no current item — About Us is footer-only)", () => {
  assertHeaderNav(document, null);
});

test("about-us.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("about-us.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("about-us.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("about-us.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("about-us.html: top-level sections (hero, does, founder, facts, matters, mission)", () => {
  assertTopLevelSections(document, [
    "section.ab-hero",
    "section.ab-does",
    "section.ab-founder",
    "section.ab-facts",
    "section.ab-matters",
    "section.ab-mission",
  ]);
});

test("about-us.html: founder narrative story-spine SVG is present", () => {
  const spine = document.querySelector("[data-spine-line]");
  assert.ok(spine, "the scroll-drawn story-spine SVG line must exist");
});

test("about-us.html: company facts grid has 5 real facts", () => {
  const facts = document.querySelectorAll(".ab-facts .ab-fact-icon");
  assert.equal(facts.length, 5, `expected 5 company fact icons, found ${facts.length}`);
});

test("about-us.html: 'Why It Matters' stat blocks are present and no investor-logo placeholder exists", () => {
  const stats = document.querySelectorAll(".ab-matters .ab-stat");
  assert.ok(stats.length > 0, "stat blocks must exist");
  // Deliberate content gap per CLAUDE.md: no fabricated investor-logo row.
  assert.equal(document.querySelector(".ab-investors, .ab-logos"), null,
    "no fabricated investor/logo section should exist (there's no real logo to show)");
});
