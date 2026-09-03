import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/solutions.html";
const { document } = loadPage(REL_PATH);

test("solutions.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("solutions.html: header nav, dropdown icons/chevrons, Solutions marked current", () => {
  assertHeaderNav(document, "Solutions");
});

test("solutions.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("solutions.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("solutions.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("solutions.html: stylesheets are cache-busted (styles.css and rack-reader.css)", () => {
  assertCacheBustedStylesheet(document);
  const reader = document.querySelector('link[rel="stylesheet"][href*="rack-reader.css"]');
  assert.ok(reader, "solutions.html must load its cabinet-reader stylesheet");
  assert.ok(/\?v=/.test(reader.getAttribute("href")), "rack-reader.css must be cache-busted too");
});

test("solutions.html: top-level sections (hero, process, schematic, workflow deck, cta)", () => {
  assertTopLevelSections(document, [
    "section.solutions-hero",
    "section.process-section",
    "section.schematic-section",
    "section.py-10",
    "section.workflow-section",
    "section.solutions-cta",
  ]);
});

test("solutions.html: original system schematic artwork is present", () => {
  const schematic = document.querySelector(".schematic-section img, .original-schematic img");
  assert.ok(schematic, "the system schematic image must exist");
});

test("solutions.html: cabinet reader (Sheet 03) is present and reveal-tagged", () => {
  const panel = document.querySelector(".rk-panel[data-reveal]");
  assert.ok(panel, "cabinet reader figure must carry data-reveal (regression: it was missing from the reveal list once)");
});

test("solutions.html: Six Surfaces workflow deck has 6 cards", () => {
  const cards = document.querySelectorAll(".surface-grid article");
  assert.equal(cards.length, 6, `expected 6 intelligence-surface cards, found ${cards.length}`);
});

test("solutions.html: hero has its two entry-point actions", () => {
  const actions = document.querySelectorAll(".solutions-hero-actions a");
  assert.ok(actions.length >= 2, "hero must offer at least 2 ways into the page (process / rack reader)");
});
