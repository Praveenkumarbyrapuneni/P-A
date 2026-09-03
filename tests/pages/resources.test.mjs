import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/resources.html";
const { document } = loadPage(REL_PATH);

test("resources.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("resources.html: header nav, dropdown icons/chevrons, Resources marked current", () => {
  assertHeaderNav(document, "Resources");
});

test("resources.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("resources.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("resources.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("resources.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("resources.html: top-level sections (hero, featured, catalog, cta)", () => {
  assertTopLevelSections(document, [
    "section.rs-hero",
    "section.rs-featured",
    "section.rs-catalog",
    "section.rs-cta",
  ]);
});

test("resources.html: all 9 articles are linked from this hub", () => {
  const links = new Set(
    Array.from(document.querySelectorAll('a[href^="article-"]')).map((a) => a.getAttribute("href"))
  );
  assert.equal(links.size, 9, `expected all 9 articles linked, found ${links.size}: ${[...links].join(", ")}`);
});
