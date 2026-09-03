import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/use-case-m-a-migration-teams.html";
const { document } = loadPage(REL_PATH);

test("use-case-m-a-migration-teams.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("use-case-m-a-migration-teams.html: header nav, dropdown icons/chevrons, Use Cases marked current", () => {
  assertHeaderNav(document, "Use Cases");
});

test("use-case-m-a-migration-teams.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("use-case-m-a-migration-teams.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("use-case-m-a-migration-teams.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("use-case-m-a-migration-teams.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("use-case-m-a-migration-teams.html: top-level sections (hero, article body)", () => {
  assertTopLevelSections(document, [
    "section.case-hero",
    "article.case-article",
  ]);
});

// Each of the 6 detail pages has a genuinely different hero design tied to
// that role's own problem, not a shared template with a color swap — see
// CLAUDE.md's "no repeated card styles" rule applied at the page level.
// This is the one real, role-specific marker every hero carries.
test("use-case-m-a-migration-teams.html: hero carries its own distinct role modifier class, not a generic template", () => {
  const hero = document.querySelector(".case-hero");
  assert.ok(hero.classList.contains("case-hero-migration"),
    `expected .case-hero to carry "case-hero-migration", got [${[...hero.classList].join(", ")}]`);
});

test("use-case-m-a-migration-teams.html: no dark (--ink) background is the dominant hero theme", () => {
  // Network/Security/Incident heroes were previously built dark and reverted
  // per the standing "no dark background as dominant theme" rule — this is
  // a lightweight regression guard, not a full color-contrast test.
  const hero = document.querySelector(".case-hero");
  assert.ok(!hero.classList.contains("case-hero-dark"),
    "case-hero must not carry a dark-theme modifier class");
});
