import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage } from "../helpers/dom.mjs";
import {
  assertBasicMeta, assertHeaderNav, assertFooter,
  assertImagesHaveAlt, assertLocalLinksResolve,
  assertTopLevelSections, assertCacheBustedStylesheet,
} from "../helpers/assertions.mjs";

const REL_PATH = "pages/contact.html";
const { document } = loadPage(REL_PATH);

test("contact.html: basic meta (title, description, single h1)", () => {
  assertBasicMeta(document);
});

test("contact.html: header nav, dropdown icons/chevrons, Contact Us marked current", () => {
  assertHeaderNav(document, "Contact Us");
});

test("contact.html: footer present with Platform/Company/Contact columns", () => {
  assertFooter(document);
});

test("contact.html: every image has an alt attribute", () => {
  assertImagesHaveAlt(document);
});

test("contact.html: every local href/src resolves to a real file", () => {
  assertLocalLinksResolve(document, REL_PATH);
});

test("contact.html: stylesheet is cache-busted", () => {
  assertCacheBustedStylesheet(document);
});

test("contact.html: top-level sections (hero, details, request form, faq)", () => {
  assertTopLevelSections(document, [
    "section.contact-hero",
    "section.contact-details",
    "section.contact-request",
    "section.contact-faq",
  ]);
});

test("contact.html: hero shows a real photo, not the old canvas HUD scene", () => {
  const figure = document.querySelector(".contact-hero-panel .contact-hero-image");
  assert.ok(figure, "hero panel must have .contact-hero-image");
  const img = figure.querySelector("img");
  assert.ok(img && img.getAttribute("src")?.includes("media-contact-run.jpg"));
  assert.equal(document.querySelector("[data-network-scene]"), null,
    "the old animated canvas reconciliation scene must not be present");
});

test("contact.html: platform brief form has required fields wired up", () => {
  const form = document.querySelector("#brief-request");
  assert.ok(form, "form#brief-request must exist");
  for (const name of ["fullName", "email", "mobile"]) {
    const field = form.querySelector(`[name="${name}"]`);
    assert.ok(field, `form must have a "${name}" field`);
    assert.ok(field.hasAttribute("required"), `"${name}" field must be required`);
  }
});

test("contact.html: FAQ accordions are present", () => {
  const faq = document.querySelector(".contact-faq");
  assert.ok(faq.querySelectorAll("details, .contact-faq-item").length > 0, "FAQ section must have entries");
});
