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
