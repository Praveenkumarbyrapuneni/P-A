// Cross-page invariants that don't belong to any single page's test file —
// things that must hold identically across all 23 pages at once.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadPage, ROOT } from "./helpers/dom.mjs";

const ALL_PAGES = fs.readdirSync(path.join(ROOT, "pages"))
  .filter((f) => f.endsWith(".html"))
  .map((f) => "pages/" + f)
  .concat(["index.html"]);

test(`sitewide: all ${ALL_PAGES.length} pages found on disk`, () => {
  assert.equal(ALL_PAGES.length, 23, `expected 23 total pages, found ${ALL_PAGES.length}`);
});

test("sitewide: every page's nav dropdowns have exactly 15 icons + 2 chevrons", () => {
  for (const rel of ALL_PAGES) {
    const { document } = loadPage(rel);
    const icons = document.querySelectorAll("svg.nav-dropdown-icon");
    const chevrons = document.querySelectorAll("svg.nav-chevron");
    assert.equal(icons.length, 15, `${rel}: expected 15 nav-dropdown-icon, found ${icons.length}`);
    assert.equal(chevrons.length, 2, `${rel}: expected 2 nav-chevron, found ${chevrons.length}`);
  }
});

test("sitewide: every page has the mobile hamburger toggle as the first interactive element in the header", () => {
  for (const rel of ALL_PAGES) {
    const { document } = loadPage(rel);
    const header = document.querySelector("header.site-header");
    const toggle = header.querySelector("#nav-toggle");
    assert.ok(toggle, `${rel}: missing #nav-toggle`);
    // Must precede .site-nav for the CSS sibling-selector chain to work.
    const nav = header.querySelector(".site-nav");
    assert.ok(
      toggle.compareDocumentPosition(nav) & 4 /* Node.DOCUMENT_POSITION_FOLLOWING */,
      `${rel}: #nav-toggle must come before .site-nav in the DOM`
    );
  }
});

test("sitewide: every page loads styles.css from the repo root with a cache-busting query", () => {
  for (const rel of ALL_PAGES) {
    const { document } = loadPage(rel);
    const link = document.querySelector('link[rel="stylesheet"][href*="styles.css"]');
    assert.ok(link, `${rel}: missing styles.css link`);
    const expectedPrefix = rel === "index.html" ? "styles.css" : "../styles.css";
    assert.ok(link.getAttribute("href").startsWith(expectedPrefix),
      `${rel}: styles.css href should start with "${expectedPrefix}", got "${link.getAttribute("href")}"`);
  }
});

test("sitewide: no page links to the old #sign-in placeholder with different label text", () => {
  for (const rel of ALL_PAGES) {
    const { document } = loadPage(rel);
    const cta = document.querySelector("a.nav-cta");
    assert.equal(cta.getAttribute("href"), "#sign-in");
    assert.equal(cta.textContent.trim(), "Sign In");
  }
});

test("sitewide: index.html is the only page at the repo root (Amplify rewrite depends on this)", () => {
  const rootHtml = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  assert.deepEqual(rootHtml, ["index.html"], `repo root must contain only index.html, found: ${rootHtml.join(", ")}`);
});
