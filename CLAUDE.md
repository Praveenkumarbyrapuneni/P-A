# RackTrack Rewrite Direction

## Current Phase

We are rebuilding RackTrack page by page inside this `P-A` folder.

**Chapters 1-8 of the homepage scroll story are built, wired, and accepted.** Only Chapter 9 (Final CTA) remains, and it needs no video — it's a static bookend reusing the hero image, same pattern as Chapter 1.

The existing `/Users/praveen/Desktop/Racktrack_Website` folder is the content and business reference only (real copy, claims, and a few directly-reusable light-palette images have come from its `docs/RackTrack-Website-Content.md` and `assets/` folder). Use its data and claims, but build the new experience here.

## Build Progress

| # | Chapter | Status |
|---|---|---|
| 1 | Hero | Built & accepted. Static, `assets/Verified Rack Object.jpeg`. |
| 2 | The Scan | Built & accepted. Full-bleed 240-frame scroll sequence, `assets/phone-scan-2-frames-webp/`. |
| 3 | Post-Scan Bridge | Built & accepted. "Captured facts. Ready to verify." + three tilted evidence cards. |
| 4 | Rack-Open (Perceive/Cognize) | Built & accepted. Split-layout, 131-frame sequence, `assets/rack-open-frames-webp/`. |
| 5 | Cable Truth (Connect) | Built & accepted. Split-layout, 76-frame sequence, `assets/cable-truth-frames-webp/`. |
| 6 | Reconciliation Layer | Built & accepted. Split-layout, 52-frame sequence, `assets/reconciliation-frames-webp/`. |
| 7 | Data Center Scale | Built & accepted. Split-layout, 54-frame sequence, `assets/scale-frames-webp/`. |
| 8 | Enterprise Outcomes | Built & accepted. Split-layout, 57-frame sequence, `assets/outcomes-frames-webp/`. |
| 9 | Final CTA | **Not built.** No video needed — reuse `assets/Verified Rack Object.jpeg`, static like the hero, CTA as live HTML/CSS. This is the only remaining build item. |

Chapter-by-chapter narrative detail, real copy sources, and full asset briefs (start/end frame + Flow prompt) for every chapter live in `docs/03-homepage-storyboard.md` — that file is the single source of truth for chapter content, keep it that way rather than duplicating chapter descriptions here (an earlier version of this file had its own separate chapter list that drifted out of sync with the storyboard doc and caused a real contradiction bug; don't recreate that).

## Site Architecture (as actually built)

**HTML (`index.html`):** Chapters 4-8 share one markup pattern: `<section class="split-story" data-X-sequence>` → `.split-pin` (sticky, two-column grid) → `.split-narrative` (left, three `.split-note[data-note][data-at]` articles cross-fading) + `.split-visual` (right, `.split-poster` img + `.split-canvas` canvas). `data-at` on each note is a 0-1 scroll-progress threshold tied to the real clip boundary it corresponds to, not an even split — keeps text in sync with what the animation is actually showing.

**CSS (`styles.css`):** All five split-layout chapters share ONE set of classes (`.split-story`, `.split-pin`, `.split-visual`, `.split-poster`, `.split-canvas`, `.split-narrative`, `.split-note`). Per-chapter scroll length (`min-height`) is set via the chapter's own `data-X-sequence` attribute selector, not a modifier class. (This was originally two separate duplicated class sets for Ch4/Ch5 — consolidated once a 3rd chapter made the duplication a real problem, per the project's own "three strikes" refactor threshold.)

**JS (`main.js`):** A single `createPinnedSequence({root, totalFrames, framePath})` factory handles loading, resizing, drawing, and note-syncing for any split-layout chapter. Five instances (`rackPinned`, `cablePinned`, `reconciliationPinned`, `scalePinned`, `outcomesPinned`) collected into a `pinnedSequences` array that the render loop iterates. Two things this factory does that a naive frame-sequence implementation wouldn't:

- **Crossfade blending** between the two nearest loaded frames by fractional scroll progress (canvas `globalAlpha`) — necessary because these sequences are sparse (~1 real frame per 8-10 scroll-frames) unlike the dense 240-frame phone-scan sequence, which just hard-snaps.
- **Scroll-progress smoothing (lerp)** — each frame, the internal progress value eases 16% of the way toward the raw scroll position instead of snapping to it. This is the actual fix for a reported "feels like wearing brakes" issue: raw scroll input (wheel/trackpad) moves in chunky, variable-sized steps, and crossfade blending alone only smooths the *image* between two frames, not the *timing* of when the target changes. Eased progress is what makes it read as continuous motion. Also: all frames for these chapters are loaded eagerly (not trickled via `requestIdleCallback`, which gets starved by the continuous render loop and was the other half of the "brakes" cause) — safe to do since each sequence is only 2-6MB total by design.

The phone-scan section (Chapter 2) is a separate, older, unrelated code path in `main.js` (dense 240-frame hard-snap, no blending) — intentionally left untouched since it was already accepted before the split-layout pattern existed. Don't merge it into the factory unless asked.

## Known bugs fixed this build (context for next session)

- **Story-bridge first card disappearing on scroll** (Chapter 3): `.evidence-card-scan` was wired to the same `--bridge-copy-opacity` CSS variable as the headline text, which explicitly fades out near the end of the section. Fixed with a dedicated `--bridge-source-opacity` variable (fades in, stays visible, like the other two cards). Pre-existing bug, not introduced this session.
- **Chapter 4 Clip 1 oscillation**: the raw generated/reversed video didn't play a clean single open motion — it oscillated (closed→explode→closed again→explode again) within its 10s, invisible to a sparse 3-point sample. Fixed by trimming to the clean 0-6.8s portion (`assets/rack-open-01.mp4`); the buggy full-length version is kept at `assets/rack-open-01-untrimmed-buggy.mp4` for reference only. **Lesson: always frame-check a full generated clip at ~1s density before trusting it, not just start/mid/end.**
- **Gemini sparkle watermark**: every Flow-generated clip so far has carried a small white 4-point sparkle mark at approximately `x:1110,y:550,w:90,h:90` in the 1280x720 frame (bottom-right-ish). Removed via `ffmpeg -vf "delogo=x=1110:y=550:w=90:h=90:show=0"` before extraction each time. Check for this on any new generated clip before extracting frames — it's easy to miss at a glance (it was first mistaken for a glass reflection).

## Superseded / unused source files (kept, not live)

`assets/v0.mp4`, `v1.mp4`, `v0-clean.mp4`, `rack-open-01-untrimmed-buggy.mp4`, `chapter4-clip2.mp4`, `chapter5.mp4` (watermarked originals — clean versions are what's actually used), `frame-1.jpg`, `frame-2.jpg`, `frame-1.1.jpeg`, `frame-2.1.jpeg` (early v1.mp4 exploration keyframes). None of these are referenced by the live site. Safe to ignore; not worth deleting unless the user asks.

## Current Local Preview

- `http://127.0.0.1:5174/`
- Server may not be running in a fresh session — restart with: `python3 -m http.server 5174` from the `P-A` folder.

Important user instruction:

- Do **not** use Playwright unless the user explicitly asks for it again.
- If visual confirmation is needed, ask the user to check the local preview or send a screenshot.

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

The user likes the current image quality and brand impression; the homepage experience is a high-quality motion-driven scroll story, similar in craft level to sites like Meter without copying them.

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
