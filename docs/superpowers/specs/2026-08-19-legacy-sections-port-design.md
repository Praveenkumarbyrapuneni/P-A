# Porting Two Sections From the Old RackTrack Site

## Purpose

The user liked two components from the old site (`/Users/praveen/Desktop/Racktrack_Website`) exactly as they are and wants them added to the new scroll-story homepage in `P-A`, unchanged in content/behavior, placed where they're narratively relevant. No new visual generation, no restyle to the full-bleed/canvas treatment used by Chapters 4-8 — these are static/boxed sections by design, reused as a breather between the two canvas-driven segments.

## Section 1 — "What RackTrack Is"

**Source:** old `src/pages/index.html:82-102` (content also documented in `docs/RackTrack-Website-Content.md` §2.3).

**Content (locked, verbatim):**
- Eyebrow: `What RackTrack is`
- Headline: `Physical Infrastructure Intelligence - continuously reconciled across your entire footprint.`
- Body: `RackTrack combines computer vision, network telemetry, vendor data, and security intelligence into a single platform. One phone sweep produces a verified infrastructure digital twin - inventory, topology, port state, and firmware posture synced to your operational stack.`
- Pull quote (blue left border): `From physical rack perception to continuous reconciliation, RackTrack gives every team one verified source of infrastructure truth.`
- Right column: figure captioned "From capture to structured record" / "Detection → record", containing a self-contained inline SVG (no external image) showing a rack-capture panel (patch panel, switch, servers, storage array, PDU with confidence scores) connected via leader lines to a structured-record key/value table (asset_type, rack_unit, model, serial, ports_total, ports_used, link_state, firmware, cmdb_match, verified_at).

**Placement:** new `<section>` inserted in `index.html` between the hero section (`.hero-shell`, ends ~line 72) and the Scan section (starts line 73). Two-column layout (copy left, diagram right) on desktop; stacks on mobile.

**Styling:** re-implemented as plain CSS (no Tailwind) using this project's existing tokens — `#D9E7F6` pale steel for panel borders (replacing `#d3dae6`), `#2457D6` verified blue for accents (replacing `#1a3fd4`), `#102033` deep ink for primary text, Geist Mono for the SVG's technical labels (already the mono font here). The SVG markup is copied as-is (its colors are hardcoded inline as `fill`/`stroke` attributes — these get find/replaced to the brand hex values before insertion).

## Section 2 — "Five steps, from the floor plan to a verified record"

**Source:** old `src/pages/index.html:128-435` (HTML/SVG) + `src/layout/scripts.html:51-118` (JS behavior).

**Content (locked, verbatim):** 6-step interactive walkthrough inside a browser-chrome "app frame" (dots, RackTrack brand, breadcrumb path, step counter):
1. DC1 / Ground floor — full floor plan (rows A-D, electrical/UPS/battery/cooling/network/storage rooms, meet-me room), 56 cabinets, sweep coverage stat, click-to-drill callout on Row B Cabinet 06.
2. DC1 / Row B — row-level view.
3. DC1 / Row B / B-06 — cabinet elevation.
4. B-06 / U29 / Switch 3 — device/port sheet with a clickable per-port inspector (`pmap-p.live` elements; clicking a port updates a side panel with speed/vlan/neighbor/via/last-changed).
5. Trace / Eth1/14 → SPINE-02 — topology trace view.
6. Reconcile / B-06 — reconciled record view.

Each step is reachable via Next/Prev buttons, breadcrumb clicks, dot indicators, arrow keys, or by clicking hot zones directly on the drawing (`.hot[data-goto]`). An end card appears after step 6 with a CTA and a "Restart walkthrough" button.

**Placement:** new `<section>` inserted in `index.html` immediately after the World-story section (`.world-story`, ends line ~current EOF) and before Chapter 9 (not yet built — this section becomes the last built section until Ch9 lands).

**Behavior port:** the ~65-line vanilla JS state machine (`show(i)`, `pickPort(g)`, event wiring for click/keydown on `#proof-tour`) is added to `main.js` as one new self-contained init function, called unconditionally alongside existing section inits (e.g. `createWorld()`), guarded by `if (!root) return` exactly as the original does — so it's a no-op until the section markup exists and never touches world-timeline/canvas code.

**Styling:** same token remap as Section 1. The `.app-frame`/`.app-bar`/`.tour-*`/`.pmap-*` class families are ported with their original layout logic (grid/flex structure, SVG viewBoxes unchanged) but colors, fonts, and spacing scale remapped to this project's design tokens (`--` custom properties already defined in `styles.css`, per existing chapter sections).

## Out of scope

- Chapter 9 (Final CTA) — separate, already tracked work, unaffected by this change.
- No changes to World-story timeline logic, canvas rendering, or particle system.
- No new image/video assets — both sections are pure HTML/CSS/SVG/JS, ported and re-themed.
- No behavior changes to the tour (all 6 steps, port inspector, and end-card CTA ship as-is) — only visual re-theming.

## Risks / things to verify locally

- Cache-busting: bump `?v=` query strings on `styles.css`/`main.js` in `index.html` per existing project convention, or a stale cache will hide the new sections.
- The tour's port-inspector JS touches specific DOM ids (`pd-sel`, `pd-port`, etc.) and SVG structure (`#port-mark rect`) — these must be preserved exactly during the SVG copy, not regenerated, since the JS depends on exact IDs/dataset attributes.
- User verifies visually via local preview per the project's standing rule — no browser automation for self-verification.
