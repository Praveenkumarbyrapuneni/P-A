import assert from "node:assert/strict";
import {
  clamp, buildBoundaries, beatLocal, frameFor, resolveWorld,
} from "../js/world-timeline.js";

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
