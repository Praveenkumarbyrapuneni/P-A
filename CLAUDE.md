# RackTrack Rewrite Direction

## Current Phase

We are rebuilding RackTrack page by page inside this `P-A` folder.

**Chapters 1-3 are built, wired, and accepted on `main`.** Chapters 4-8 (the rack story) are mid-rebuild on branch **`feat/continuous-world`** — see "Continuous-World Rebuild" below before touching anything in that part of the page. Chapter 9 (Final CTA) is not yet built — static bookend reusing the hero image, same pattern as Chapter 1, no video needed.

The existing `/Users/praveen/Desktop/Racktrack_Website` folder is the content and business reference only (real copy, claims, and a few directly-reusable light-palette images have come from its `docs/RackTrack-Website-Content.md` and `assets/` folder). Use its data and claims, but build the new experience here.

## Continuous-World Rebuild (in progress — branch `feat/continuous-world`)

`main`'s Chapters 4-8 (the original `split-story` five-section pattern) were accepted once but the user later judged the *overall experience* disconnected — five separate pinned sections handing off to each other created blank/dead-air gaps at every seam, and the frame-scrub-only interaction never felt "alive" (see design doc for the full diagnosis). Full context, spec, and plan:

- Design doc: `docs/superpowers/specs/2026-08-19-continuous-world-homepage-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-19-continuous-world-homepage.md`

**What's actually built on the branch right now** (as of the last session, all committed, working tree clean):

1. **Batch 1 — done.** The five separate `split-story` sections (Ch4-8) were welded into **one** continuous `<section class="world-story" data-world>` driven by a single scroll-progress value. `world-timeline.js` (pure, no DOM) computes a crossfade "draw plan" across all five frame sequences so there is never a blank frame at a beat boundary — proven by node asserts in `tests/world-timeline.test.mjs` (no-blank + monotonic-beat + crossfade-at-boundary invariants). `createWorld()` in `main.js` consumes it and draws directly to the on-page canvas. The scan→bridge handoff blank gap (a same-class bug, just at a different seam) was also fixed in `updateStoryBridge()`.
2. **A Three.js "living layer" was built, then fully reverted.** Attempt: rack frame as a texture on a plane in a real 3D scene, camera pull-back/return arc, plus a reactive HUD overlay (scan beam, port-status dots, cursor focus ring) drawn ON TOP of the frames. **User's verdict: rejected — "dirty," a "blue scanning ray," missed the point entirely.** Fully reverted via `git reset --hard` to the pre-Three.js commit (`df0693c`). `world-scene.js`, `world-camera.js`, `vendor/three.module.js`, and the HUD wiring in `main.js` **no longer exist on the branch.** Three.js/WebGL is not part of the current direction — don't reintroduce a frame overlay approach without asking first.
3. **Current direction (latest commit `6a07f19`): full-bleed layout + bold typography + ambient particles — no touching the frames.** The real problems the user identified were (a) dead/empty screen space around the visual and narrative, not a lack of an overlay gimmick, and (b) generic-looking text. Fix applied:
   - `.world-visual` is now `position: absolute; inset: 0` — the frame sequence fills the *entire* viewport, no boxed panel, no margins.
   - `.world-narrative` is an absolutely-positioned overlay (left-aligned, vertically centered) directly on top of the full-bleed visual, with a `.world-scrim` gradient wash underneath it for legibility instead of a solid background panel.
   - Typography made deliberately bold/editorial: headline `clamp(42px, 5.4vw, 82px)`, tight `line-height: 0.98`, negative letter-spacing, a vertical accent rail (`.world-narrative::before`) that grows through the whole story via `--world-progress`, and a blur+rise reveal per beat instead of a plain fade/slide.
   - `.world-particles` — a canvas-based ambient field (`createParticles()` in `main.js`): drifting scan-blue motes with faint constellation links between nearby ones (network-topology nod, stays on-topic) and gentle cursor-attraction. This is deliberately **not** drawn on the rack frames — it's atmosphere in the surrounding space.
   - Reduced-motion and mobile fallbacks were updated to match (static stacked layout, particles/scrim hidden under reduced-motion).

**Not yet done / next up:** the user has not yet reviewed the full-bleed + bold-text + particles redesign (session ended right after it shipped) — **first thing next session: ask if they've looked at it and what they think** before building anything further. Batches 2-4 from the original plan (Three.js living layer, reactive geometry, Ch9 CTA) are effectively superseded by the pivot away from Three.js — don't resume them on the old plan's terms without re-confirming direction with the user first.

**Critical workflow rule for this branch, learned the hard way this session:** do **not** use claude-in-chrome (or Playwright) to self-verify visual changes. The user explicitly revoked that permission after it burned significant time on scroll-automation issues (`scroll-behavior: smooth` fights programmatic `scrollTo`) without producing useful verification. Make the change, describe exactly what to look at and where, and wait for the user to check the local preview themselves and report back. See `[[feedback_no_browser_automation]]` in memory.

## Build Progress (Chapters 1-3, 9 — stable on `main`)

| # | Chapter | Status |
|---|---|---|
| 1 | Hero | Built & accepted. Static, `assets/Verified Rack Object.jpeg`. |
| 2 | The Scan | Built & accepted. Full-bleed 240-frame scroll sequence, `assets/phone-scan-2-frames-webp/`. |
| 3 | Post-Scan Bridge | Built & accepted. "Captured facts. Ready to verify." + three tilted evidence cards. |
| 4-8 | Rack story (Perceive → Outcomes) | **Mid-rebuild on `feat/continuous-world`** — see "Continuous-World Rebuild" above. Do not treat as accepted/final; do not describe as five separate split-story chapters anymore. |
| 9 | Final CTA | **Not built.** No video needed — reuse `assets/Verified Rack Object.jpeg`, static like the hero, CTA as live HTML/CSS. |

Chapter-by-chapter narrative detail, real copy sources, and full asset briefs (start/end frame + Flow prompt) for every chapter live in `docs/03-homepage-storyboard.md` — that file is the single source of truth for chapter content, keep it that way rather than duplicating chapter descriptions here (an earlier version of this file had its own separate chapter list that drifted out of sync with the storyboard doc and caused a real contradiction bug; don't recreate that). Note: the storyboard doc still describes Ch4-8 in the old five-section framing — treat the "Continuous-World Rebuild" section above as authoritative for how they're actually implemented now; only the narrative/copy/asset-brief content in the storyboard doc is still current.

## Site Architecture (as actually built)

**Chapters 1-3 (`main` and the branch, unchanged):** Hero and Scan are standalone; Chapter 3 is `.story-bridge` / `.bridge-pin`.

**Chapters 4-8, on `feat/continuous-world` (current, post Batch 1):** ONE `<section class="world-story" data-world>` → `.world-pin` (sticky, full-bleed) containing `.world-particles` (ambient canvas), `.world-scrim` (legibility wash), `.world-visual` (absolute, inset:0 — the frame canvas, full-bleed), and `.world-narrative` (absolute overlay, five `.world-beat[data-beat]` groups each with `.world-note[data-note][data-at]` articles). `world-timeline.js` (`resolveWorld`, `buildBoundaries`, pure functions, node-tested) computes which frame(s) to composite and at what crossfade alpha for a single 0-1 `worldProgress`; `createWorld()` in `main.js` draws that plan to the on-page canvas every frame and toggles `.is-current` / `.is-active` on the matching beat/note. `data-at` on each note is a 0-1 progress threshold tied to the real clip boundary it corresponds to, not an even split.

**Chapters 4-8 on `main` (superseded, for reference only if diffing):** the old pattern was `<section class="split-story" data-X-sequence>` with five separate sticky pins and a `createPinnedSequence({root, totalFrames, framePath})` factory instantiated five times. This is what caused the blank-seam problem the rebuild fixes — don't resurrect it.

**JS (`main.js`), general:** `createPinnedSequence` (the old per-chapter factory) is retained only for reference/diff purposes in git history — it was removed from the branch's `main.js` for Chapters 4-8 usage. The phone-scan section (Chapter 2) is a separate, older, unrelated code path (dense 240-frame hard-snap, no blending) — intentionally untouched. Don't merge it into anything else unless asked.

## Known bugs fixed this build (context for next session)

- **Story-bridge first card disappearing on scroll** (Chapter 3): `.evidence-card-scan` was wired to the same `--bridge-copy-opacity` CSS variable as the headline text, which explicitly fades out near the end of the section. Fixed with a dedicated `--bridge-source-opacity` variable (fades in, stays visible, like the other two cards). Pre-existing bug, not introduced this session.
- **Chapter 4 Clip 1 oscillation**: the raw generated/reversed video didn't play a clean single open motion — it oscillated (closed→explode→closed again→explode again) within its 10s, invisible to a sparse 3-point sample. Fixed by trimming to the clean 0-6.8s portion (`assets/rack-open-01.mp4`); the buggy full-length version is kept at `assets/rack-open-01-untrimmed-buggy.mp4` for reference only. **Lesson: always frame-check a full generated clip at ~1s density before trusting it, not just start/mid/end.**
- **Gemini sparkle watermark**: every Flow-generated clip so far has carried a small white 4-point sparkle mark at approximately `x:1110,y:550,w:90,h:90` in the 1280x720 frame (bottom-right-ish). Removed via `ffmpeg -vf "delogo=x=1110:y=550:w=90:h=90:show=0"` before extraction each time. Check for this on any new generated clip before extracting frames — it's easy to miss at a glance (it was first mistaken for a glass reflection).
- **Scan→Bridge blank gap** (`feat/continuous-world`, `df0693c`): same class of bug as the world-section seams — `updateStoryBridge()`'s headline/first-card opacity faded IN over 2-16% scroll progress instead of being present on entry, leaving a blank light band right after the scan animation ends. Fixed by making anchor content (headline, first card) present immediately on section entry and only fading OUT at the very end when handing off. **General lesson for any pinned/sticky scroll section: anchor content must be visible the instant the section is on screen — only fade content OUT at handoffs, never IN on entry — or you get a blank gap.**

## Superseded / unused source files (kept, not live)

`assets/v0.mp4`, `v1.mp4`, `v0-clean.mp4`, `rack-open-01-untrimmed-buggy.mp4`, `chapter4-clip2.mp4`, `chapter5.mp4` (watermarked originals — clean versions are what's actually used), `frame-1.jpg`, `frame-2.jpg`, `frame-1.1.jpeg`, `frame-2.1.jpeg` (early v1.mp4 exploration keyframes). None of these are referenced by the live site. Safe to ignore; not worth deleting unless the user asks.

## Current Local Preview

- `http://127.0.0.1:5174/`
- Server may not be running in a fresh session — restart with: `python3 -m http.server 5174` from the `P-A` folder.
- Currently on branch `feat/continuous-world` (not `main`) — confirm with `git branch --show-current` before assuming which version of Chapters 4-8 is live.
- `index.html` uses cache-busting `?v=world-redesign-1` query strings on `styles.css` and `main.js`. When editing those files further, bump the version string (or ask the user to hard-refresh / Cmd+Shift+R) — a plain reload can silently serve stale cached JS/CSS and make a real change look like it did nothing.

Important user instructions:

- Do **not** use Playwright unless the user explicitly asks for it again.
- Do **not** use claude-in-chrome (or any browser-automation tool) to self-verify visual changes either — this permission was explicitly revoked this session. Make the change, tell the user exactly what to look at, and wait for them to check the local preview themselves. See `[[feedback_no_browser_automation]]` in memory.

## Accepted First-Fold Direction

The first fold currently uses:

- light infrastructure glass palette
- `assets/Verified Rack Object.jpeg` as the hero visual
- lightweight brand and demo navigation
- minimal blue cursor/caret animation on the hero headline
- left-side copy and proof numbers

Accepted opening copy:

- Eyebrow: `Physical infrastructure intelligence for data centers`
- Headline: `One phone sweep. Verified rack truth.`
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
