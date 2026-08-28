# RackTrack Homepage — "One Continuous World" Design

**Date:** 2026-08-19
**Branch:** `feat/continuous-world`
**Status:** Approved (spine + batch plan), pending spec review

---

## Problem

The current homepage (Chapters 1–8, all "built & accepted") does not create the
emotional/live connection the reference sites (meter.com, igloo.inc) achieve. The
user's own observation, confirmed by reading the code:

1. **Structural dead air.** Chapters 4–8 are five *separate* `<section>`s, each with
   its own sticky pin and frame sequence. In `main.js`, each section's narrative
   fades **in** only after 2–8% scroll progress (`smooth(0.02, 0.08, progress)`) and
   fades **out** at 96–100%. At every seam the outgoing text is already gone *and* the
   incoming text has not arrived, while the outgoing canvas has scrolled away and the
   incoming canvas is still below the fold. The result is a blank (white) moment at
   every one of the five seams. This is architectural, not a rendering bug.
2. **Hard cuts between unrelated worlds.** Each chapter is a different pre-rendered
   clip (rack exploding, cables, reconciliation…). The camera *cuts*. The brain
   correctly reads it as "five separate videos stitched together," because it is.
3. **Nothing reacts to the user.** A scrubbed frame sequence only plays forward/back
   with scroll. It never answers the cursor, velocity, or presence — so it reads as a
   film being dragged, not a place being inhabited.

**Key reframe:** switching to Three.js does not, by itself, create connection. The
levers that do are **continuity**, **object permanence**, **depth + responsiveness**,
and **overlap**. None of them require discarding the existing rendered frames.

## Goal

Rebuild the homepage scroll experience as **one continuous world** — a single pinned
WebGL stage driven by one scroll-progress value, in which the *same* rack persists and
transforms through every business beat, with a live reactive layer for depth and
presence, and no seams where the screen goes blank.

Stay strictly on-topic to what RackTrack is: one phone sweep of a physical data-center
rack becomes verified inventory, ports, cables, topology, reconciliation, and audit
evidence — scaling from one rack to the whole floor.

## Non-goals (YAGNI)

- No new pages. Home page only; the other ~20 pages come later.
- No Blender / live-3D-model asset pipeline. We reuse the existing pre-rendered WebP
  frame sequences as the photoreal core.
- No new build step or framework. Keep the current plain-ES-module, no-bundler setup;
  Three.js is vendored locally (no CDN).
- Chapter 2 (dense 240-frame phone scan) keeps its proven internal rendering; it is
  brought into the continuous flow, not re-implemented.

## Fixed constraints (from AGENTS.md — do not violate)

- **Palette:** light infrastructure glass. `#F7FAFF` cloud white (page bg), `#EEF5FF`
  mist blue, `#D9E7F6` pale steel (borders/panels/overlays), `#102033` deep ink
  (text/structural), `#2457D6` verified blue (primary CTA/accent), `#7DBDFF` scan blue
  (glows/telemetry/3D highlights), `#43B883` verified green (**semantic success
  only**), `#D99A2B` drift amber (**semantic warning only**), `#FFFFFF` glass surface.
  No black/very-dark dominant background. No purple-blue AI gradients.
- **Fonts:** Satoshi/Geist for display/UI; **Geist Mono** for rack labels, port
  states, coordinates, telemetry, evidence IDs, technical microcopy.
- Desktop/laptop-first; mobile secondary.
- Do **not** use Playwright unless the user explicitly asks. Visual confirmation is
  by user check / screenshot.

## The narrative spine — one rack, one journey

Object permanence is the core device: the rack scanned in the hero is the *same* rack
that lives through every beat. The camera performs a single continuous move —
**scan → detail → pull back to the floor → return to the rack** — that welds the beats
into one place instead of eight cuts.

| Beat | The one rack does | Business truth (real content source) |
|------|-------------------|--------------------------------------|
| Hero | Sits, verified, at rest (static) | "One phone sweep. Verified rack truth." |
| Scan | A phone sweep captures *this* rack | Perceive — visual rack capture |
| Perceive | Its devices/ports resolve from the same rack | Autonomous asset identification |
| Connect | Cables light up *on that rack* | Connectivity intelligence |
| Reconcile | Records check out — amber drift → green verified | Continuous reconciliation |
| Scale | Camera pulls **back**: one rack → row → floor | "Start with one rack… full footprint" |
| Outcomes | Camera returns to the rack; 6 outcomes radiate | Six intelligence surfaces |
| CTA | The verified rack, at rest again | "Begin with one rack." |

Chapter-by-chapter copy sources remain `docs/03-homepage-storyboard.md` and the real
content in `Racktrack_Website/docs/RackTrack-Website-Content.md`.

## Architecture

- **One pinned WebGL stage** (Three.js), full-viewport, never unmounts. A single tall
  invisible scroll track drives one normalized `storyProgress` value `0→1` for the
  entire story. "Sections" cease to exist as independent scroll containers, so seams
  cannot exist.
- **Photoreal core:** the existing rendered frames stay. The current frame (crossfaded
  between the two nearest loaded frames, reusing the proven blend logic from
  `createPinnedSequence`) is drawn to one offscreen 2D canvas and mapped as a **single**
  `CanvasTexture` onto a plane inside the 3D scene, updated per tick. One texture
  upload per frame — cheap and GPU-friendly.
- **Live reactive layer:** real Three.js geometry composited over/around the rack —
  cable splines, port-state chips, telemetry lines, reconciliation grid, particles,
  scan light. This is the source of depth and the "it is answering me" feeling; it
  reacts to cursor position and scroll velocity.
- **Overlapping beats:** the next beat's visual and narrative fade **in** before the
  current fades **out**. No frame ever has both gone. The structural dead-air bug is
  designed out, not patched.
- **Narrative overlay:** HTML/CSS layer synced to the same `storyProgress`; light-glass
  cards, Geist Mono for technical microcopy. Editable text, never baked into video.
- **Continuity of camera:** one virtual camera performs the scan→detail→pull-back→return
  arc as a function of `storyProgress`, plus subtle cursor parallax for presence.

## Build plan (batches — de-risk by proving the feeling early)

Each batch is reviewed before the next starts.

1. **Batch 1 — Kill the dead air (highest payoff, lowest risk).** Weld Chapters 4–8
   into one continuous pinned stage: one `storyProgress`, overlapping cross-dissolved
   beats, no blank seams. Mostly a restructure of existing 2D-canvas code — **no WebGL
   yet.** Success test: scrolling from Perceive through Outcomes never shows a blank
   frame, and each beat's text is present whenever its visual is.
2. **Batch 2 — The living layer.** Introduce the Three.js scene; move frame content onto
   the in-scene plane; add the camera continuity arc (scan → detail → pull-back to floor
   → return) and cursor parallax. The Scan→Perceive handoff (the "after-scan" dead spot
   the user specifically called out) is closed here, when the camera language exists to
   carry the eye from the scan into the rack detail.
3. **Batch 3 — Reactive geometry.** Cables, port chips, telemetry, and drift→verified
   state transitions as real lit geometry that answers the cursor and scroll velocity.
4. **Batch 4 — Chapter 9 CTA + polish.** Build the static final CTA ("Begin with one
   rack"); reduced-motion and no-WebGL fallbacks; performance pass.

## Failure-mode audit

- **Weak GPU / 10x load:** one scene, one main texture, modest geometry. Budget frame
  textures (do not upload all sequences to the GPU at once — the offscreen-canvas +
  single-texture approach guarantees this). Provide reduced-motion and no-WebGL
  fallbacks.
- **Dependency down:** Three.js vendored locally (no CDN); no runtime third-party calls.
- **Accessibility:** honor `prefers-reduced-motion` (static, readable stacked version);
  narrative text lives in real DOM with proper headings; `aria-hidden` on decorative
  canvas; skip-link preserved.
- **Cost/data leak:** none — static site, no backend, no secrets.
- **Rollback:** all work on `feat/continuous-world`. Current `index.html` / `main.js` /
  `styles.css` remain working on `main` until the new experience is proven, then swap.

## Success criteria

- No blank/white frame at any point in the Perceive→Outcomes scroll.
- The same rack is visibly continuous across beats (object permanence reads).
- The experience responds to cursor and scroll velocity (not a passive scrub).
- Palette and typography match the locked light-glass system exactly.
- Reduced-motion and no-WebGL users get a coherent, readable fallback.
- Smooth on desktop/laptop (target 60fps on the reference machine).
