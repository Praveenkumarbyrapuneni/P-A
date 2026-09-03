import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/article-the-hidden-cost-of-wrong-rack-inventory.html";
const { document } = loadPage(REL_PATH);

test("article-the-hidden-cost-of-wrong-rack-inventory.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: header nav, dropdown icons/chevrons, Resources marked current", () => {
  assertHeaderNav(document, "Resources");
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: top-level sections (article body, cta)", () => {
  assertTopLevelSections(document, [
    "article.ap-article",
    "section.rs-cta",
  ]);
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: table of contents and scroll-progress bar are present", () => {
  assert.ok(document.querySelector(".ap-toc"), "article must have a table of contents");
  assert.ok(document.querySelector(".ap-progress"), "article must have a scroll-progress bar");
});

test("article-the-hidden-cost-of-wrong-rack-inventory.html: has related-article links", () => {
  const related = document.querySelectorAll(".ap-related-grid a");
  assert.ok(related.length > 0, "article must link to at least one related piece");
});
