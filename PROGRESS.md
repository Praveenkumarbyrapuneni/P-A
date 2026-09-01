# RackTrack site review — progress

Tracking against the 27 numbered items in `RackTrackWebsiteSuggestions 2.docx` (client team's review). Working through it page by page per the agreed rollout order, not all at once. Images are explicitly out of scope everywhere — the client's team is regenerating those separately.

**Status: 3 of 27 done.** Rollout order: Site-wide → Home → Why RackTrack → Solutions → Use Cases → Trust & Security → Contact.

## Done

- [x] **01 — Navbar.** Use Cases/Resources dropdowns responded only sometimes on click. Root cause: the hover-triggered dropdown had a gap between the nav link and the menu panel that broke the `:hover` chain mid-move. Fixed with a CSS-only hover bridge scoped exactly to each trigger's own width (an earlier attempt sized it to the dropdown's wider footprint instead, which caused a follow-on bug — hovering *neighboring* links like Why RackTrack/Solutions would falsely pop open Use Cases' menu; caught and fixed same session).
- [x] **02 — Navbar.** Nav now stays fixed while scrolling instead of only living at the top of the page.
- [x] **03 — Footer.** Social icons added (LinkedIn/Instagram/Facebook) — the real profile URLs were already wired in as plain text links, just swapped for icon markup.

## Known open bug (not in the original 27, found while fixing the above)

- On the 6 `use-case-*.html` detail pages only (confirmed not present elsewhere), "Use Cases" and "Resources" render on a visually lower row than the other four nav links. Root cause not yet found — doesn't match any `flex-wrap`/positioning rule in `styles.css` under static review. Waiting on a DOM inspection dump from the user to pin it down before touching any CSS for it.

## Not started (24 items)

**Site-wide** (deferred — turned out to be several different per-page instances, not one global switch): 04 section-title consistency, 05 alignment/spacing system, 06 em-dash copy cleanup, 08 CTA style/height unification, 09 heading alignment, 10 grid-pattern backgrounds, 11 font drift.

**Home:** 12 section gaps too large, 13 hero metrics reposition, 14 missing CTA, 15 dark field-comparison band.

**Why RackTrack:** 16 hero caption lines, 17 hero right-side visual, 18 step images too similar, 19 before/after slider double-bar, 20 evidence copy layout, 21 CTA height, 22 evidence section length.

**Solutions:** 23 "ONE SWEEP" hero card.

**Use Cases:** 24 team grid → stacked layout, 25 six subpages full buildout (styles/layout/content/images, racktrack.ai-level).

**Trust & Security:** 26 deployment-selector scroll state bug.

**Contact:** 27 hero graphic.

**Also deferred sitewide, by explicit instruction:** every "reselect the image" note (part of themes 2 and 07) — the client's team is generating new images separately, not in scope here.
