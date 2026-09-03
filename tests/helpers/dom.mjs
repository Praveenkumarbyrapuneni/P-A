// Shared page-loading helper for all tests/pages/*.test.mjs files.
// No real browser involved (this project's standing rule bans browser
// automation for self-verification) — jsdom parses the HTML into a real
// DOM so tests can use querySelector/querySelectorAll instead of fragile
// regex on minified single-line markup.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// relPath: repo-root-relative path, e.g. "pages/contact.html" or "index.html"
export function loadPage(relPath) {
  const absPath = path.join(ROOT, relPath);
  const html = fs.readFileSync(absPath, "utf-8");
  const dom = new JSDOM(html, { url: "http://localhost/" + relPath });
  return { document: dom.window.document, html, relPath, absPath };
}

// The directory a page's relative asset/link paths resolve against.
export function pageDir(relPath) {
  return path.dirname(path.join(ROOT, relPath));
}
