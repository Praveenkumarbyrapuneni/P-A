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

const heroStage = document.querySelector(".hero-stage");
const sequence = document.querySelector("[data-frame-sequence]");
const canvas = document.querySelector(".sequence-canvas");
const sequenceNotes = sequence
  ? Array.from(sequence.querySelectorAll("[data-sequence-note]"))
  : [];
const storyBridge = document.querySelector("[data-story-bridge]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopHero = window.matchMedia("(min-width: 981px)");

const totalFrames = 240;
const handoffEnd = 0.015;
const framePath = (index) =>
  `assets/phone-scan-2-frames-webp/frame-${String(index).padStart(4, "0")}.webp`;

const frames = new Array(totalFrames + 1);
const loaded = new Set();

let context;
let canvasWidth = 0;
let canvasHeight = 0;
let activeFrame = 1;
let renderedFrame = 0;
let needsResize = true;
let ready = false;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const smooth = (start, end, value) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

function schedule(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 700 });
    return;
  }

  window.setTimeout(() => callback(), 70);
}

function whenNearViewport(element, callback) {
  if (!element) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    callback();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        callback();
      }
    },
    { rootMargin: "1000px 0px" }
  );
  observer.observe(element);
}

function elementProgress(element) {
  if (!element) {
    return 0;
  }

  const rect = element.getBoundingClientRect();
  const travel = Math.max(rect.height - window.innerHeight, 1);
  return clamp(-rect.top / travel);
}

function loadFrame(index) {
  if (index < 1 || index > totalFrames || frames[index]) {
    return frames[index];
  }

  const image = new Image();
  image.decoding = "async";
  image.src = framePath(index);
  image.onload = () => {
    loaded.add(index);
    if (!ready && index === 1) {
      ready = true;
      sequence.classList.add("is-ready");
      drawFrame(index);
    }
  };
  frames[index] = image;
  return image;
}

function preloadInitialFrames() {
  loadFrame(1);

  for (let index = 2; index <= 36; index += 1) {
    loadFrame(index);
  }
}

function preloadRemainingFrames() {
  let index = 37;

  const loadBatch = (deadline) => {
    let count = 0;
    while (
      index <= totalFrames &&
      count < 10 &&
      (!deadline || deadline.timeRemaining() > 6)
    ) {
      loadFrame(index);
      index += 1;
      count += 1;
    }

    if (index <= totalFrames) {
      schedule(loadBatch);
    }
  };

  schedule(loadBatch);
}

function resizeCanvas() {
  if (!canvas || !context) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = Math.max(1, Math.round(rect.width * pixelRatio));
  canvasHeight = Math.max(1, Math.round(rect.height * pixelRatio));

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  needsResize = false;
}

function nearestLoadedFrame(target) {
  if (loaded.has(target)) {
    return target;
  }

  for (let offset = 1; offset < totalFrames; offset += 1) {
    const previous = target - offset;
    const next = target + offset;

    if (previous >= 1 && loaded.has(previous)) {
      return previous;
    }

    if (next <= totalFrames && loaded.has(next)) {
      return next;
    }
  }

  return 1;
}

function drawCover(targetContext, targetWidth, targetHeight, image) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = targetWidth / targetHeight;
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = targetHeight;
    drawWidth = drawHeight * imageRatio;
    drawX = (targetWidth - drawWidth) / 2;
  } else {
    drawWidth = targetWidth;
    drawHeight = drawWidth / imageRatio;
    drawY = (targetHeight - drawHeight) / 2;
  }

  targetContext.clearRect(0, 0, targetWidth, targetHeight);
  targetContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawFrame(index) {
  if (!context || !canvasWidth || !canvasHeight) {
    return;
  }

  const frameIndex = nearestLoadedFrame(index);
  const image = frames[frameIndex];
  if (!image || !image.complete || !image.naturalWidth) {
    return;
  }

  drawCover(context, canvasWidth, canvasHeight, image);
  renderedFrame = frameIndex;
}

function sequenceProgress() {
  if (!sequence) {
    return 0;
  }

  const rect = sequence.getBoundingClientRect();
  const travel = Math.max(rect.height - window.innerHeight, 1);
  return clamp(-rect.top / travel);
}

function updateHeroMediaState() {
  if (!heroStage || !sequence) {
    return;
  }

  if (reduceMotion.matches || !desktopHero.matches) {
    heroStage.style.setProperty("--hero-media-opacity", "1");
    sequence.style.setProperty("--handoff-visibility", "1");
    return;
  }

  // ponytail: fade keyed off the hero shell's own scroll-out, not the scan
  // sequence below it — "What RackTrack Is" now sits between them, and the
  // old rect.top-on-sequence trigger never fired while scrolling that section,
  // leaving the fixed hero photo painted over it the whole way through.
  const heroRect = heroStage.getBoundingClientRect();
  const opacity = clamp(heroRect.bottom / 80);
  heroStage.style.setProperty("--hero-media-opacity", opacity.toFixed(3));

  const rect = sequence.getBoundingClientRect();
  const reveal = 1 - clamp(rect.top / 80);
  sequence.style.setProperty("--handoff-visibility", reveal.toFixed(3));
}

function updateHandoff(progress) {
  const sequenceOpacity = smooth(0, 0.05, progress);
  const bridgeOpacity = 1 - smooth(0, 0.05, progress);

  sequence.style.setProperty("--bridge-opacity", bridgeOpacity.toFixed(3));
  sequence.style.setProperty("--sequence-opacity", sequenceOpacity.toFixed(3));
}

function animationProgress(progress) {
  return clamp((progress - handoffEnd) / (1 - handoffEnd));
}

function updateSequenceNarrative(progress) {
  if (!sequence || !sequenceNotes.length) {
    return;
  }

  const progressAfterHandoff = animationProgress(progress);

  if (reduceMotion.matches) {
    sequence.style.setProperty("--narrative-opacity", "1");
    sequence.style.setProperty("--narrative-y", "0px");
    sequence.style.setProperty("--sequence-note-progress", "1");
    sequenceNotes.forEach((note, index) => {
      note.classList.toggle("is-active", index === 0);
    });
    return;
  }

  const activeIndex = Math.min(
    sequenceNotes.length - 1,
    Math.floor(clamp(progressAfterHandoff * sequenceNotes.length, 0, sequenceNotes.length - 0.001))
  );
  const opacity = smooth(0.035, 0.09, progress) * (1 - smooth(0.96, 1, progress));

  sequence.style.setProperty("--narrative-opacity", opacity.toFixed(3));
  sequence.style.setProperty("--narrative-y", `${((1 - opacity) * 18).toFixed(2)}px`);
  sequence.style.setProperty("--sequence-note-progress", progressAfterHandoff.toFixed(3));
  sequenceNotes.forEach((note, index) => {
    note.classList.toggle("is-active", index === activeIndex);
  });
}

function updateStoryBridge() {
  if (!storyBridge) {
    return;
  }

  const progress = reduceMotion.matches ? 0.72 : elementProgress(storyBridge);
  // Anchor content (headline + first card) is present the instant the section
  // is on screen — it only fades OUT at the very end as it hands to the world.
  // This kills the blank light band at the scan -> bridge seam (was fading in
  // over 2-16%, leaving the viewport empty right after the scan animation).
  const copyOpacity = 1 - smooth(0.9, 1, progress);
  const sourceOpacity = smooth(0, 0.08, progress);
  const threadScale = smooth(0.24, 0.58, progress);
  const layerOpacity = smooth(0.48, 0.72, progress);

  storyBridge.style.setProperty("--bridge-progress", progress.toFixed(3));
  storyBridge.style.setProperty("--bridge-copy-opacity", copyOpacity.toFixed(3));
  storyBridge.style.setProperty("--bridge-copy-y", `${((1 - smooth(0, 0.06, progress)) * 12).toFixed(2)}px`);
  storyBridge.style.setProperty("--bridge-source-opacity", sourceOpacity.toFixed(3));
  storyBridge.style.setProperty("--bridge-thread-scale", threadScale.toFixed(3));
  storyBridge.style.setProperty("--bridge-thread-opacity", (threadScale * 0.9).toFixed(3));
  storyBridge.style.setProperty("--bridge-layer-opacity", layerOpacity.toFixed(3));
  storyBridge.style.setProperty("--bridge-source-x", `${((1 - progress) * -24).toFixed(2)}px`);
  storyBridge.style.setProperty("--bridge-output-x", `${((1 - layerOpacity) * 28).toFixed(2)}px`);
  storyBridge.style.setProperty("--bridge-layers-y", `${((1 - layerOpacity) * 22).toFixed(2)}px`);
}

// Split-layout pinned sequences (Chapter 4 onward): text column + sparse frame
// sequence column. Frame counts are intentionally low (~1 frame per 8-10
// scroll-frames), so unlike the dense 240-frame phone-scan canvas above,
// this draws the two nearest frames and crossfades between them by
// fractional scroll progress instead of hard-snapping — that's what keeps
// a sparse sequence from reading as choppy.
function createPinnedSequence({ root, totalFrames: total, framePath: path }) {
  if (!root) {
    return null;
  }

  const canvasEl = root.querySelector("[data-frame-canvas]");
  const posterEl = root.querySelector("[data-frame-poster]");
  const notes = Array.from(root.querySelectorAll("[data-note]"));

  if (!canvasEl) {
    return null;
  }

  const ctx = canvasEl.getContext("2d", { alpha: false });
  const frameImages = new Array(total + 1);
  const loadedSet = new Set();
  let width = 0;
  let height = 0;
  let instanceNeedsResize = true;
  let rendered = 0;
  let instanceReady = false;
  let smoothedProgress = null;

  function load(index) {
    if (index < 1 || index > total || frameImages[index]) {
      return frameImages[index];
    }

    const image = new Image();
    image.decoding = "async";
    image.src = path(index);
    image.onload = () => {
      loadedSet.add(index);
      if (!instanceReady && index === 1) {
        instanceReady = true;
        root.classList.add("is-ready");
        draw(1);
      }
    };
    frameImages[index] = image;
    return image;
  }

  // These sequences are deliberately small (~3-5MB total, unlike the dense
  // 240-frame phone-scan set) specifically so they can be loaded eagerly
  // instead of trickled in via requestIdleCallback. Idle-callback batching
  // was causing the real "brakes" feeling: it gets starved by the
  // continuous rAF render loop, so fast scrolling could outrun what had
  // loaded and the animation would stall on one frame, then jump once a
  // batch finally landed. Loading everything up front removes that stall.
  function preloadAll() {
    for (let index = 1; index <= total; index += 1) {
      load(index);
    }
  }

  function resize() {
    const rect = canvasEl.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width * pixelRatio));
    height = Math.max(1, Math.round(rect.height * pixelRatio));

    if (canvasEl.width !== width || canvasEl.height !== height) {
      canvasEl.width = width;
      canvasEl.height = height;
    }

    instanceNeedsResize = false;
  }

  function nearestLoaded(target) {
    if (loadedSet.has(target)) {
      return target;
    }

    for (let offset = 1; offset < total; offset += 1) {
      const previous = target - offset;
      const next = target + offset;

      if (previous >= 1 && loadedSet.has(previous)) {
        return previous;
      }

      if (next <= total && loadedSet.has(next)) {
        return next;
      }
    }

    return 1;
  }

  function paint(image, alpha, clear) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let drawX = 0;
    let drawY = 0;

    if (imageRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = drawHeight * imageRatio;
      drawX = (width - drawWidth) / 2;
    } else {
      drawWidth = width;
      drawHeight = drawWidth / imageRatio;
      drawY = (height - drawHeight) / 2;
    }

    if (clear) {
      ctx.clearRect(0, 0, width, height);
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
  }

  function draw(targetFloat) {
    if (!ctx || !width || !height) {
      return;
    }

    const lowTarget = clamp(Math.floor(targetFloat), 1, total);
    const highTarget = clamp(lowTarget + 1, 1, total);
    const frac = clamp(targetFloat - lowTarget);

    const low = nearestLoaded(lowTarget);
    const lowImage = frameImages[low];
    if (!lowImage || !lowImage.complete || !lowImage.naturalWidth) {
      return;
    }

    paint(lowImage, 1, true);

    if (frac > 0.02) {
      const high = nearestLoaded(highTarget);
      if (high !== low) {
        const highImage = frameImages[high];
        if (highImage && highImage.complete && highImage.naturalWidth) {
          paint(highImage, frac, false);
        }
      }
    }

    rendered = targetFloat;
  }

  function updateNotes(progress) {
    if (!notes.length) {
      return;
    }

    if (reduceMotion.matches) {
      root.style.setProperty("--note-opacity", "1");
      root.style.setProperty("--note-y", "0px");
      root.style.setProperty("--note-progress", "1");
      notes.forEach((note, index) => note.classList.toggle("is-active", index === 0));
      return;
    }

    // Notes activate at explicit scroll-progress thresholds (data-at) tied to
    // real clip boundaries, not equal thirds - keeps the text in sync with
    // what the animation is actually showing at that point.
    let activeIndex = 0;
    notes.forEach((note, index) => {
      const at = parseFloat(note.dataset.at || "0");
      if (progress >= at) {
        activeIndex = index;
      }
    });

    const opacity = smooth(0.02, 0.08, progress) * (1 - smooth(0.96, 1, progress));
    root.style.setProperty("--note-opacity", opacity.toFixed(3));
    root.style.setProperty("--note-y", `${((1 - opacity) * 18).toFixed(2)}px`);
    root.style.setProperty("--note-progress", progress.toFixed(3));
    notes.forEach((note, index) => note.classList.toggle("is-active", index === activeIndex));
  }

  function update() {
    const wasResized = instanceNeedsResize;
    if (instanceNeedsResize) {
      resize();
    }

    // Raw scroll position moves in whatever-sized jumps the input device
    // gives it (wheel ticks, trackpad momentum), and with only ~1
    // frame per 8-10 scroll-frames, mapping that 1:1 to the frame target
    // reads as jerky even with crossfade blending - blending softens the
    // image transition, not the timing of when it happens. Easing the
    // progress value itself toward the raw target each tick is what
    // produces the actual "butter smooth" feel.
    let progress;
    if (reduceMotion.matches) {
      progress = 0.86;
      smoothedProgress = progress;
    } else {
      const rawProgress = elementProgress(root);
      smoothedProgress = smoothedProgress === null
        ? rawProgress
        : smoothedProgress + (rawProgress - smoothedProgress) * 0.16;
      progress = smoothedProgress;
    }

    updateNotes(progress);

    const frameOpacity = reduceMotion.matches ? 1 : smooth(0, 0.05, progress);
    root.style.setProperty("--frame-opacity", frameOpacity.toFixed(3));

    const targetFloat = clamp(1 + progress * (total - 1), 1, total);
    if (Math.abs(targetFloat - rendered) > 0.01 || wasResized) {
      draw(targetFloat);
    }
  }

  function markNeedsResize() {
    instanceNeedsResize = true;
  }

  if (posterEl) {
    posterEl.src = path(1);
  }

  resize();
  draw(1);

  whenNearViewport(root, preloadAll);

  return { root, update, markNeedsResize };
}

// One continuous world: all five beats welded into a single pinned stage
// driven by one scroll progress, crossfading across sequence boundaries so
// the screen is never blank at a seam. Replaces the five separate
// createPinnedSequence instances. (createPinnedSequence above is now unused;
// it is removed in the Batch 2 main.js rework — kept this batch to keep the
// diff surgical.)
function createWorld() {
  const root = document.querySelector("[data-world]");
  if (!root) return null;

  const canvasEl = root.querySelector(".world-canvas");
  const poster = root.querySelector(".world-poster");
  const beatEls = Array.from(root.querySelectorAll(".world-beat"));
  const notesByBeat = beatEls.map((el) => Array.from(el.querySelectorAll("[data-note]")));
  if (!canvasEl) return null;

  const ctx = canvasEl.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const frameCounts = WORLD_BEATS.map((b) => b.frames);
  const boundaries = buildBoundaries(frameCounts);

  // one image cache per beat
  const images = WORLD_BEATS.map((b) => new Array(b.frames + 1));
  const loadedFrames = WORLD_BEATS.map(() => new Set());

  let width = 0, height = 0, needsWorldResize = true, worldReady = false;
  let smoothed = null;

  function load(beat, index) {
    if (index < 1 || index > WORLD_BEATS[beat].frames || images[beat][index]) {
      return images[beat][index];
    }
    const img = new Image();
    img.decoding = "async";
    img.src = worldFramePath(WORLD_BEATS[beat].dir, index);
    img.onload = () => {
      loadedFrames[beat].add(index);
      if (!worldReady && beat === 0 && index === 1) {
        worldReady = true;
        root.classList.add("is-ready");
      }
    };
    images[beat][index] = img;
    return img;
  }

  function preloadAll() {
    WORLD_BEATS.forEach((b, beat) => {
      for (let i = 1; i <= b.frames; i += 1) load(beat, i);
    });
  }

  function nearestLoaded(beat, target) {
    if (loadedFrames[beat].has(target)) return target;
    const max = WORLD_BEATS[beat].frames;
    for (let off = 1; off < max; off += 1) {
      if (target - off >= 1 && loadedFrames[beat].has(target - off)) return target - off;
      if (target + off <= max && loadedFrames[beat].has(target + off)) return target + off;
    }
    return 1;
  }

  function resize() {
    const rect = canvasEl.getBoundingClientRect();
    // ponytail: source frames cap at 1280x720, so a 2x retina backing store
    // just upscales the blur further with no real detail gained — cap at 1x.
    const pr = Math.min(window.devicePixelRatio || 1, 1);
    width = Math.max(1, Math.round(rect.width * pr));
    height = Math.max(1, Math.round(rect.height * pr));
    if (canvasEl.width !== width || canvasEl.height !== height) {
      canvasEl.width = width; canvasEl.height = height;
    }
    needsWorldResize = false;
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
    beatEls.forEach((el, bi) => el.classList.toggle("is-current", bi === active.beat));
    const notes = notesByBeat[active.beat];
    notes.forEach((note, ni) => {
      const at = parseFloat(note.dataset.at || "0");
      const nextAt = ni + 1 < notes.length
        ? parseFloat(notes[ni + 1].dataset.at || "1") : 1.01;
      note.classList.toggle("is-active", active.local >= at && active.local < nextAt);
    });
  }

  function update() {
    if (needsWorldResize) resize();
    const raw = reduceMotion.matches ? 0.5 : clamp(elementProgress(root));
    smoothed = smoothed === null ? raw : smoothed + (raw - smoothed) * 0.16;
    const { layers, active } = resolveWorld(smoothed, boundaries, frameCounts);
    root.style.setProperty("--world-opacity", smooth(0, 0.03, smoothed).toFixed(3));
    root.style.setProperty("--world-progress", smoothed.toFixed(4));
    drawPlan(layers);
    updateNotes(active);
  }

  if (poster) poster.src = worldFramePath(WORLD_BEATS[0].dir, 1);
  resize();
  whenNearViewport(root, preloadAll);
  return { root, update, markNeedsResize: () => { needsWorldResize = true; } };
}

const world = createWorld();
const worldSequences = [world].filter(Boolean);

// Ambient particle field across the world stage — fills the space with life,
// drifts, links nearby points (a quiet nod to network topology), and eases
// toward the cursor. NOT drawn on the frames; it is the environment around
// them. Light scan-blue on the light-glass ground.
function updateHeaderState() {
  if (!sequence) {
    return;
  }

  const sequenceRect = sequence.getBoundingClientRect();
  const bridgeRect = storyBridge ? storyBridge.getBoundingClientRect() : null;
  const sequenceActive =
    sequenceRect.top < window.innerHeight * 0.22 && sequenceRect.bottom > window.innerHeight * 0.42;
  const bridgeActive = bridgeRect
    ? bridgeRect.top < window.innerHeight * 0.18 && bridgeRect.bottom > window.innerHeight * 0.5
    : false;
  const pinnedActive = worldSequences.some(({ root }) => {
    const rect = root.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.22 && rect.bottom > window.innerHeight * 0.42;
  });

  document.body.classList.toggle("is-sequencing", sequenceActive || bridgeActive || pinnedActive);
}

function renderLoop() {
  const resized = needsResize;
  if (needsResize) {
    resizeCanvas();
  }

  updateHeaderState();
  updateHeroMediaState();
  updateStoryBridge();
  worldSequences.forEach((seq) => seq.update());

  const progress = sequenceProgress();
  updateSequenceNarrative(progress);

  if (reduceMotion.matches) {
    activeFrame = Math.round(totalFrames * 0.62);
    sequence.style.setProperty("--handoff-visibility", "1");
    sequence.style.setProperty("--bridge-opacity", "0");
    sequence.style.setProperty("--sequence-opacity", "1");
  } else {
    updateHandoff(progress);
    activeFrame = clamp(Math.round(1 + animationProgress(progress) * (totalFrames - 1)), 1, totalFrames);
  }

  const loadedFrame = nearestLoadedFrame(activeFrame);
  if (loadedFrame !== renderedFrame || resized) {
    drawFrame(activeFrame);
  }

  window.requestAnimationFrame(renderLoop);
}

if (sequence && canvas) {
  context = canvas.getContext("2d", { alpha: false });
  resizeCanvas();
  renderLoop();
  whenNearViewport(sequence, () => {
    preloadInitialFrames();
    preloadRemainingFrames();
  });

  window.addEventListener("resize", () => {
    needsResize = true;
    worldSequences.forEach((seq) => seq.markNeedsResize());
  }, { passive: true });
}

updateStoryBridge();

// Proof tour — a click-driven walkthrough (floor plan → row → cabinet →
// device → cable trace → reconciled record), ported from the old site.
// ponytail: dropped that version's hotspot-click-to-drill-in and per-port
// inspector — neither was actually wired to markup there (dead CSS/JS
// referencing elements that don't exist), so this rebuilds only the parts
// that really worked: crumb + counter + tooltip driven by Prev/Next.
// Each step's tooltip text, plus the (x%, y%) of the exact thing it's
// pointing at — read directly off the highlight box each SVG already
// draws for that step (its coordinates / 1600x900 viewBox), not guessed.
// Step 5 (reconciled record) has no single point of interest, so it's null
// and the pointer/callout hide on that step, matching the reference site.
const TOUR_STEPS = [
  { tip: "Every cabinet on the floor, placed and counted from a single sweep. Open Row B - Cabinet 06.", x: 45.06, y: 41.78 },
  { tip: "Row B holds 12 cabinets, all swept and counted. Open Cabinet 06 to see what's inside.", x: 39.25, y: 37.77 },
  { tip: "Every device in B-06, read straight from the sweep - 42U, front elevation, door open. Open Switch 3 for its full spec sheet.", x: 40.63, y: 35.56 },
  { tip: "A full device record from one frame of the sweep - model, ports, and mounting, no manual entry. Trace port Eth1/14 to its neighbor.", x: 49.59, y: 50.56 },
  { tip: "Eth1/14 traced physically to SPINE-02 - a path CMDB never had to guess at. Reconcile it against the record.", x: 62.69, y: 42.0 },
  { tip: "Swept reality checked against CMDB, with every delta flagged for review.", x: null, y: null },
];

function initProofTour() {
  const root = document.querySelector("[data-proof-tour]");
  if (!root) return;

  const views = root.querySelectorAll(".tour-view");
  const crumbs = root.querySelectorAll(".tour-crumb");
  const count = root.querySelector("#tour-count");
  const point = root.querySelector("#tour-point");
  const action = root.querySelector("#tour-action");
  const step = root.querySelector("#tour-cue-step");
  const prev = root.querySelector("#tour-prev");
  const next = root.querySelector("#tour-next");
  const total = views.length;
  const pad = (n) => (n < 10 ? "0" : "") + n;

  let at = 0;

  function show(i) {
    at = Math.max(0, Math.min(total - 1, i));
    [views, crumbs].forEach((set) => {
      set.forEach((el, k) => el.classList.toggle("is-active", k === at));
    });
    const { tip, x, y } = TOUR_STEPS[at];
    count.textContent = `${pad(at + 1)} / ${pad(total)}`;
    action.textContent = tip;
    step.textContent = `${at + 1} / ${total}`;
    prev.disabled = at === 0;
    next.disabled = at === total - 1;

    point.classList.toggle("is-hidden", x === null);
    if (x !== null) {
      point.style.setProperty("--point-x", `${x}%`);
      point.style.setProperty("--point-y", `${y}%`);
    }
  }

  prev.addEventListener("click", () => show(at - 1));
  next.addEventListener("click", () => show(at + 1));
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(at - 1);
    if (event.key === "ArrowRight") show(at + 1);
  });

  show(0);
}

initProofTour();
