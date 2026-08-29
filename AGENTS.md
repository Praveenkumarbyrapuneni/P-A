# RackTrack Rewrite Direction

## Current Phase

We are rebuilding RackTrack page by page inside this `P-A` folder, entirely on `main` now.

**Chapters 1-3, the continuous-world rack story (4-8), the floor-plan proof-tour walkthrough, the site footer, the Why RackTrack page, and the Contact page are built on `main`.** `feat/continuous-world` is stale and nothing lives only on it. `.worktrees/legacy-sections-port` (branch `worktree-legacy-sections-port`) is also stale and should not be used for new work. Chapter 9 (Final CTA) is the only homepage piece **not yet built** — static bookend reusing the hero image, same pattern as Chapter 1, no video needed.

**Live deployment:** the site is deployed via AWS Amplify Hosting, connected to the private GitHub repo `Praveenkumarbyrapuneni/P-A`, auto-building on every push to `main`. Amplify app details: app id `d1qibxn0njvfa1`, URL `https://main.d1qibxn0njvfa1.amplifyapp.com`, AWS account `984126996103` ("Vsoln" — this is Praveen's **personal** AWS account, not a client account, see `[[reference_vsoln_aws_account]]` in memory). Build settings: no build command (static site), output directory `/`. `enableAutoBuild` had to be manually turned on after the first console-connected deploy — it defaulted off, so the merge didn't auto-deploy until that was fixed and a manual `start-job` was triggered.

**Caching (fixed, app-level, not in the repo):** the app had zero custom cache headers configured, so CloudFront applied its default caching to every file including `index.html` — teammates were seeing stale versions after pushes. Fixed via `aws amplify update-app --app-id d1qibxn0njvfa1 --custom-headers '{"customHeaders":[{"pattern":"**/*","headers":[{"key":"Cache-Control","value":"no-cache, no-store, must-revalidate"}]}]}' --profile personal --region us-east-1`, then a manual `start-job` (RELEASE) to force CloudFront to drop what it already had cached — the header change alone doesn't retroactively invalidate existing edge caches. This is intentionally aggressive (every file revalidates on every load, not just HTML) because the site is still under active iteration and correctness matters more than speed right now. Revisit before a real launch: keep `no-cache` on `index.html` only, let static assets (images, `*-frames-webp/`) cache normally with a real `max-age`.

The existing `/Users/praveen/Desktop/Racktrack_Website` folder is the content and business reference only (real copy, claims, and a few directly-reusable light-palette images have come from its `docs/RackTrack-Website-Content.md` and `assets/` folder). Use its data and claims, but build the new experience here.

## New Page Experiences

## Non-negotiable page-design direction

Each top-level RackTrack page must be a deliberately different, premium interaction concept — not a reskin of the legacy Racktrack_Website pages and not a repeated card-grid template. Keep the established RackTrack palette and type system, but make full use of the viewport, whitespace, editorial scale, visual depth, and purposeful scroll or direct-manipulation interactions. The approved Solutions page must not be visually or functionally changed unless explicitly requested. Why RackTrack, Solutions, and Use Cases must use the same active navigation treatment: dark active label plus the royal-blue underline. When a new page needs a concept, first invent one from its actual content; if that does not produce a strong answer, research award-winning 3D/scroll-interactive work for craft inspiration only, never copy a reference site. On mobile, replace desktop pinned/scroll effects with composed static stacked content rather than compressing the desktop layout.

**Hard rule — no repeated card styles.** Every individual card/panel/tile built for this site must use a visual style (layout structure, color treatment, border/shadow language, symbol/iconography) that is not already used by another card anywhere else in this repo or in the legacy `/Users/praveen/Desktop/Racktrack_Website` reference folder. Before styling any card, scan the project for existing card patterns (the plain white-border-shadow box is the current default — already used by `.original-schematic`, `.hero-rail`, process-station media, principle rows, evidence cards, etc. — do not add another one) and invent a genuinely different treatment: different structure (ledger rows vs. grid vs. stacked plate), different value (dark plate vs. light glass vs. outline-only), different symbol system (numerals vs. icons vs. brackets vs. tags) — draw on award-winning card/UI design (Dribbble, Awwwards, etc.) for craft inspiration, never by copying a reference site verbatim. If the user rejects a style, invent a different one on the next attempt rather than iterating variations of the same style.

Every non-homepage page must be understandable to a first-time visitor with no server or data-center background. Start from plain language before technical detail: what problem the person has, what RackTrack captures, what it checks, what the user sees, and what decision becomes easier. Avoid abstract-only phrases like "physical signal" or "decision-ready record" unless the page immediately explains them in ordinary words. Do not let interaction or visual polish hide the explanation; the visitor should be able to follow the page slowly without getting bored, lost, or forced to decode jargon.

`why-racktrack.html`, `solutions.html`, and `contact.html` are local, static-site routes in this repository. They do not link to the Desktop source folder or external image URLs.

- **Why RackTrack:** a full-width light infrastructure field with the three-layer message (Perceive, Reconcile, Cognize), interactive `01 / 03` verification controls, generated local rack imagery, proof statements, and sticky evidence cards.
- **Contact:** a full-width contact experience with an animated canvas reconciliation field, pointer response, scan replay control, contact details, platform-brief form, email handoff, and FAQ accordions.
- **Solutions:** a full-width technical field guide with the original local system schematic artwork, interactive cabinet-reading controls, three principles, and six intelligence surfaces backed by local assets.
- **Page scripts:** `why-racktrack.js` handles the verification manifest; `solutions.js` handles cabinet reading state and section reveals; `contact.js` handles form validation/email preparation and the animated network field.
- **Generated and local page assets:** active Why RackTrack visuals live in `assets/why-racktrack/`. Solutions assets live in `assets/solutions/`, including the original system schematic and cabinet-reader stylesheet, with the local cabinet backplate at `assets/media-rack3d-cabinet-face.jpg`. The original user-provided upload folder is retained at `why-rack-track-assets/` for provenance; live pages do not depend on the Desktop source folder.
- **Primary CTA routes:** homepage and Why RackTrack demo CTAs route to `contact.html`; local footer and navigation links use repository-relative paths.

## Continuous-World Rebuild (accepted, merged to `main`)

Historical note, kept for the two lessons still worth knowing — full narrative was here before this rewrite, see git history (`3e40a06` "session close-out") if the blow-by-blow is ever needed.

- `main`'s original Chapters 4-8 (`split-story`, five separate pinned sections) felt disconnected — blank/dead-air gaps at every handoff seam. Rebuilt as **one** continuous `<section class="world-story" data-world>` driven by a single scroll-progress value; `world-timeline.js` (pure, node-tested in `tests/world-timeline.test.mjs`) computes a crossfade draw plan across all five frame sequences so there's never a blank frame at a beat boundary.
- A Three.js "living layer" (3D rack texture, camera pull-back, HUD overlay with a scan beam) was built then **fully reverted** — user's verdict: "dirty," missed the point. Three.js/WebGL is not part of the current direction; don't reintroduce a frame overlay without asking first.
- **General lesson for any pinned/sticky scroll section:** anchor content must be visible the instant the section is on screen — only fade content OUT at handoffs, never IN on entry, or you get a blank gap. This exact bug recurred at three different seams before it was recognized as one pattern (scan→bridge, world-story beat boundaries, and see the mobile section below for its cousin bug on the *outer* section height).

Ambient particle field (`createParticles()` in `main.js`, drifting scan-blue motes over `.world-particles`) was **removed entirely** in a later session (not this one) — don't reintroduce it without asking.

**Critical workflow rule, still in force:** do **not** use claude-in-chrome (or Playwright) to self-verify visual changes on this site. Make the change, describe exactly what to look at, and wait for the user to check and report back. One narrow exception happened this session: opening a *different* site (meter.com) purely to study a mobile design pattern, on explicit request — that was a one-off grant, not standing permission. See `[[feedback_no_browser_automation]]` in memory.

## Use Cases page (current state, mid-iteration)

`use-cases.html` is live and structurally complete, but was rebuilt piece-by-piece this session based on direct user feedback after each screenshot — read this before touching it again so the next session doesn't re-guess which part is under discussion.

- **Hero (`.uc-opening`):** full-bleed background photo (`assets/use-cases/media-hall-aisle-rows.jpg`) with a dark scrim, headline + eyebrow + paragraph centered on top (same recipe as the homepage hero — text is white/scan-blue on the dark photo, not ink-on-white). Six small pulsing tag chips (`.uc-opening-tag`, driven by `--x`/`--y` inline custom properties) are scattered over the photo naming the six roles (Leaders/Network/Security/Compliance/Incident/Migration) — this foreshadows the filmstrip below instead of making the visitor scroll to discover the page's point. A prior version had text pinned to the left half next to a separate boxed photo on the right — user explicitly rejected that as "tilted"/unbalanced; do not revert to a split hero layout without asking again.
- **`.uc-fanout` (replaces the old `.uc-brief` text intro + `.uc-simple-flow` 3-box Capture/Verify/Use grid):** one SVG diagram — a single "ONE SWEEP" node branching into six lines ending at the six role labels, in the same order as the filmstrip below. The old 3-box grid was deleted because its copy (Capture → Verify → Use) nearly duplicated Solutions' hero-rail (Capture → Check → Use) almost word for word — a real repeated-content problem, not just a style one.
- **`.uc-filmstrip` (id `role-navigator`, third section):** a horizontal drag-to-scroll filmstrip of six photo cards (one per role), each with a plain first-person quote, one plain sentence, and a "See their case" link to that role's `use-case-*.html` page. Replaced an earlier 660dvh sticky-pin tab switcher (click a role name, page jump-scrolls to a computed offset, dense "Physical question / Evidence returned" definition lists per role) — user found that version confusing/disconnected. The user said to leave this section alone — don't redesign it again without a fresh explicit ask, even if iterating on the sections above/below it. **Bug fixed this session:** the drag-to-scroll used `track.setPointerCapture(event.pointerId)` on every pointerdown, which re-targets the eventual pointerup/click to the track element instead of whatever link the cursor was over — this silently ate every "See their case" click, not just after an actual drag. Fixed in `use-cases.js` by tracking the drag via `window`-level pointermove/pointerup listeners instead of pointer capture. If a future rewrite of this section reintroduces drag-to-scroll, do not use `setPointerCapture` for that reason.
- **Six detail pages (`use-case-*.html`):** each now has a genuinely different hero design tied to that role's actual problem, not a shared template with a color swap — see AGENTS.md's "Hard rule — no repeated card styles" above, now applied at the page level too. Leaders: proof numbers (`.case-hero-stats`) inline with the headline, photo in a small contained frame. Network: light blueprint hero (`.case-hero-network`, grid-paper background) with a real port/switch line diagram (`.case-hero-diagram`, plain SVG, no photo) — currently sized `min(100%, 560px)` with normal-weight (400) mono labels, both bumped up from the initial build per explicit feedback. Security: a cursor-following spotlight reveal (`.case-hero-frame-spotlight` + `.case-spotlight-mask`, driven by a small inline `<script>` per page) contained inside a bordered photo frame — the reveal effect itself is dark, but the section/page background stays light. Compliance: a rotated "VERIFIED" stamp badge (`.case-stamp`, verified-green — a real semantic use since the page is literally about verification) overlapping the evidence photo. Incident: an amber pulsing "live incident" badge (`.case-alert-badge`/`.case-alert-dot` — real warning-state semantic, not decoration) on a light hero. Migration: a static side-by-side inherited (desaturated) vs. verified (full color) split (`.case-split`) — deliberately not a slider, since Why RackTrack already owns that drag-to-compare mechanic. **Network, Security, and Incident were originally built with dark (`--ink`) hero backgrounds and were reverted to light per the standing "no black/very dark background as a dominant theme" rule above (missed on first pass) — do not reintroduce a dark dominant background on any of these three without asking.** Below the hero, structure is unchanged: plain-English explainer, before/during/after story (now paired with a real photo per role — each role had a third `assets/use-case-details/` image sitting unused; wired those in), evidence, decision, metrics, CTA, footer. `use-case-detail.js` in the repo root is dead code (not linked from any page, an abandoned data-driven templating approach) — flagged to the user, not deleted, since it wasn't this session's file to remove unasked. `.case-method`/`.case-band`/`.case-impact` (also dead, same origin) were removed this session after discovering they carried `[data-case="X"] .case-hero{background:...}` overrides that were NOT dead — an attribute-selector + class beats a single class regardless of source order, so they were silently winning over the new hero backgrounds. Lesson: before leaving dead-looking CSS in place "for later," check whether any of its selectors still match a live class on the element, not just whether the code path that generated the element is dead.
- **Color-token cleanup:** the six detail pages' shared CSS (`.case-page` block, `.case-story`, `.case-metrics`, etc.) had drifted onto one-off hex blues instead of the fixed palette (`--blue`/`--scan`/`--royal`/`--ink`/`--cloud`/`--mist`/`--muted`/`--white`). Remapped throughout — if a new color shows up in a `.case-page` rule, it should be one of these tokens, not a new hex.
- **Iteration pattern to watch for:** this page has been redesigned in narrow slices across several turns because early feedback ("this section isn't good") was mis-scoped to the wrong section more than once. When the user flags a specific screenshot, confirm which literal section it is before rewriting adjacent ones — don't assume "redesign the page" means every section unless they say so.

## Site-wide footer (standardized this session)

Every page's footer now inherits one light look from the base `.site-footer`/`.footer-*` rules — background `var(--cloud)` (`#f7faff`), body/link text `#30445d`, footer-label `var(--blue)`, hover `var(--ink)`, hairline borders `rgba(16,32,51,.15)`. This exactly matches what Why RackTrack, Solutions, and Contact already had as page-specific overrides (their overrides are now redundant duplicates — harmless, not cleaned up, low priority). The gap this fixed: the homepage, `use-cases.html`, and all six `use-case-*.html` pages had **no** footer override at all, so they were silently still rendering the old dark-ink footer while the other three pages were light. Also fixed a real legibility bug found in the process: none of the three existing page overrides included `.footer-bottom p` (the copyright line), so on all three light-footer pages that line was rendering in a near-white color left over from the dark-theme default — nearly invisible on a light background. If a future page needs a footer that intentionally differs from this, override `.site-footer`/`.footer-*` scoped to that page's body class rather than touching the shared base rule.

## Solutions CTA (fixed this session)

`.solutions-cta` ("Request a platform brief," just above the footer) already had the correct full-bleed blue background (`#dfeafa` — same value used by Why RackTrack's `.why-cta`), but the section also carried the generic `.section-frame` utility class, which caps width to 1440px and centers it — so the color was boxed into a contained rectangle instead of bleeding edge-to-edge like Why RackTrack's version. Fixed by removing `section-frame` from that one section's class list in `solutions.html` (copy/text untouched). If any other full-bleed-background section on Solutions looks boxed, check for the same `section-frame` class before assuming a CSS rewrite is needed.

## Use-case detail pages' shared CTA and heading font (fixed this session)

`.case-cta` ("Get a demo," shared by all six `use-case-*.html` pages, just above the footer) had `background: var(--ink)` — the same dark-background rule violation already fixed on the hero sections, just missed on this shared section. Changed to the same light `#dfeafa` blue used by Solutions/Why RackTrack's CTAs, text to `var(--ink)`, button to blue-on-white. Since `.case-cta` sits nested inside `.case-article` (width-capped at 1180px, unlike Solutions' CTA which is a direct child of `<main>`), it needed the full-bleed breakout technique (`margin-inline: calc(50% - 50vw); width: 100vw;`) rather than just removing a class — check for this pattern (already used elsewhere in this codebase) before assuming any width-capped section can't go full-bleed.

Separately: none of the four shared `<h2>` rules on these six pages (`.case-simple h2`, `.case-intro h2`/`.case-proof h2`, `.case-evidence h2`/`.case-decision h2`, `.case-cta h2`) ever declared `font-family` explicitly, so they were silently falling back to the body's `--font-ui` stack (Satoshi-first) instead of `--font-display` (Geist-first) used by every `<h1>` and headline elsewhere on the site — both stacks list the same fonts in different priority order, so this read as a subtle but real typeface mismatch rather than a totally different font. Fixed on all four. If a new heading is added to a `.case-page`, give it an explicit `font-family: var(--font-display)` rather than assuming it inherits correctly — it won't.

## Build Progress (current `main`)

Actual section order in `index.html`: `.hero-shell` → scan (`data-frame-sequence`) → `.story-bridge` → `.world-story` → `.proof-tour` → `.site-footer`. No Chapter 9 section exists yet.

| # | Chapter | Status |
|---|---|---|
| 1 | Hero | Built & accepted. Two scroll beats over one pinned photo (`.hero-media`, `position: fixed` on desktop): `.hero-beat-primary` (headline, no trailing periods, CTA, proof stats) then `.hero-beat-about` ("What RackTrack Is" + the capture-to-structured-record SVG panel, no connector dots). |
| 2 | The Scan | Built & accepted. Full-bleed 240-frame scroll sequence, `assets/phone-scan-2-frames-webp/`. Note labels are plain text now ("Captured", not "01 — Captured"). |
| 3 | Post-Scan Bridge | Built & accepted. Three evidence cards. |
| 4-8 | Rack story (Perceive → Outcomes) | Built & accepted, merged to `main`. One continuous `.world-story` section — see "Continuous-World Rebuild" above. Note labels are plain text now too. |
| — | Floor-plan proof tour | Built & accepted. `.proof-tour` — see "Proof Tour" section below. |
| 9 | Final CTA | **Not built.** Next real work item. No video needed — reuse `assets/Verified Rack Object.jpeg`, static like the hero, CTA as live HTML/CSS. |
| — | Why RackTrack | Built. `why-racktrack.html` uses local generated imagery, a three-layer explanation, interactive verification steps, and sticky evidence cards. |
| — | Solutions | Built. `solutions.html` uses the original local schematic artwork, original cabinet-reader movement and interactions, local assets, and the six intelligence surfaces. Hero-rail card (top-right of the hero) rebuilt as a dark "manifest plate" — see "Hard rule — no repeated card styles" above. System schematic (Sheet 02) narrowed from 1560px to 1360px to match Sheet 01/03 scale. |
| — | Use Cases | Built and actively being iterated — see "Use Cases page" section below for current state and open items. `use-cases.html` links out to six standalone detail pages (`use-case-*.html`), all built. |
| — | Contact | Built. `contact.html` uses local assets, a canvas reconciliation scene, validated brief request form, direct contact details, and FAQ content. |
| — | Footer | Built & accepted. `.site-footer` — see "Footer & Header Logo" section below. |

Chapter-by-chapter narrative detail, real copy sources, and full asset briefs (start/end frame + Flow prompt) for every chapter live in `docs/03-homepage-storyboard.md` — that file is the single source of truth for chapter content, keep it that way rather than duplicating chapter descriptions here. Note: the storyboard doc still describes Ch4-8 in the old five-section framing — treat "Continuous-World Rebuild" above as authoritative for how they're actually implemented; only the narrative/copy/asset-brief content in the storyboard doc is still current.

## Site Architecture (as actually built)

**Hero, Scan, Bridge:** unchanged in structure from earlier sessions — Hero and Scan are standalone; Bridge is `.story-bridge` / `.bridge-pin`.

**Rack story (world-story):** ONE `<section class="world-story" data-world>` → `.world-pin` (sticky, full-bleed) containing `.world-scrim` (legibility wash), `.world-visual` (absolute, inset:0 — the frame canvas, full-bleed), and `.world-narrative` (absolute overlay, five `.world-beat[data-beat]` groups each with `.world-note[data-note][data-at]` articles, plus a `.world-beat-poster` static `<img>` per beat used only on mobile — see Mobile section). `world-timeline.js` (`resolveWorld`, `buildBoundaries`, pure functions, node-tested) computes which frame(s) to composite and at what crossfade alpha for a single 0-1 `worldProgress`; `createWorld()` in `main.js` draws that plan to the on-page canvas every frame. `.world-particles` (ambient canvas) no longer exists — removed in a later session.

**Proof tour:** `<section class="proof-tour" data-proof-tour>` → `.app-frame` (browser-chrome mockup: `.app-bar` with crumbs/count, `.tour-stage` with 6 `.tour-view[data-view]` SVGs — ported byte-for-byte from the old site's source with colors substituted to our CSS variables — `.tour-point` mascot+callout overlay positioned per step via `--point-x`/`--point-y` custom properties read from each SVG's own highlight-box coordinates). `initProofTour()` in `main.js` drives Prev/Next, crumb, counter, and pointer position. Real per-step tooltip text and end-of-tour Next-disable are a genuine fix over the old site's version, which had these as dead/unwired markup — don't assume "ported from the old site" means "fully working," verify the JS wiring.

**Footer & header logo:** `.site-footer` — Platform/Company/Contact columns use repository-relative links for the built pages and mail/telephone links for direct contact. `assets/logo.jpg` (white R on black) renders through the existing mask treatment so no square is visible. The removed `assets/RackTrack-Logo.jpg` reference is not part of the live site.

**Header top nav:** `.site-header` is a 3-column grid (brand | centered `.site-nav` | CTA). Nav picks 4 of the old site's 8 items for investor priority — Why RackTrack, Solutions, Use Cases, Trust & Security — with local section/page targets. The CTA routes to `contact.html`. Resources/About Us remain footer links. Nav drops entirely on mobile (`max-width: 980px`) — no hamburger menu built, a real gap if mobile nav access is ever asked for.

**JS (`main.js`), general:** `createPinnedSequence` (the old per-chapter factory) exists only in git history, not live code. The phone-scan section (Chapter 2) is a separate, older, unrelated code path (dense 240-frame hard-snap, no blending) — intentionally untouched. `main.js`/`styles.css` have occasionally been edited outside this conversation (another session, or a linter) between turns — always `git diff` before committing to see what actually changed, don't blindly assume only your own edits are present.

## Mobile Responsive Pattern (established this session)

Desktop sections use `position: sticky` pins driven by scroll-scrubbed canvas or absolutely-positioned overlapping cards. These do **not** compress gracefully into a phone viewport — the fix is never "shrink the effect," it's replacing it with plain static stacked content for `max-width: 980px` (or `900px` for proof-tour, `640px` for the smallest phones): pin becomes `position: static`, content that faded in via scroll becomes always-visible, image/canvas becomes one static `<img>` on top with text stacked below.

Two gotchas that cost real debugging time, worth checking every time this pattern is applied to a new section:

1. **Outer wrapper height.** The `-pin` element is only half the story — the outer `<section>` around it usually carries its own huge `min-height` (`.sequence-story` 500dvh, `.world-story` 1300dvh, `.story-bridge` 145dvh — all sized for desktop scroll distance). Fixing only the inner pin leaves a huge blank gap; both need `min-height: auto` on mobile.
2. **`.is-ready`/`.is-active` opacity traps.** JS toggles classes like `.section.is-ready .child { opacity: 0 }` — a 2-class selector that beats a 1-class mobile override regardless of media query or source order (specificity, not order, decides which rule wins). If a static mobile fallback image was also a JS-driven fade target on desktop (e.g. `.sequence-poster` faded out once the canvas took over), its mobile override needs `opacity: 1 !important` or it silently stays invisible.

Also: a sequence's frame-1/first-image is often a poor static poster for an animated reveal — it may show the intentional "before" composition (half-empty frame, subject off to one side). Check the actual image before using it as a permanent mobile fallback, not just trusting its desktop role as a brief loading placeholder (`.sequence-poster` was switched from `frame-0001.webp` to `frame-0120.webp` for exactly this reason).

Floor-plan SVGs in proof-tour deliberately **shrink to fit** on mobile (`width: 100%`, inherited from the base `.tour-stage svg` rule) rather than requiring horizontal scroll — an earlier `min-width: 760px` + scroll approach was tried and reverted per feedback; small illegible labels + pinch-zoom beat a scrolling diagram.

## Known bugs fixed this build (context for next session)

- **Story-bridge first card disappearing on scroll** (Chapter 3): `.evidence-card-scan` was wired to the same `--bridge-copy-opacity` CSS variable as the headline text, which explicitly fades out near the end of the section. Fixed with a dedicated `--bridge-source-opacity` variable (fades in, stays visible, like the other two cards). Pre-existing bug, not introduced this session.
- **Chapter 4 Clip 1 oscillation**: the raw generated/reversed video didn't play a clean single open motion — it oscillated (closed→explode→closed again→explode again) within its 10s, invisible to a sparse 3-point sample. Fixed by trimming to the clean 0-6.8s portion (`assets/rack-open-01.mp4`); the buggy full-length version is kept at `assets/rack-open-01-untrimmed-buggy.mp4` for reference only. **Lesson: always frame-check a full generated clip at ~1s density before trusting it, not just start/mid/end.**
- **Gemini sparkle watermark**: every Flow-generated clip so far has carried a small white 4-point sparkle mark at approximately `x:1110,y:550,w:90,h:90` in the 1280x720 frame (bottom-right-ish). Removed via `ffmpeg -vf "delogo=x=1110:y=550:w=90:h=90:show=0"` before extraction each time. Check for this on any new generated clip before extracting frames — it's easy to miss at a glance (it was first mistaken for a glass reflection).
- **Scan→Bridge blank gap** (`feat/continuous-world`, `df0693c`): same class of bug as the world-section seams — `updateStoryBridge()`'s headline/first-card opacity faded IN over 2-16% scroll progress instead of being present on entry, leaving a blank light band right after the scan animation ends. Fixed by making anchor content (headline, first card) present immediately on section entry and only fading OUT at the very end when handing off. **General lesson for any pinned/sticky scroll section: anchor content must be visible the instant the section is on screen — only fade content OUT at handoffs, never IN on entry — or you get a blank gap.**

## Superseded / unused source files (kept, not live)

`assets/v0.mp4`, `v1.mp4`, `v0-clean.mp4`, `rack-open-01-untrimmed-buggy.mp4`, `chapter4-clip2.mp4`, `chapter5.mp4` (watermarked originals — clean versions are what's actually used), `frame-1.jpg`, `frame-2.jpg`, `frame-1.1.jpeg`, `frame-2.1.jpeg` (early v1.mp4 exploration keyframes). None of these are referenced by the live site. Safe to ignore; not worth deleting unless the user asks.

## Current Local Preview

- `http://127.0.0.1:5174/`
- `http://127.0.0.1:5174/why-racktrack.html`
- `http://127.0.0.1:5174/solutions.html`
- `http://127.0.0.1:5174/contact.html`
- `http://127.0.0.1:5174/use-cases.html` — see "Use Cases page (current state, mid-iteration)" above before changing this one.
- `http://127.0.0.1:5174/use-case-infrastructure-data-center-leaders.html`, `use-case-network-architects-engineers.html`, `use-case-security-vulnerability-teams.html`, `use-case-compliance-audit-owners.html`, `use-case-incident-responders-on-call.html`, `use-case-m-a-migration-teams.html` — the six Use Cases detail pages.
- Server may not be running in a fresh session — restart with: `python3 -m http.server 5174` from the `P-A` folder.
- `feat/continuous-world` is stale/behind `main` (see "Current Phase") — stay on `main`.
- `index.html`, `why-racktrack.html`, `solutions.html`, `contact.html`, and `use-cases.html` use `?v=` cache-busting query strings on their styles/scripts; the six `use-case-*.html` pages use `?v=clarity-N` on `styles.css`. When editing those files further, bump the relevant version string (or ask the user to hard-refresh / Cmd+Shift+R) — a plain reload can silently serve stale CSS/JS and make a real change look like it did nothing.
- Live/deployed version: `https://main.d1qibxn0njvfa1.amplifyapp.com` — auto-deploys on push to `main` (see "Live deployment" above). Verifiable via `aws amplify list-jobs --app-id d1qibxn0njvfa1 --branch-name main --profile personal --region us-east-1` if you need to confirm a push actually built successfully rather than assuming.

Important user instructions:

- Do **not** use Playwright unless the user explicitly asks for it again.
- Do **not** use claude-in-chrome (or any browser-automation tool) to self-verify visual changes either — this permission was explicitly revoked this session. Make the change, tell the user exactly what to look at, and wait for them to check the local preview themselves. See `[[feedback_no_browser_automation]]` in memory. (Researching a *different* site for design reference, on explicit request, is a separate one-off allowance — see "Continuous-World Rebuild" above.)

## Accepted First-Fold Direction

The first fold currently uses:

- light infrastructure glass palette
- `assets/Verified Rack Object.jpeg` as the hero visual
- lightweight brand and demo navigation
- no cursor/caret animation on the hero headline (removed — was a blinking-terminal-caret effect, user asked it gone)
- left-side copy and proof numbers

Accepted opening copy (no trailing periods on the headline — removed per feedback):

- Eyebrow: `Physical infrastructure intelligence for data centers`
- Headline: `One phone sweep` / `Verified rack truth`
- Supporting line: `Inventory, ports, cables, topology, and audit evidence reconciled from physical rack reality.`
- Primary CTA: `Get a demo`

The first fold should stay desktop/laptop-first. Mobile is secondary.

## Important Direction Changes

Do not revive the old direction:

- no technician/person in the hero
- no phone rising from the bottom in the first fold
- no watermarked Gemini video (always check and `delogo`-fix, per above)
- no low-resolution zooming
- no static "normal SaaS sections" as the main scroll experience
- no HUD/scanning-ray overlay drawn on top of the rack frames (tried in `feat/continuous-world`, explicitly rejected as "dirty" — see "Continuous-World Rebuild" above). If a reactive/analysis-style visual layer is wanted again, it needs a fresh direction check with the user first, not a revival of the scan-beam/port-chip HUD.
- no boxed/margined visual panel with dead space around it for the rack story — the fix in place is full-bleed (visual fills the whole viewport)

The user likes the current image quality and brand impression; the homepage experience is a high-quality motion-driven scroll story, similar in craft level to sites like Meter without copying them. Meter/Igloo-style "aliveness" was clarified this session to mean: the whole screen is used (no empty space, no small boxed content in a sea of blank background) and text has real editorial presence (large, distinctive, not a generic small left-column block) — not necessarily 3D/WebGL effects. Depth/3D is not off the table long-term, but the immediate lesson was that dead space and weak typography were the actual complaint, not "not enough animation."

Meter's *mobile* pattern was studied concretely in a later session (with explicit one-off browser research permission) and applied: static product image on top, single-column text below, generous stacking, no compressed desktop scroll effects — see "Mobile Responsive Pattern" above.

## Fixed Color Direction

Brand direction: light infrastructure glass.

- `#F7FAFF` cloud white, primary page background
- `#EEF5FF` mist blue, soft section ground
- `#D9E7F6` pale steel, borders, panels, rack overlays
- `#102033` deep ink, primary text and structural UI
- `#2457D6` verified blue, primary CTA and active accent
- `#7DBDFF` scan blue, glows, telemetry lines, 3D highlights
- `#43B883` verified green, semantic success only
- `#D99A2B` drift amber, semantic warning only
- `#FFFFFF` glass highlight and card surface

Rules:

- The site should feel light, smooth, clean, and premium.
- Do not use black or very dark backgrounds as the dominant theme.
- Do not use purple-blue AI gradients.
- Use verified blue as the main accent across the site.
- Use green and amber only for real semantic states like verified, drift, warning, or issue.

## Fixed Font Direction

Primary direction:

- Display/UI font: Satoshi if we can add or self-host it cleanly.
- Fallback display/UI font: Geist.
- Technical metadata font: Geist Mono.

Use Geist Mono for rack labels, port states, coordinates, telemetry, evidence IDs, and technical microcopy.

Rules:

- Do not use Inter as the default brand font.
- Do not use decorative serif fonts unless explicitly approved later.
- Keep typography precise, modern, and enterprise-trustworthy.

## Locked Homepage Vision

Homepage concept: From unknown rack to verified infrastructure truth.

The homepage should make an investor or buyer understand RackTrack immediately:

RackTrack scans physical data center racks with a phone and turns them into verified inventory, topology, port, cable, compliance, and operational intelligence.

Do not copy reference websites directly. Use award-winning 3D scroll sites only as inspiration for craft principles: one strong world, cinematic camera movement, scroll-driven story progression, minimal premium text, and motion that explains the business.

Full chapter-by-chapter narrative (message, visual direction, investor takeaway, real copy sources) lives in `docs/03-homepage-storyboard.md` — see that file, not this one, for chapter content detail.

## Animation And Build Direction

The pipeline used for every chapter so far (documented in full per-chapter in `docs/03-homepage-storyboard.md`):

1. **Gemini Nano Banana Pro** for still-image exploration/reference when no existing asset fits.
2. **Google Whisk** for start/end keyframes — but check `assets/` and `/Users/praveen/Desktop/Racktrack_Website/assets/` for an existing usable still first (this saved a generation step on 4 of 8 chapters so far). Racktrack_Website's `media-art-*` and dark photography assets are generally NOT usable (real photos, dark/moody, off-brand) — only its light-palette renders fit.
3. **Google Flow** for the motion video from approved start/end frames.
4. Check the generated clip for the Gemini watermark (`delogo` fix) and for oscillation/reversal artifacts (dense frame-by-frame check, not just start/mid/end) before trusting it.
5. Extract frames with `ffmpeg` (variable fps by segment — denser during fast motion, sparser during holds) at ~960x540 (half-bleed display doesn't need full source resolution), convert to WebP with `cwebp -q 82` (this machine's `ffmpeg` build lacks libwebp — `cwebp` is the working tool).
6. Wire via the shared split-layout pattern described above in Site Architecture.

For generated video beats:

- generate one chapter at a time, review before moving to the next
- keep explanatory text as editable HTML/CSS, not baked into the video
- chain chapters for continuity where it helps: chapter N's actual last extracted frame becomes chapter N+1's start-frame reference (used for 4→5→6→7→8)

Chapter 9 is next: no asset brief needed, just build the static CTA section directly (hero-style, no video).
