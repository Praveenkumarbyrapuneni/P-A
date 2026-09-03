// Shared assertion helpers, reused by every tests/pages/*.test.mjs file so
// the header/footer/link/image checks aren't duplicated 23 times.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pageDir } from "./dom.mjs";

const NAV_ITEMS = [
  "Why RackTrack", "Solutions", "Use Cases", "Resources",
  "Trust & Security", "Contact Us",
];

export function assertBasicMeta(document) {
  const title = document.querySelector("title");
  assert.ok(title && title.textContent.trim().length > 0, "page must have a non-empty <title>");

  const desc = document.querySelector('meta[name="description"]');
  assert.ok(desc && desc.getAttribute("content")?.trim().length > 0,
    "page must have a non-empty meta description");

  const h1s = document.querySelectorAll("h1");
  assert.equal(h1s.length, 1, `page must have exactly one <h1>, found ${h1s.length}`);
}

// currentLabel: the nav link text that should carry is-current on this page,
// or null if no nav item should be marked current (homepage, About Us).
export function assertHeaderNav(document, currentLabel) {
  const header = document.querySelector("header.site-header");
  assert.ok(header, "page must have <header class=\"site-header\">");

  const brand = header.querySelector("a.brand");
  assert.ok(brand, "header must have the brand link");

  const nav = header.querySelector("nav.site-nav");
  assert.ok(nav, "header must have <nav class=\"site-nav\">");

  const topLevelLabels = Array.from(nav.querySelectorAll(":scope > a, :scope > .nav-item > a"))
    .map((a) => a.textContent.trim());
  for (const expected of NAV_ITEMS) {
    assert.ok(topLevelLabels.includes(expected), `nav must include "${expected}", got [${topLevelLabels.join(", ")}]`);
  }

  const current = nav.querySelectorAll("a.is-current");
  if (currentLabel === null) {
    assert.equal(current.length, 0, `expected no nav item marked current, found "${current[0]?.textContent.trim()}"`);
  } else {
    assert.equal(current.length, 1, `expected exactly one nav item marked current for "${currentLabel}"`);
    assert.equal(current[0].textContent.trim(), currentLabel);
  }

  // Use Cases / Resources dropdowns: chevron + one icon per link, per the
  // nav-icons pass — regression guard for that change specifically.
  const dropdownItems = nav.querySelectorAll(".nav-item");
  assert.equal(dropdownItems.length, 2, "expected exactly 2 dropdown-bearing nav items (Use Cases, Resources)");
  for (const item of dropdownItems) {
    const chevron = item.querySelector(":scope > a > svg.nav-chevron");
    assert.ok(chevron, `${item.textContent.trim().slice(0, 20)} nav item must have a .nav-chevron`);
    const links = item.querySelectorAll(".nav-dropdown a");
    assert.ok(links.length > 0, "dropdown must have at least one link");
    for (const link of links) {
      const icon = link.querySelector("svg.nav-dropdown-icon");
      assert.ok(icon, `dropdown link "${link.textContent.trim()}" must have a .nav-dropdown-icon`);
    }
  }

  const cta = header.querySelector("a.nav-cta");
  assert.ok(cta, "header must have the nav-cta button");
  assert.equal(cta.textContent.trim(), "Sign In");
}

export function assertFooter(document) {
  const footer = document.querySelector("footer.site-footer");
  assert.ok(footer, "page must have <footer class=\"site-footer\">");

  const columnLabels = Array.from(footer.querySelectorAll(".footer-label")).map((el) => el.textContent.trim());
  for (const expected of ["Platform", "Company", "Contact"]) {
    assert.ok(columnLabels.includes(expected), `footer must have a "${expected}" column`);
  }

  const copyright = footer.querySelector(".footer-bottom p");
  assert.ok(copyright && copyright.textContent.includes("RackTrack"), "footer must have a copyright line");
}

export function assertImagesHaveAlt(document) {
  const imgs = document.querySelectorAll("img");
  for (const img of imgs) {
    assert.ok(img.hasAttribute("alt"), `<img src="${img.getAttribute("src")}"> is missing an alt attribute`);
  }
}

// Walks every local href/src on the page and confirms the target file
// exists on disk. Skips external links, mailto:, tel:, and #fragment-only
// links. This replaces the one-off manual link-audit script from earlier
// sessions with a permanent, automated regression test.
export function assertLocalLinksResolve(document, relPath) {
  const dir = pageDir(relPath);
  const refs = [];
  document.querySelectorAll("[href]").forEach((el) => refs.push(el.getAttribute("href")));
  document.querySelectorAll("[src]").forEach((el) => refs.push(el.getAttribute("src")));

  for (const ref of refs) {
    if (!ref) continue;
    if (/^(https?:)?\/\//.test(ref)) continue; // external
    if (ref.startsWith("mailto:") || ref.startsWith("tel:")) continue;
    if (ref.startsWith("#")) continue; // same-page anchor
    if (ref.startsWith("javascript:")) continue;

    const [filePart] = ref.split("#"); // strip trailing #anchor, keep query
    if (!filePart) continue; // was purely a #fragment on a different form
    const [pathPart] = filePart.split("?"); // strip cache-busting query string
    const resolved = path.resolve(dir, decodeURIComponent(pathPart));
    assert.ok(fs.existsSync(resolved), `broken local reference "${ref}" (resolved to ${resolved})`);
  }
}

// Asserts <main>'s direct children match the page's known top-level
// sections exactly (tag + first class), order-insensitive. Catches a
// section silently added or removed.
export function assertTopLevelSections(document, expected) {
  const main = document.querySelector("main");
  assert.ok(main, "page must have a <main>");
  const actual = Array.from(main.children).map((el) => {
    const cls = el.classList[0] ? "." + el.classList[0] : "";
    return el.tagName.toLowerCase() + cls;
  });
  assert.deepEqual(
    actual.sort(),
    [...expected].sort(),
    `top-level sections of <main> changed.\n  expected: ${expected.join(", ")}\n  actual:   ${actual.join(", ")}`
  );
}

export function assertCacheBustedStylesheet(document) {
  const link = document.querySelector('link[rel="stylesheet"][href*="styles.css"]');
  assert.ok(link, "page must load styles.css");
  assert.ok(/\?v=/.test(link.getAttribute("href")), "styles.css link must carry a ?v= cache-busting query string");
}
