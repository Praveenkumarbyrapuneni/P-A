# Resources page — top layer (hub only)

## Scope
Build `resources.html` (+ `resources.js`, page-scoped CSS in `styles.css`) as a new top-level RackTrack page. Hub/library view only — the 9 article detail pages are a deferred future phase, not part of this build.

## Source content
Legacy reference: `/Users/praveen/Desktop/Racktrack_Website/src/pages/resources.html`. Reuse its structure (1 featured article + 8 library articles across 6 categories: Operations, Infrastructure, Strategy, Security, Compliance, Finance) but rewrite every title/summary into the plain-language, first-time-visitor tone already established on Why RackTrack/Solutions/Use Cases. No jargon left unexplained (e.g. "topology debt").

## Concept: Index-card catalog
Typography- and paper-structure-driven, not photo-driven — deliberately distinct from every existing card style on the site (photo tiles, dark manifest plate, stacked z-index cards, spotlight reveal, stamp badge, alert badge, split comparison). No thumbnail images anywhere on this page.

## Sections
1. **Hero** — light background, no photo (text-first page). Eyebrow + headline framing the page as the reasoning behind the platform, short lede.
2. **Featured entry** — one oversized "field report" card: CSS clip-path torn/perforated top edge, monospace file-stamp metadata (file no., category, read time), headline + summary, callout stat (from legacy's 40% CMDB-drift stat, rewritten) in its own stamped box.
3. **Drawer-tab filter bar** — "All" + 6 category tabs styled as library-drawer labels (not pill buttons). Clicking filters the list below by `data-category` (hide/show + live count badge) — same mechanic as legacy `resources.html`'s inline script, reskinned and moved to `resources.js`.
4. **Card catalog list** — remaining 8 articles as compact horizontal index-card strips: monospace category-code tab on the left edge (e.g. `OPS·04`), title + one-line dek, "Read →" affordance. No images.
5. **CTA** — full-bleed light `#dfeafa` band (matching the site-wide standardized CTA convention), Resources-specific copy, routes to `contact.html`.

## Links
Article links point at the legacy filenames as-is (e.g. `article-why-every-enterprise-cmdb-is-40-wrong-and-the-architecture-t.html`) so the future deep-dive phase doesn't require a rename pass.

## Out of scope
- The 9 article detail pages themselves.
- Any change to homepage, Solutions, Use Cases, Why RackTrack, Contact.
- Any dark-dominant background (standing site rule).
