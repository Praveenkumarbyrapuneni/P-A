# Continuous-World Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Chapter 4–8 scroll story as one continuous pinned stage — the same rack persisting through every beat with overlapping, crossfaded transitions — so the screen is never blank and the experience reads as one place, not stitched clips.

**Architecture:** Batch 1 welds the five separate `.split-story` sections into ONE pinned section driven by a single `worldProgress` value, using a pure timeline module (`world-timeline.js`) that maps that value across all five frame sequences with crossfade bands at the joins (2D canvas, no WebGL yet). Batches 2–4 add the Three.js scene, camera-journey continuity, a live reactive geometry layer, and the Chapter 9 CTA.

**Tech Stack:** Vanilla ES modules, HTML canvas 2D (Batch 1), Three.js vendored locally (Batch 2+), no bundler, no framework. Python `http.server` for preview. Node for pure-logic asserts.

## Global Constraints

_Every task's requirements implicitly include this section._

- **Palette (light infrastructure glass, exact):** `#F7FAFF` cloud white (page bg) · `#EEF5FF` mist blue · `#D9E7F6` pale steel (borders/panels/overlays) · `#102033` deep ink (text/structural) · `#2457D6` verified blue (primary CTA/accent) · `#7DBDFF` scan blue (glows/telemetry/3D highlights) · `#43B883` verified green (**semantic success only**) · `#D99A2B` drift amber (**semantic warning only**) · `#FFFFFF` glass surface. No black/very-dark dominant background. No purple-blue AI gradients.
- **Fonts:** Satoshi/Geist display/UI; **Geist Mono** for rack labels, port states, coordinates, telemetry, evidence IDs, technical microcopy.
- **Desktop/laptop-first;** mobile secondary.
- **No Playwright.** Visual confirmation = user checks `http://127.0.0.1:5174/` or sends a screenshot.
- **Reduced motion:** `prefers-reduced-motion: reduce` must yield a static, readable stacked version.
- **Do not touch** the phone-scan path (Chapter 2, dense 240-frame) — it is accepted and unrelated. Hero (Ch1) and bridge (Ch3) stay as-is in Batch 1.
- **Work stays on branch `feat/continuous-world`.** `main`'s homepage keeps working until the new experience is proven and deliberately swapped.
- **Frequent commits;** one per task.

## File Structure

- **Create `world-timeline.js`** — pure, no-DOM ES module: `clamp`, `buildBoundaries`, `beatLocal`, `frameFor`, `resolveWorld`. Sole responsibility: map one scroll value across N beats into a draw plan with crossfade bands. Imported by both the browser (`main.js`) and the node test.
- **Create `tests/world-timeline.test.mjs`** — node assert script for the timeline math (the no-blank + monotonic invariants).
- **Create `package.json`** — `{"type":"module","private":true}` so node runs the ESM test and the browser still gets correct `.js` MIME.
- **Modify `index.html`** — replace the five `<section class="split-story">` blocks (Ch4–8) with one `<section class="world-story" data-world>`.
- **Modify `main.js`** — add `createWorld()`; remove the five `createPinnedSequence` instances and their render usage; keep everything else (phone-scan, hero, bridge) untouched.
- **Modify `styles.css`** — add `.world-*` classes (reusing the existing split-visual look).

Batches 2–4 add: `world-scene.js` (Three.js scene + camera arc), `world-reactive.js` (cable/port/telemetry geometry), and a Chapter 9 `<section>` + styles.

---

## Batch 1 — Kill the dead air (continuity, no WebGL)

### Task 1: Pure timeline module + node asserts

**Files:**
- Create: `world-timeline.js`
- Create: `tests/world-timeline.test.mjs`
- Create: `package.json`

**Interfaces:**
- Produces: `clamp(v, lo?, hi?) -> number`; `buildBoundaries(weights: number[]) -> number[]` (length N+1, `[0..1]`); `beatLocal(p, boundaries, j) -> number` (0..1 inside beat j); `frameFor(local, frames) -> number` (1..frames); `resolveWorld(p, boundaries, frameCounts, band=0.04) -> { layers: {beat, frame, alpha}[], active: {beat, local} }`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "racktrack-homepage",
  "private": true,
  "type": "module"
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/world-timeline.test.mjs`:

```js
import assert from "node:assert/strict";
import {
  clamp, buildBoundaries, beatLocal, frameFor, resolveWorld,
} from "../world-timeline.js";

const weights = [131, 76, 52, 54, 57];        // frame counts per beat
const frameCounts = weights;
const boundaries = buildBoundaries(weights);   // length 6, [0, ...,1]

// buildBoundaries is normalized and monotonic
assert.equal(boundaries[0], 0);
assert.equal(boundaries[boundaries.length - 1], 1);
for (let i = 1; i < boundaries.length; i++) {
  assert.ok(boundaries[i] > boundaries[i - 1], "boundaries strictly increasing");
}

// INVARIANT 1 — never blank: at every sampled p, at least one layer with alpha > 0
for (let p = 0; p <= 1.0001; p += 0.002) {
  const { layers } = resolveWorld(p, boundaries, frameCounts);
  assert.ok(layers.length >= 1, `p=${p} produced no layers`);
  const cover = layers.reduce((s, l) => s + l.alpha, 0);
  assert.ok(cover > 0, `p=${p} produced zero coverage (blank screen)`);
  for (const l of layers) {
    assert.ok(l.frame >= 1 && l.frame <= frameCounts[l.beat],
      `p=${p} beat ${l.beat} frame ${l.frame} out of range`);
  }
}

// INVARIANT 2 — monotonic story: active beat never goes backwards
let last = -1;
for (let p = 0; p <= 1.0001; p += 0.002) {
  const { active } = resolveWorld(p, boundaries, frameCounts);
  assert.ok(active.beat >= last, `active beat regressed at p=${p}`);
  last = Math.max(last, active.beat);
}

// INVARIANT 3 — at an internal boundary, TWO layers overlap (the crossfade)
const b1 = boundaries[1];
const at = resolveWorld(b1, boundaries, frameCounts);
assert.equal(at.layers.length, 2, "boundary must crossfade two beats");
assert.ok(Math.abs(at.layers[1].alpha - 0.5) < 0.15, "incoming ~half-faded at boundary");

// spot checks on helpers
assert.equal(clamp(1.4), 1);
assert.equal(frameFor(0, 131), 1);
assert.equal(frameFor(1, 131), 131);
assert.ok(beatLocal(boundaries[2] + 1e-9, boundaries, 2) < 0.01);

console.log("world-timeline: all invariants hold");
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node tests/world-timeline.test.mjs`
Expected: FAIL — `Cannot find module '../world-timeline.js'`.

- [ ] **Step 4: Write `world-timeline.js`**

```js
// world-timeline.js — pure, no DOM. Maps ONE scroll progress across N beats
// with crossfade bands at the joins, so the screen is never blank at a seam.

export const clamp = (v, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi);

// weights: per-beat scroll share (frame counts work well — denser motion
// gets more scroll). Returns boundaries length N+1: [0, ..., 1].
export function buildBoundaries(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  const boundaries = [0];
  let acc = 0;
  for (const w of weights) {
    acc += w;
    boundaries.push(acc / total);
  }
  return boundaries;
}

// 0..1 progress inside beat j at global p.
export function beatLocal(p, boundaries, j) {
  const start = boundaries[j];
  const end = boundaries[j + 1];
  return clamp((p - start) / Math.max(end - start, 1e-6));
}

// frame index (1..frames) for a beat's local progress.
export function frameFor(local, frames) {
  return clamp(1 + local * (frames - 1), 1, frames);
}

// Draw plan at global progress p.
// band = crossfade half-width in global units; must be < half the smallest
// segment (smallest here ~0.14, so 0.04 is safe).
export function resolveWorld(p, boundaries, frameCounts, band = 0.04) {
  const N = boundaries.length - 1;
  p = clamp(p);
  let i = 0;
  while (i < N - 1 && p > boundaries[i + 1]) i++;

  const layerFor = (beat, alpha = 1) => ({
    beat,
    frame: frameFor(beatLocal(p, boundaries, beat), frameCounts[beat]),
    alpha,
  });
  const activeOf = (a, hi, lo) =>
    a >= 0.5
      ? { beat: hi, local: beatLocal(p, boundaries, hi) }
      : { beat: lo, local: beatLocal(p, boundaries, lo) };

  // End band of beat i -> incoming beat i+1 rises 0..1.
  if (i < N - 1 && p > boundaries[i + 1] - band) {
    const alpha = clamp((p - (boundaries[i + 1] - band)) / (2 * band));
    return { layers: [layerFor(i), layerFor(i + 1, alpha)], active: activeOf(alpha, i + 1, i) };
  }
  // Start band of beat i -> outgoing beat i-1 still fading out.
  if (i > 0 && p < boundaries[i] + band) {
    const alpha = clamp((p - (boundaries[i] - band)) / (2 * band));
    return { layers: [layerFor(i - 1), layerFor(i, alpha)], active: activeOf(alpha, i, i - 1) };
  }
  return { layers: [layerFor(i)], active: { beat: i, local: beatLocal(p, boundaries, i) } };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node tests/world-timeline.test.mjs`
Expected: PASS — prints `world-timeline: all invariants hold`.

- [ ] **Step 6: Commit**

```bash
git add package.json world-timeline.js tests/world-timeline.test.mjs
git commit -m "feat: pure world-timeline module + no-blank/monotonic asserts"
```

---

### Task 2: One world section in the markup

**Files:**
- Modify: `index.html` (replace the five `<section class="split-story">` blocks, currently spanning the `data-rack-sequence` … `data-outcomes-sequence` sections, with one section)

**Interfaces:**
- Produces DOM contract consumed by Task 3: root `[data-world]`; inside it `.world-pin` > (`.world-visual` containing `.world-poster` img + `.world-canvas` canvas) + `.world-narrative` containing five `.world-beat[data-beat]` groups, each with three `.world-note[data-note][data-at]` articles carrying the existing copy.

- [ ] **Step 1: Replace the five split-story sections with one**

Delete the five `<section class="split-story" …>` blocks (Ch4–8) and insert in their place:

```html
<section class="world-story" aria-label="RackTrack continuous rack story" data-world>
  <div class="world-pin">
    <div class="world-narrative" aria-live="polite">
      <div class="world-beat" data-beat="perceive">
        <article class="world-note is-active" data-note data-at="0">
          <p>05 — Perceive</p><h2>Every device. Every rack unit.</h2>
          <span>A guided sweep separates chassis, ports, labels, and rack-unit position from the physical rack.</span>
        </article>
        <article class="world-note" data-note data-at="0.427">
          <p>06 — Cognize</p><h2>Structured, not guessed.</h2>
          <span>Switches, patch panels, PDUs, and controllers classify into asset records — no manual transcription.</span>
        </article>
        <article class="world-note" data-note data-at="0.733">
          <p>07 — Evidence</p><h2>Ready for reconciliation.</h2>
          <span>A continuously reconciled record — inventory, ports, and evidence — from a single phone sweep.</span>
        </article>
      </div>
      <div class="world-beat" data-beat="connect">
        <article class="world-note" data-note data-at="0">
          <p>08 — Connect</p><h2>Every cable, mapped.</h2>
          <span>Visible port usage, cable paths, and link indicators map against the physical rack evidence.</span>
        </article>
        <article class="world-note" data-note data-at="0.158">
          <p>09 — Topology</p><h2>Physical meets logical.</h2>
          <span>Observations are checked against CDP, LLDP, ARP, and neighbor data from the live network.</span>
        </article>
        <article class="world-note" data-note data-at="0.474">
          <p>10 — Verified</p><h2>Green means verified.</h2>
          <span>Most paths resolve green. Amber flags a drift or mismatch the moment it appears.</span>
        </article>
      </div>
      <div class="world-beat" data-beat="reconcile">
        <article class="world-note" data-note data-at="0">
          <p>11 — Reconcile</p><h2>Checked against every system.</h2>
          <span>New scans compare against CMDB, DCIM, asset, and network records automatically.</span>
        </article>
        <article class="world-note" data-note data-at="0.4">
          <p>12 — Drift</p><h2>Drift doesn't hide.</h2>
          <span>A mismatch surfaces the moment it appears — not at the next audit cycle.</span>
        </article>
        <article class="world-note" data-note data-at="0.769">
          <p>13 — Truth</p><h2>One verified source.</h2>
          <span>40-60% of enterprise CMDB records drift from physical reality. RackTrack closes that gap continuously.</span>
        </article>
      </div>
      <div class="world-beat" data-beat="scale">
        <article class="world-note" data-note data-at="0">
          <p>14 — Scale</p><h2>Start with one rack.</h2>
          <span>A single verified rack is the first proof point, not the ceiling.</span>
        </article>
        <article class="world-note" data-note data-at="0.111">
          <p>15 — Expand</p><h2>Then the next rack. Then the row.</h2>
          <span>Each additional rack confirms the same way — visually, then verified.</span>
        </article>
        <article class="world-note" data-note data-at="0.667">
          <p>16 — Footprint</p><h2>Continuous across the floor.</h2>
          <span>One workflow scales from a single cabinet to the full data center footprint.</span>
        </article>
      </div>
      <div class="world-beat" data-beat="outcomes">
        <article class="world-note" data-note data-at="0">
          <p>17 — Outcomes</p><h2>One model. Every team.</h2>
          <span>The same verified record powers different workflows for different teams.</span>
        </article>
        <article class="world-note" data-note data-at="0.105">
          <p>18 — Focus</p><h2>From footprint back to detail.</h2>
          <span>Capacity, connectivity, compliance, procurement, posture, and incidents — all traceable to one rack.</span>
        </article>
        <article class="world-note" data-note data-at="0.632">
          <p>19 — Ready</p><h2>Six outcomes, one source.</h2>
          <span>Capacity intelligence, connectivity, compliance evidence, procurement reconciliation, vulnerability posture, and incident location — all from the same verified model.</span>
        </article>
      </div>
    </div>

    <div class="world-visual" aria-hidden="true">
      <img class="world-poster" src="assets/rack-open-frames-webp/frame-0001.webp" alt="">
      <canvas class="world-canvas" width="1280" height="720"></canvas>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify structure loads without error**

Run: `python3 -m http.server 5174` (from `P-A/`), then ask the user to open `http://127.0.0.1:5174/` and confirm the page loads with no console errors and the section is present (visual will be static/incorrect until Task 3 — that is expected).
Expected: page loads; hero/scan/bridge unchanged; new section present.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: single world-story section replacing five split sections"
```

---

### Task 3: `createWorld()` controller — draw layers + sync notes

**Files:**
- Modify: `main.js` (add `createWorld()`, remove the five `createPinnedSequence` instances + `pinnedSequences` render usage; keep the factory definition only if still referenced, otherwise delete it)

**Interfaces:**
- Consumes: `resolveWorld`, `buildBoundaries` from `world-timeline.js`; DOM contract from Task 2; existing helpers `clamp`, `elementProgress`, `whenNearViewport`.
- Produces: a `world` controller object `{ root, update(), markNeedsResize() }` added to the render loop.

- [ ] **Step 1: Import timeline + define beat config at the top of `main.js`**

```js
import { resolveWorld, buildBoundaries } from "./world-timeline.js";

const WORLD_BEATS = [
  { key: "perceive",   frames: 131, dir: "rack-open-frames-webp" },
  { key: "connect",    frames: 76,  dir: "cable-truth-frames-webp" },
  { key: "reconcile",  frames: 52,  dir: "reconciliation-frames-webp" },
  { key: "scale",      frames: 54,  dir: "scale-frames-webp" },
  { key: "outcomes",   frames: 57,  dir: "outcomes-frames-webp" },
];
const worldFramePath = (dir, i) =>
  `assets/${dir}/frame-${String(i).padStart(4, "0")}.webp`;
```

- [ ] **Step 2: Implement `createWorld()`**

Add this function (mirrors the proven load/resize/paint approach from `createPinnedSequence`, but draws a multi-layer plan across all five sequences):

```js
function createWorld() {
  const root = document.querySelector("[data-world]");
  if (!root) return null;

  const canvasEl = root.querySelector(".world-canvas");
  const poster = root.querySelector(".world-poster");
  const beatEls = Array.from(root.querySelectorAll(".world-beat"));
  const notesByBeat = beatEls.map((el) => Array.from(el.querySelectorAll("[data-note]")));
  if (!canvasEl) return null;

  const ctx = canvasEl.getContext("2d", { alpha: false });
  const frameCounts = WORLD_BEATS.map((b) => b.frames);
  const boundaries = buildBoundaries(frameCounts);

  // one image cache per beat
  const images = WORLD_BEATS.map((b) => new Array(b.frames + 1));
  const loaded = WORLD_BEATS.map(() => new Set());

  let width = 0, height = 0, needsResize = true, ready = false;
  let smoothed = null;

  function load(beat, index) {
    if (index < 1 || index > WORLD_BEATS[beat].frames || images[beat][index]) {
      return images[beat][index];
    }
    const img = new Image();
    img.decoding = "async";
    img.src = worldFramePath(WORLD_BEATS[beat].dir, index);
    img.onload = () => {
      loaded[beat].add(index);
      if (!ready && beat === 0 && index === 1) {
        ready = true;
        root.classList.add("is-ready");
      }
    };
    images[beat][index] = img;
    return img;
  }

  function preloadAll() {
    WORLD_BEATS.forEach((b, beat) => {
      for (let i = 1; i <= b.frames; i++) load(beat, i);
    });
  }

  function nearestLoaded(beat, target) {
    if (loaded[beat].has(target)) return target;
    const max = WORLD_BEATS[beat].frames;
    for (let off = 1; off < max; off++) {
      if (target - off >= 1 && loaded[beat].has(target - off)) return target - off;
      if (target + off <= max && loaded[beat].has(target + off)) return target + off;
    }
    return 1;
  }

  function resize() {
    const rect = canvasEl.getBoundingClientRect();
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width * pr));
    height = Math.max(1, Math.round(rect.height * pr));
    if (canvasEl.width !== width || canvasEl.height !== height) {
      canvasEl.width = width; canvasEl.height = height;
    }
    needsResize = false;
  }

  function paint(image, alpha, clear) {
    const ir = image.naturalWidth / image.naturalHeight;
    const cr = width / height;
    let dw = width, dh = height, dx = 0, dy = 0;
    if (ir > cr) { dh = height; dw = dh * ir; dx = (width - dw) / 2; }
    else { dw = width; dh = dw / ir; dy = (height - dh) / 2; }
    if (clear) ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  function drawPlan(layers) {
    if (!ctx || !width || !height) return;
    layers.forEach((layer, idx) => {
      const src = nearestLoaded(layer.beat, Math.round(layer.frame));
      const img = images[layer.beat][src];
      if (!img || !img.complete || !img.naturalWidth) return;
      paint(img, layer.alpha, idx === 0); // first layer clears, rest composite over
    });
  }

  function updateNotes(active) {
    // fade whole narrative in/out at the very start/end so it never lingers blank
    beatEls.forEach((el, bi) => el.classList.toggle("is-current", bi === active.beat));
    notesByBeat[active.beat].forEach((note, ni) => {
      const at = parseFloat(note.dataset.at || "0");
      const nextAt = ni + 1 < notesByBeat[active.beat].length
        ? parseFloat(notesByBeat[active.beat][ni + 1].dataset.at || "1") : 1.01;
      note.classList.toggle("is-active", active.local >= at && active.local < nextAt);
    });
  }

  function update() {
    if (needsResize) resize();
    const raw = reduceMotion.matches ? 0.5 : clamp(elementProgress(root));
    smoothed = smoothed === null ? raw : smoothed + (raw - smoothed) * 0.16;
    const { layers, active } = resolveWorld(smoothed, boundaries, frameCounts);
    root.style.setProperty("--world-opacity", smooth(0, 0.03, smoothed).toFixed(3));
    drawPlan(layers);
    updateNotes(active);
  }

  if (poster) poster.src = worldFramePath(WORLD_BEATS[0].dir, 1);
  resize();
  whenNearViewport(root, preloadAll);
  return { root, update, markNeedsResize: () => { needsResize = true; } };
}
```

- [ ] **Step 2b: Remove the old five instances**

Delete the `rackPinned`/`cablePinned`/`reconciliationPinned`/`scalePinned`/`outcomesPinned` `createPinnedSequence(...)` calls and the `pinnedSequences` array they populated. Replace with:

```js
const world = createWorld();
const worldSequences = [world].filter(Boolean);
```

Then in `renderLoop`, replace `pinnedSequences.forEach((seq) => seq.update());` with `worldSequences.forEach((seq) => seq.update());`, and in `updateHeaderState` replace the `pinnedSequences.some(...)` block's variable with `worldSequences`. In the resize listener replace `pinnedSequences.forEach((seq) => seq.markNeedsResize())` with `worldSequences.forEach((seq) => seq.markNeedsResize())`. (If `createPinnedSequence` is now unreferenced, delete its definition.)

- [ ] **Step 3: Re-run the pure asserts (guard against a math regression)**

Run: `node tests/world-timeline.test.mjs`
Expected: PASS.

- [ ] **Step 4: Visual checkpoint (user)**

Ask the user to reload `http://127.0.0.1:5174/` and scroll slowly from the bridge through to the end of the world section, watching specifically the **seams** between the five beats.
Expected / acceptance:
- No blank/white frame at any seam — as one beat's rack ends, the next is already fading in over it.
- The active note text is always present while its visual is on screen (never a gap with a visible rack but no text, or text but no rack).
- Motion still feels smooth (the 0.16 lerp is preserved).

- [ ] **Step 5: Commit**

```bash
git add index.html main.js
git commit -m "feat: createWorld continuous controller; retire five split instances"
```

---

### Task 4: `.world-*` styles

**Files:**
- Modify: `styles.css` (add `.world-story`, `.world-pin`, `.world-visual`, `.world-poster`, `.world-canvas`, `.world-narrative`, `.world-beat`, `.world-note`; set section scroll length)

**Interfaces:**
- Consumes: the DOM from Task 2 and the CSS vars `--world-opacity` (set in Task 3).

- [ ] **Step 1: Add the styles**

Model these on the existing `.split-*` rules (same light-glass look), with the key differences: the section is ~5× a single-beat scroll height, and beats stack in the same pinned grid cell so only the current one shows. Concretely:

```css
.world-story { position: relative; min-height: 520vh; background: var(--mist-blue, #EEF5FF); }
.world-pin {
  position: sticky; top: 0; height: 100vh;
  display: grid; grid-template-columns: minmax(320px, 40%) 1fr;
  align-items: center; gap: clamp(24px, 4vw, 64px);
  padding: clamp(24px, 5vw, 88px);
}
.world-visual { position: relative; height: min(72vh, 640px); border-radius: 20px;
  overflow: hidden; box-shadow: 0 30px 80px -40px rgba(16,32,51,.45); }
.world-poster, .world-canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.world-canvas { opacity: var(--world-opacity, 0); }
.world-narrative { position: relative; }
.world-beat { position: absolute; inset: 0; display: none; }
.world-beat.is-current { display: block; }
.world-note { position: absolute; inset: 0; opacity: 0; transform: translateY(14px);
  transition: opacity .5s ease, transform .5s ease; }
.world-note.is-active { opacity: 1; transform: none; }
.world-note p { font-family: "Geist Mono", ui-monospace, monospace; letter-spacing: .12em;
  text-transform: uppercase; color: var(--verified-blue, #2457D6); }
.world-note h2 { color: var(--deep-ink, #102033); }
.world-note span { color: color-mix(in srgb, var(--deep-ink,#102033) 70%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .world-story { min-height: auto; }
  .world-pin { position: static; height: auto; }
  .world-canvas { opacity: 1; }
  .world-note { opacity: 1; position: static; transform: none; }
  .world-beat { display: block; position: static; }
}
```

(Use whatever palette CSS variables already exist in `styles.css`; the hex fallbacks above match the locked palette. If the narrative column needs a fixed height for the absolute-positioned beats, mirror the height used by the old `.split-narrative`.)

- [ ] **Step 2: Visual checkpoint (user)**

Ask the user to reload and confirm: layout matches the old split chapters' polish (text left, rack right), notes cross-fade cleanly, palette is correct light-glass, and `prefers-reduced-motion` (toggle OS setting) shows a static readable stack.
Expected: visually equivalent-or-better than the old chapters, now seamless.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: world-story styles; reduced-motion static fallback"
```

**Batch 1 acceptance gate (user):** scroll Perceive→Outcomes end-to-end — no blank seam, text always matches the visible rack, motion smooth. Only after the user confirms this do we start Batch 2.

---

## Batch 2 — The living layer (Three.js + camera journey)

_Exact scene constants (camera positions, FOV, light intensities) are tuned against the preview during this batch — the starting values below are real defaults, not placeholders, but expect to adjust them with the user watching._

### Task 5: Vendor Three.js locally
- **Files:** Create `vendor/three.module.js` (download the pinned Three.js `three.module.js` build into the repo — no CDN, per constraints). Add an import map in `index.html` `<head>`: `<script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script>`.
- **Check:** page still loads; `import * as THREE from "three"` resolves in a scratch module without console error.
- **Commit:** `chore: vendor three.module.js + import map`.

### Task 6: `world-scene.js` — one scene, frame plane, in-canvas texture
- **Files:** Create `world-scene.js`; modify `main.js` to hand the world's composited 2D canvas to the scene as a `THREE.CanvasTexture`.
- **Interface produced:** `createWorldScene({ mountCanvas, sourceCanvas }) -> { render(progress), resize(), setCursor(x,y) }`.
- **Approach:** the Task-3 offscreen 2D canvas (the composited rack frame) becomes a single `CanvasTexture` (`needsUpdate = true` each tick) mapped onto a plane facing an orthographic-ish perspective camera. One texture upload per frame.
- **Check (user):** rack still renders correctly, now through WebGL; no visual regression vs Batch 1.
- **Commit:** `feat: three.js world scene with frame-plane texture`.

### Task 7: Camera journey + cursor parallax
- **Files:** modify `world-scene.js`; create pure `cameraArc(progress) -> { pos, target, fov }` (add to `world-timeline.js` or a sibling pure module) with a node assert that the arc is continuous (no jump between beats) and returns to near the start pose at `progress≈1` (the pull-back-to-floor-then-return move).
- **Approach:** map `worldProgress` to a camera dolly: tight on the rack during Perceive/Connect/Reconcile, pull back through Scale, return in Outcomes. Cursor adds small parallax offset to camera + a light.
- **Checks:** `node tests/*.mjs` passes (continuity assert); user confirms the camera move reads as one continuous journey and reacts to the cursor.
- **Commit:** `feat: continuous camera arc + cursor parallax`.

---

## Batch 3 — Reactive geometry (the "it answers me" layer)

### Task 8: `world-reactive.js` — cables/ports/telemetry as lit geometry
- **Files:** Create `world-reactive.js`; wire into `world-scene.js`.
- **Approach:** real Three.js geometry composited over the rack plane, keyed to `worldProgress`: cable splines that draw on during Connect, port-state chips that resolve during Perceive, reconciliation grid lines during Reconcile, drift→verified color transition (amber `#D99A2B` → green `#43B883`, **semantic only**), sparse scan-blue (`#7DBDFF`) telemetry particles throughout. All react to cursor proximity and scroll velocity.
- **Check (user):** each beat's geometry appears on-cue and responds to the cursor; colors obey the semantic rules.
- **Commit(s):** one per element (`feat: cable splines`, `feat: port-state chips`, `feat: reconciliation grid + drift/verified states`).

### Task 9: Performance pass
- **Files:** `world-scene.js`, `world-reactive.js`, `main.js`.
- **Approach:** cap DPR at 2; ensure only one texture upload/frame; throttle reactive geometry updates; verify no GPU-texture blowup (frames stay on the 2D canvas, only the composite is uploaded).
- **Check (user):** smooth on the reference laptop (target 60fps); no jank on fast scroll.
- **Commit:** `perf: world scene budget + throttling`.

---

## Batch 4 — Chapter 9 CTA + fallbacks

### Task 10: Static final CTA section
- **Files:** modify `index.html` (add Chapter 9 `<section>`), `styles.css`.
- **Approach:** static hero-style bookend reusing `assets/Verified Rack Object.jpeg`; copy from real content: headline "Begin with one rack. Build toward continuous infrastructure intelligence." ("continuous infrastructure intelligence." in verified blue), body from §2.7, CTA `Get a demo` → `mailto:info@racktrack.ai`. Live HTML/CSS, no video.
- **Check (user):** reads as a calm, verified bookend; palette/type correct.
- **Commit:** `feat: chapter 9 final CTA`.

### Task 11: No-WebGL fallback + final review
- **Files:** `main.js`, `world-scene.js`.
- **Approach:** feature-detect WebGL; if absent, keep the Batch-1 2D-canvas continuous experience (already works standalone). Confirm `prefers-reduced-motion` path end-to-end.
- **Check (user):** disabling WebGL still yields the seamless 2D experience; reduced-motion yields the static stack.
- **Commit:** `feat: no-webgl + reduced-motion fallbacks`.

**Final gate (user):** full-page scroll top-to-bottom; then decide whether to merge `feat/continuous-world` → `main` (swap the homepage).

---

## Self-Review

**Spec coverage:** one-rack spine → Tasks 2/3 (welded beats) + Task 7 (camera journey) + Task 10 (CTA bookend). No dead air → Task 1 invariant + Task 3. Live reactive layer → Batch 3. Palette/fonts → Global Constraints + Tasks 4/8. Reduced-motion/no-WebGL → Tasks 4/11. Vendored Three.js → Task 5. Rollback on branch → Global Constraints. All spec sections mapped.

**Placeholder scan:** Batch 1 has full code + runnable test. Batches 2–4 give concrete files, interfaces, starting values, and acceptance criteria; visual-constant tuning is explicitly flagged as calibration-against-preview, not a TODO.

**Type consistency:** `resolveWorld` / `buildBoundaries` / `beatLocal` / `frameFor` signatures identical across `world-timeline.js`, the test, and `main.js`. `createWorld()` returns `{ root, update, markNeedsResize }` — same shape the render loop already iterates for the retired instances. `WORLD_BEATS[].frames` feeds `frameCounts` consistently.
