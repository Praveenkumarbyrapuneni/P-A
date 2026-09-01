# RackTrack site review — progress

Tracking against the 27 numbered items in `RackTrackWebsiteSuggestions 2.docx` (client team's review). Working through it page by page per the agreed rollout order, not all at once. Images are explicitly out of scope everywhere — the client's team is regenerating those separately.

**Status: 3 of 27 done.** Rollout order: Site-wide → Home → Why RackTrack → Solutions → Use Cases → Trust & Security → Contact.

## Done

- [x] **01 — Navbar.** Use Cases/Resources dropdowns responded only sometimes on click. Root cause: the hover-triggered dropdown had a gap between the nav link and the menu panel that broke the `:hover` chain mid-move. Fixed with a CSS-only hover bridge scoped exactly to each trigger's own width (an earlier attempt sized it to the dropdown's wider footprint instead, which caused a follow-on bug — hovering *neighboring* links like Why RackTrack/Solutions would falsely pop open Use Cases' menu; caught and fixed same session).
- [x] **02 — Navbar.** Nav now stays fixed while scrolling instead of only living at the top of the page.
- [x] **03 — Footer.** Social icons added (LinkedIn/Instagram/Facebook) — the real profile URLs were already wired in as plain text links, just swapped for icon markup.
- [x] **Known open bug (not in the original 27).** "Use Cases"/"Resources" rendering on a lower row than the other nav links on all `*-page.html` pages that use the shared header (not just the 6 use-case pages — confirmed on the M&A migration page). The earlier "no longer reproduces" note here was wrong — it was never actually re-tested in a browser, just assumed fixed as a side effect of the nav pass. Real root cause, found by rendering in headless Chromium and diffing computed styles: `.site-nav` is `display:flex` with the browser default `align-items: stretch`, so direct `<a>` children stretch to the row's full height for free — but Use Cases/Resources are wrapped in `.nav-item` divs, and the `<a>` *inside* that div is one level too deep to inherit the stretch, so it stayed at its tiny intrinsic line height and sank to the bottom of the now-taller `.nav-item` box next to the plain links. Fixed with `.nav-item > a { display: flex; align-items: center; height: 100% }` in `styles.css`, verified with real Playwright renders (bounding rects + screenshot) before and after, not just a source read. Also gave the M&A migration page's hero a matching fix: it was the only `case-hero-*` variant with a big empty gap on the right, because it inherits the shared `min-height: 92dvh` from the 2-column hero layout but drops to 1 column (for its full-width before/after image strip below) without anything to fill that height. Scoped `min-height: 0; row-gap: 56px; align-items: start` to `.case-hero-migration` only — other 5 use-case pages untouched.

## Not started (24 items)

**Site-wide** (deferred — turned out to be several different per-page instances, not one global switch): 04 section-title consistency, 05 alignment/spacing system, 06 em-dash copy cleanup, 08 CTA style/height unification, 09 heading alignment, 10 grid-pattern backgrounds, 11 font drift (found and fixed one confirmed instance: `.case-page[data-scene="baseline"]` in `styles.css` was dead CSS for a `.case-scene` widget no longer in any of the 6 use-case pages' HTML — `data-scene` lives on `<body>` instead, so the selector matched `<body>` directly and its `font:` shorthand silently set the whole M&A migration page to monospace, since it was the only one of the 6 `data-scene` variants whose dead rule happened to include a `font:` property. Rescoped to `.case-scene` instead of deleted, in case that widget comes back. The other 5 use-case pages leak the same dead rule onto `<body>` but harmlessly — worth a quick check if any other page turns up looking off.).

**Home:** 12 section gaps too large, 13 hero metrics reposition, 14 missing CTA, 15 dark field-comparison band.

**Why RackTrack:** 16 hero caption lines, 17 hero right-side visual, 18 step images too similar, 19 before/after slider double-bar, 20 evidence copy layout, 21 CTA height, 22 evidence section length.

**Solutions:** 23 "ONE SWEEP" hero card.

**Use Cases:** 24 team grid → stacked layout, 25 six subpages full buildout (styles/layout/content/images, racktrack.ai-level).

**Trust & Security:** 26 deployment-selector scroll state bug.

**Contact:** 27 hero graphic.

**Also deferred sitewide, by explicit instruction:** every "reselect the image" note (part of themes 2 and 07) — the client's team is generating new images separately, not in scope here.
