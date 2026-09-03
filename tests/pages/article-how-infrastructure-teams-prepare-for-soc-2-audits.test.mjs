import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/article-how-infrastructure-teams-prepare-for-soc-2-audits.html";
const { document } = loadPage(REL_PATH);

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: header nav, dropdown icons/chevrons, Resources marked current", () => {
  assertHeaderNav(document, "Resources");
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: top-level sections (article body, cta)", () => {
  assertTopLevelSections(document, [
    "article.ap-article",
    "section.rs-cta",
  ]);
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: table of contents and scroll-progress bar are present", () => {
  assert.ok(document.querySelector(".ap-toc"), "article must have a table of contents");
  assert.ok(document.querySelector(".ap-progress"), "article must have a scroll-progress bar");
});

test("article-how-infrastructure-teams-prepare-for-soc-2-audits.html: has related-article links", () => {
  const related = document.querySelectorAll(".ap-related-grid a");
  assert.ok(related.length > 0, "article must link to at least one related piece");
});
