# RackTrack Homepage Storyboard And Asset Plan

## Purpose

This document locks the homepage direction before generating more visual assets.

RackTrack's homepage should explain the business to investors and enterprise buyers through one continuous product story:

> From unknown physical rack reality to verified infrastructure intelligence.

The homepage is not a normal static SaaS page. It is a scroll-driven narrative where each chapter explains one layer of RackTrack's product value.

## What We Have Built So Far

### Completed

1. **Hero first fold**
   - Uses `assets/Verified Rack Object.jpeg`.
   - Accepted visual direction: Verified Rack Object.
   - No people, no phone in the first fold, no watermarked generated video.
   - Locked copy:
     - Eyebrow: `Physical infrastructure intelligence for data centers`
     - Headline: `One phone sweep. Verified rack truth.`
     - Supporting line: `Inventory, ports, cables, topology, and audit evidence reconciled from physical rack reality.`
     - CTA: `Get a demo`

2. **The Scan**
   - Source video: `assets/phone-scan-2.mp4`
   - Live frame sequence: `assets/phone-scan-2-frames-webp/`
   - Implementation: pinned canvas scroll scrub in `main.js`.
   - Message: a guided phone sweep captures devices, labels, rack units, visible ports, and cable evidence.

3. **Post-scan explanation bridge**
   - Message: `Captured facts. Ready to verify.`
   - Visual direction: lightweight tilted evidence cards (phone scan frame, rack-exploded model image, `assets/evidence-record.jpg`).
   - Approved. (One bug found and fixed post-approval: the first card, "Phone sweep," was wired to the same CSS variable as the headline's fade-out and disappeared on scroll. Fixed with a dedicated `--bridge-source-opacity` variable in `main.js`/`styles.css`.)

4. **Rack-Open (Chapter 4)** — built and accepted. Split-layout (text left, animation right). Two clips stitched into one 131-frame sequence at `assets/rack-open-frames-webp/`: Clip 1 (`assets/rack-open-01.mp4`, intact→exploded) + Clip 2 (`assets/chapter4-clip2-clean.mp4`, exploded→evidence cards). Full asset brief and build notes below under Chapter 4.

5. **Cable Truth (Chapter 5)** — built and accepted. Same split-layout pattern. 76-frame sequence at `assets/cable-truth-frames-webp/`, source `assets/chapter5-clean.mp4`.

6. **Reconciliation Layer (Chapter 6)** — built and accepted. 52-frame sequence at `assets/reconciliation-frames-webp/`, source `assets/chapter-6.mp4`.

7. **Data Center Scale (Chapter 7)** — built and accepted. 54-frame sequence at `assets/scale-frames-webp/`, source `assets/chapter-7.mp4`. End frame was `assets/frame-3.jpeg`, an already-generated still found unused in `assets/` that fit the brief almost exactly.

8. **Enterprise Outcomes (Chapter 8)** — built and accepted. 57-frame sequence at `assets/outcomes-frames-webp/`, source `assets/chapter-8.mp4`.

### Remaining

**Chapter 9 (Final CTA)** is the only unbuilt chapter. No video needed — it's a static return to `assets/Verified Rack Object.jpeg` (same asset as Chapter 1) with the CTA as live HTML/CSS, same pattern as the hero. No asset brief required.

### Current Next Build

Build Chapter 9 directly (no generation step needed) to complete the homepage.

Use a small breathing gap or short HTML/CSS transition bridge when a new beat needs visual separation.

### Site Architecture Notes (how Chapters 4-8 actually got wired)

- **CSS**: all five split-layout chapters (4-8) share one class set — `.split-story`, `.split-pin`, `.split-visual`, `.split-poster`, `.split-canvas`, `.split-narrative`, `.split-note` — in `styles.css`. Per-chapter scroll length (`min-height`) is set via each chapter's own `data-X-sequence` attribute selector. (Originally Ch4/Ch5 had their own duplicated `.rack-open-*`/`.cable-truth-*` class sets; consolidated once a 3rd chapter would have made it a 3rd copy.)
- **JS**: one `createPinnedSequence()` factory in `main.js` handles every split-layout chapter — loading, resizing, crossfade-blending between sparse frames, and note-syncing via `data-at` scroll-progress thresholds. It also does scroll-progress smoothing (lerp toward raw scroll position each frame) and eager frame loading (not idle-callback trickled) — both were fixes for a reported "feels like wearing brakes" issue, and apply automatically to every chapter built on this factory.
- Chapter 2 (phone-scan) is a separate, older, dense-frame-sequence code path, intentionally left as-is.

## Technical Stack

### Website Implementation Stack

- Plain static frontend:
  - `index.html`
  - `styles.css`
  - `main.js`
- Local preview:
  - `http://127.0.0.1:5174/`
- Animation delivery:
  - MP4 source video stored in `assets/`
  - Extracted frame sequences
  - WebP live frames for browser performance
  - Scroll-scrubbed pinned canvas sections
- Editable product explanation:
  - All business copy, labels, callouts, CTAs, and proof numbers stay in HTML/CSS.
  - Do not bake large text labels into generated images or videos.

### Visual Generation Stack

Use this pipeline for every new motion chapter:

1. **Gemini Nano Banana Pro**
   - Use for high-quality still image exploration, visual references, lighting, material direction, and source concepts.
   - Best for creating crisp reference images before building motion.

2. **Google Whisk**
   - Use for start frame and end frame generation.
   - Build precise keyframes that match the current RackTrack visual system.
   - Use the existing Verified Rack Object and prior chapter frames as visual references where possible.

3. **Google Flow**
   - Use the approved Whisk start and end frames to generate smooth chapter video.
   - Motion should be controlled, cinematic, and explanatory.
   - Avoid random camera movement that does not explain the product.

4. **Frame Extraction And Conversion**
   - Save the source MP4 in `assets/`.
   - Extract frames only after the video is approved.
   - Convert live browser sequence to WebP.
   - Add a separate scroll-scrubbed chapter in `index.html`, `styles.css`, and `main.js`.

### Visual Continuity Rules

- A new chapter does not have to start from the exact last frame of the previous chapter when the chapters are not directly connected.
- Use small gaps or short transition bridges to give the page breathing room between major ideas.
- Keep continuity through the RackTrack visual system: light infrastructure glass palette, verified blue accents, semantic green and amber states, precise rack/topology language, and enterprise-grade restraint.
- The visuals do not need to be literal real-life servers. Use premium product-rendered infrastructure objects when they explain the concept more clearly.
- Every element still needs to connect to the data center infrastructure niche: racks, patch panels, ports, cable paths, topology, telemetry, audit evidence, capacity, and reconciliation.
- Avoid visuals that are merely abstract. The viewer should understand why the image belongs to RackTrack.

### Layout Direction (Chapter 4 onward)

Starting at Chapter 4, pinned scroll chapters move from full-bleed canvas + floating overlay caption to a real two-column split: text column (left) + pinned animation column (right, ~50% width). Chapters 1-2 (hero, scan) stay full-bleed as already accepted — this only applies going forward.

Why: at half-page width the frame sequence doesn't need full-bleed resolution to look sharp, and text no longer has to fight for legibility over moving video — it sits in its own solid column. `styles.css` already has the `.rack-open-*` scaffold for this (canvas, narrative card, notes) from an earlier pass; it needs restructuring from overlay-card to two real grid columns, not a rewrite — the scroll-progress/note-swapping engine in `main.js` (`rackNotes`, `updateRackNarrative`) is reused as-is.

Content for the text column should be drawn from real RackTrack product copy, not invented — see `/Users/praveen/Desktop/Racktrack_Website/docs/RackTrack-Website-Content.md`, particularly section 4.4 "Six Intelligence Surfaces" (Perceive/Cognize/Connect/Twin/Reconcile/Posture) and section 4.3 "3D Topology," which already describe RackTrack's own exploded-rack-with-light-beams visual and map cleanly onto this storyboard's existing chapters:

| Framework surface | Storyboard chapter |
|---|---|
| Perceive | Ch2 The Scan |
| Cognize | Ch4 Rack-Open |
| Connect | Ch5 Cable Truth Moment |
| Reconcile | Ch6 Reconciliation Layer |
| Twin | no dedicated beat — folds into Ch5's orbit as a topology reveal |
| Posture | folded into one of Ch8's six outcome panels |

Decision: keep this storyboard's existing chapter names/order (already locked, better copy than the generic framework names) — use the framework doc only as a source of real language for each chapter's text column, not as a restructuring template.

## Locked Homepage Narrative

### Chapter 1: Hero

**Message**

RackTrack turns one phone sweep into verified rack truth.

**Visual**

Accepted static Verified Rack Object. Light infrastructure glass palette.

**Investor takeaway**

This is a physical infrastructure intelligence platform, not another dashboard or audit services page.

**Current status**

Built and accepted.

### Chapter 2: The Scan

**Message**

The phone captures rack reality: devices, ports, labels, rack units, LEDs, and visible cable evidence.

**Visual**

Scroll-scrubbed phone scan frame sequence.

**Investor takeaway**

The product starts from physical evidence, not stale records.

**Current status**

Built and accepted.

### Chapter 3: Post-Scan Explanation Bridge

**Message**

The scan is not the product by itself. RackTrack extracts useful infrastructure facts from the scan: device identity, rack position, labels, visible ports, cable observations, and evidence.

**Visual**

A short live HTML/CSS bridge after the scan. Use a calm breathing gap and editable labels. Do not make this a normal SaaS feature section.

**Investor takeaway**

RackTrack converts phone capture into structured physical infrastructure evidence.

**Current status**

Built and accepted.

### Chapter 4: The Rack Model / Rack Opens

**Message**

The scan becomes a structured rack model: chassis, devices, rack units, ports, labels, evidence, and open capacity.

**Visual**

Scroll-scrubbed rack-open frame sequence.

**Investor takeaway**

RackTrack converts unstructured rack imagery into machine-usable infrastructure data.

**Current status**

Built and accepted. Split-layout (text left / animation right) wired in `main.js`/`styles.css`/`index.html`. 131-frame sequence at `assets/rack-open-frames-webp/`.

Build note (done): crossfade blending between the two nearest frames (canvas `globalAlpha`) plus scroll-progress lerp smoothing were both added in the shared `createPinnedSequence()` factory in `main.js` — see Site Architecture Notes above.

**Locked shot plan (3-beat arc within this one chapter):**

1. Rack opens: intact rack (glass case, closed) → exploded, labeled parts. Built: `assets/rack-open-01.mp4` (source: `v0.mp4`, watermark removed → `v0-clean.mp4`, reversed so it plays intact→exploded, then trimmed to 0-6.8s). The full reversed clip actually oscillated — closed→explode→**closed again→explode again** within its 10s, an artifact the original 3-point sample (0/5/9s) missed. Frame-by-frame check found the collapse happens between 7.0-7.5s, so it's trimmed to 6.8s to keep only the clean single opening motion. Buggy full-length version kept at `assets/rack-open-01-untrimmed-buggy.mp4` for reference, not for use.
2. Parts labeled (hold): the end state of clip 1. No separate clip — this is clip 1's last frame, `assets/rack-open-01-endframe.png`.
3. Evidence cards manifest: exploded parts draw back into the rack while translucent evidence-card panels fade in on both sides, connected by thin verified-blue trace lines. Built: `assets/chapter4-clip2-clean.mp4` (source `chapter4-clip2.mp4`, watermark removed). Brief that produced it is below, kept as reference.

#### Asset Brief: Clip 2 ("Evidence Cards Manifest")

Both keyframes already exist — no new Whisk generation needed for this clip.

**Start frame (already have):** `assets/rack-open-01-endframe.png` — exact last frame of clip 1, for seamless continuity. Note: this frame has AI-garbled illegible label text baked in from the Flow generation (a known cosmetic artifact); acceptable since real labels will be added as live HTML/CSS, not baked text.

**End frame (already have):** `assets/explode-end.png` — assembled rack with translucent evidence-card panels on both sides, connected to specific rack-unit positions by thin light-blue trace lines and small dot markers.

**Google Flow Motion Prompt:**

```
Generate a smooth cinematic product animation from the start frame to the end frame.

The exploded rack components — chassis top plate, modular fans, network
switches, drives, cabling harness, glass side panels, power supplies, and
backplane — draw back together smoothly into the assembled rack frame. As
they converge, thin verified-blue trace lines extend outward from specific
rack-unit positions on the assembled rack toward both sides of the frame.
Translucent evidence-card panels fade in at the end of each trace line,
each connected by a small glowing dot marker at its rack-unit origin. The
motion should feel like scattered evidence resolving into one verified,
structured object. Camera holds a steady, slightly wide angle so both side
card panels are fully visible as they form. Keep the scene bright, premium,
and technical — light infrastructure glass palette (cloud white, mist blue,
pale steel, deep ink, verified blue, scan blue).

No people, no hands, no phones, no dashboards, no baked large text, no
logos, no watermarks, no purple gradients, no black cyberpunk background,
no generic AI spheres, no chaotic cabling, no distorted rack geometry.
Leave the evidence-card panels visually blank/abstract (thin lines and
placeholder blocks only) — real labels get added as live HTML/CSS after
extraction, not baked into the video.
```

**Reference images to upload alongside the prompt (for style/continuity lock):** `assets/Verified Rack Object.jpeg`, `assets/rack-open-01-endframe.png`, `assets/explode-end.png`.

**Acceptance criteria:**

- Starts visually identical to `rack-open-01-endframe.png` (no jump cut from clip 1).
- Ends visually close to `explode-end.png`'s structure (card panel positions, trace-line style).
- No baked business labels — card panels stay blank/abstract.
- No people, phones, logos, or watermarks.
- Crisp enough for laptop-first presentation.
- Once generated: check for the Gemini sparkle watermark (bottom-right-ish, small 4-point white mark) before extracting frames — same `delogo` fix as clip 1 if present.

### Chapter 5: Cable Truth Moment

**Message**

Visual observations are checked against live network signals like CDP, LLDP, ARP, and neighbor data.

**Transition**

Add a small breathing gap after the rack model explanation before the next pinned animation. This can be a short bridge that prepares the buyer for cable and topology truth.

**Visual Direction**

- Follow from the opened rack conceptually, but do not force exact frame continuity if a cleaner start frame explains the chapter better.
- Camera orbits slightly or moves behind the rack.
- Cable paths become the focus.
- Verified paths trace through patch panels and switches.
- Verified paths turn green.
- Use amber only for one meaningful drift or mismatch.
- Keep the environment bright, clean, and premium.
- Leave room for live HTML/CSS labels.

**Editable Labels To Add In Code**

- `Physical path detected`
- `LLDP neighbor match`
- `CDP / ARP confirmation`
- `CMDB delta found`
- `Path verified`

**Investor takeaway**

RackTrack is not only recognizing hardware. It verifies physical-to-logical connectivity and exposes topology drift.

**Current status**

Built and accepted. Split-layout wired the same way as Chapter 4. 76-frame sequence at `assets/cable-truth-frames-webp/`. `v1.mp4` + its keyframes remain unused/superseded.

#### Asset Brief: Chapter 5 Video

Both keyframes already exist in `assets/` — no new Whisk generation needed.

**Start frame (already have):** `assets/explode-end.png` — same image used as Clip 2's target end-frame, for continuity from Chapter 4 into Chapter 5. Assembled rack, translucent evidence-card panels on both sides, thin verified-blue trace lines.

**End frame (already have):** `assets/frame-4.jpeg` — assembled rack with brighter, more detailed translucent panels (bar charts, wave graph, port-status grid) connected by glowing cyan/green cable traces directly to ports, small green dot markers on the floor. Matches the "connectivity intelligence" escalation from simple evidence cards to richer telemetry panels. Note: this reference is all-green — the Flow prompt below explicitly asks for one amber trace since the source image doesn't show one.

**Google Flow Motion Prompt:**

```
Generate a smooth cinematic product animation from the start frame to the
end frame.

The camera begins on the assembled rack with its simple translucent
evidence-card panels and slowly orbits slightly, moving just enough to
reveal cable paths and topology relationships. As the camera moves, the
evidence-card panels evolve into richer telemetry panels — small bar
charts, a signal/wave graph, a port-status grid — connected to specific
ports by glowing cable traces. Most traces resolve into verified green;
one single trace resolves into amber instead, as a drift or mismatch
signal, near one port only. Small glowing dot markers appear at the floor
level. The animation should feel like a premium B2B infrastructure product
story — evidence becoming verified connectivity intelligence. Motion must
be stable, crisp, and explanatory, not sci-fi or dramatic.

Keep the scene bright with light infrastructure glass styling. Maintain
rack geometry, port detail, and clean negative space for live website
labels. Do not add people, phones, baked dashboard text, logos,
watermarks, dark cyberpunk lighting, purple gradients, floating orbs,
random particles, or chaotic cable bundles. Leave panel interiors mostly
abstract/placeholder (chart shapes, not real numbers) — real labels get
added as live HTML/CSS after extraction.
```

**Reference images to upload alongside the prompt:** `assets/explode-end.png`, `assets/frame-4.jpeg`, `assets/Verified Rack Object.jpeg`.

**Acceptance criteria:**

- Starts visually close to `explode-end.png` (continuity from Chapter 4).
- Ends with clear verified (green) cable/topology paths plus exactly one amber drift trace.
- No baked business labels — panels stay abstract/placeholder.
- No people, phones, logos, or watermarks — check for the Gemini sparkle mark specifically (same `delogo` fix as Clip 1 if present) before extracting frames.
- Crisp enough for laptop-first presentation at half-page display width (see layout note below).

### Chapter 6: Reconciliation Layer

**Message**

Rack truth is reconciled against the systems enterprise teams already use.

**Visual Direction**

- The opened rack becomes clean structured planes.
- Planes should represent CMDB, DCIM, asset records, security scope, and audit evidence.
- Use clean system layers, not fake dashboards.
- Show mismatches resolving into a verified model.

**Claims To Use**

- `40-60% truth decay`
- `3-6 weeks audit exposure`
- `20-40 min response latency`

**Investor takeaway**

RackTrack sits under CMDB, DCIM, security, audit, and operations as the physical truth layer.

**Status**

Built and accepted. 52-frame sequence at `assets/reconciliation-frames-webp/`, source `assets/chapter-6.mp4` (end frame `assets/chapter6-endframe.jpeg`). Wired the same split-layout way as Chapters 4-5.

#### Asset Brief: Chapter 6 Video (used to generate the above)

**Start frame (already have):** `assets/cable-truth-frames-webp/frame-0076.webp` — Chapter 5's actual final frame (assembled rack, telemetry panels, verified green paths + one amber trace), for continuity.

**End frame:** needs a new Whisk generation — no existing asset fits. Prompt:

```
A single data center rack in a light infrastructure glass environment,
viewed from a similar angle to the reference image. The rack itself
resolves into several clean, flat, translucent planes floating just
behind and beside it, each representing a different system: one plane
suggests a CMDB record layout (simple field-label rows), one suggests a
DCIM floor-plan view (simple grid), one suggests an asset register (a
simple list), one suggests a security/compliance scope (a simple
shield-outline icon with checklist lines), one suggests audit evidence
(a simple document-stack icon). One plane shows a small red or amber
mismatch mark resolving into green as if just reconciled. Planes are
abstract and geometric, not literal software screenshots - simple
shapes, thin outlines, soft glass-panel fill, no real text or numbers.
Bright, premium, clean, light infrastructure glass palette (cloud white,
mist blue, pale steel, deep ink, verified blue, scan blue, verified
green, drift amber used sparingly). Leave clear negative space around
the rack for live website labels.

No people, no hands, no phones, no real dashboard screenshots, no big
text, no logos, no watermarks, no purple gradients, no black cyberpunk
background, no generic AI spheres, no chaotic cable piles, no distorted
rack geometry.
```

**Google Flow Motion Prompt:**

```
Generate a smooth cinematic product animation from the start frame to the
end frame.

The rack, still showing its verified cable/telemetry state, begins to
project clean flat translucent planes outward - each plane represents a
different operational system (CMDB, DCIM, asset register, security
scope, audit evidence). One plane briefly shows a small mismatch mark in
amber, then resolves to verified green as the planes settle into a
calm, organized arrangement around the rack. Motion is slow, confident,
and explanatory - like scattered records converging into one verified
source of truth, not a dashboard powering on. Camera holds mostly
steady with a very slight push-in.

Keep the scene bright with light infrastructure glass styling. Leave
clean negative space for live website labels. Do not add people, phones,
real dashboard UI, large baked text, logos, watermarks, dark cyberpunk
lighting, purple gradients, floating orbs, random particles, or chaotic
cable bundles.
```

**Reference images to upload:** `assets/cable-truth-frames-webp/frame-0076.webp`, `assets/explode-end.png` (for the translucent-plane visual language established in Ch4/5), `assets/Verified Rack Object.jpeg`.

**Acceptance criteria:**

- Starts visually close to Chapter 5's actual end frame.
- Planes read as CMDB/DCIM/asset/security/audit concepts without baked text.
- One clear amber-to-green resolve moment (mismatch becoming verified).
- No people, phones, logos, watermarks — check for the Gemini sparkle mark before extracting frames.
- Crisp at half-page display width.

### Chapter 7: Data Center Scale

**Message**

Start with one rack. Build toward continuous infrastructure intelligence across the footprint.

**Visual Direction**

- Pull back from one verified rack to a rack row.
- Then expand to multiple rows or a data hall footprint.
- Verified racks light up softly.
- Avoid dark server-room drama.

**Investor takeaway**

The product can expand from a single rack assessment to site-wide operational intelligence.

**Status**

Built and accepted. 54-frame sequence at `assets/scale-frames-webp/`, source `assets/chapter-7.mp4` (end frame confirmed matching `assets/frame-3.jpeg`; actual last frame saved as `assets/chapter7-endframe.jpeg` for Chapter 8's continuity). Wired the same split-layout way as Chapters 4-6.

#### Asset Brief: Chapter 7 Video (used to generate the above)

**End frame (already have):** `assets/frame-3.jpeg` — an already-generated, previously-unused still: a light-toned row of multiple racks with glowing cyan/green verified traces flowing along the floor between them, one amber-orange highlight visible. Matches this chapter's brief almost exactly (light palette, verified racks lighting up, no dark drama).

**Start frame:** use Chapter 6's end frame (once generated) for continuity — the single reconciled rack with its CMDB/DCIM/asset planes settled around it.

**Google Flow Motion Prompt:**

```
Generate a smooth cinematic product animation from the start frame to the
end frame.

The camera begins close on the single verified rack with its
reconciliation planes, then pulls back steadily. As it pulls back, the
reconciliation planes fade away and more racks fade into view on either
side, forming a row. Each additional rack softly lights up in verified
blue/green as it comes into frame, as if being confirmed one at a time.
The camera continues pulling back until the full row of racks is
visible, matching the end frame's composition. Motion is slow, smooth,
and confident - an expansion, not a rush. Keep the environment bright
and clean throughout, never dark or dramatic.

Keep the scene in light infrastructure glass styling throughout the
pull-back. Do not add people, phones, dashboards, large baked text,
logos, watermarks, dark cyberpunk lighting, purple gradients, floating
orbs, or random particles.
```

**Reference images to upload:** `assets/frame-3.jpeg`, Chapter 6's generated end frame, `assets/Verified Rack Object.jpeg`.

**Acceptance criteria:**

- Ends visually matching `frame-3.jpeg`'s row composition and lighting.
- Racks light up progressively during the pull-back, not all at once.
- Stays bright/light throughout — no dark server-room mood at any point.
- No people, phones, logos, watermarks — check for the Gemini sparkle mark before extracting frames.

### Chapter 8: Enterprise Outcomes

**Message**

Every team works from the same verified source of physical infrastructure truth.

**Visual Direction**

Show outcome panels emerging from the verified model. These should feel like operational evidence surfaces, not generic fake dashboards.

**Panels**

- Capacity intelligence
- Connectivity intelligence
- Compliance evidence
- Procurement reconciliation
- Vulnerability posture
- Incident location

**Investor takeaway**

The same verified model creates value across multiple enterprise workflows and buying centers.

**Status**

Built and accepted. 57-frame sequence at `assets/outcomes-frames-webp/`, source `assets/chapter-8.mp4` (end frame `assets/chapter8-endframe.jpeg`, start frame `assets/chapter7-endframe.jpeg`). Wired the same split-layout way as Chapters 4-7. This was the last chapter needing a generated video — only Chapter 9 (static, no video) remains.

#### Asset Brief: Chapter 8 Video (used to generate the above)

**Start frame:** Chapter 7's end frame (the full row of verified racks, `frame-3.jpeg`-style).

**End frame:** needs a new Whisk generation — no existing asset fits six distinct outcome panels. Prompt:

```
The data center row from the reference image resolves back toward a
single focused verified rack in the light infrastructure glass
environment. Around it, six distinct translucent panel shapes float in
a calm arrangement, each visually distinct so they read as different
categories without needing text: a capacity panel (simple fill-level
bars), a connectivity panel (a small node-and-line network diagram), a
compliance panel (a shield outline with a checkmark), a procurement
panel (a simple matching-pair/reconciliation icon), a vulnerability
panel (a small warning-triangle outline), and an incident-location panel
(a simple pin-on-a-grid icon). All panels are abstract, geometric, thin-
outlined, softly glass-filled - not literal dashboard screenshots. Bright,
premium, light infrastructure glass palette. Leave clear negative space
for live website labels around each panel.

No people, no hands, no phones, no real dashboard screenshots, no big
baked text, no logos, no watermarks, no purple gradients, no black
cyberpunk background, no generic AI spheres, no chaotic clutter.
```

**Google Flow Motion Prompt:**

```
Generate a smooth cinematic product animation from the start frame to the
end frame.

The camera moves from the wide row of racks back toward a single
focused, verified rack. As it settles, six distinct translucent panels
emerge calmly around the rack, each a different abstract shape
(capacity bars, a connectivity node graph, a compliance shield, a
procurement match icon, a vulnerability warning outline, an incident
location pin). They arrive one or two at a time, not all at once, each
settling softly into place. The feeling is operational confidence - one
verified source powering several distinct outcomes - not a busy
dashboard powering on. Keep the scene bright and calm throughout.

Light infrastructure glass styling throughout. Do not add people,
phones, real dashboard UI, large baked text, logos, watermarks, dark
cyberpunk lighting, purple gradients, floating orbs, or random particles.
```

**Reference images to upload:** `assets/frame-3.jpeg`, `assets/explode-end.png` (panel visual language), `assets/Verified Rack Object.jpeg`.

**Acceptance criteria:**

- Six panels are visually distinct from each other without needing baked labels.
- Panels arrive staggered, not simultaneously.
- No people, phones, logos, watermarks — check for the Gemini sparkle mark before extracting frames.
- Stays calm/premium — not a "dashboard powering on" feeling.

### Chapter 9: Final CTA

**Message**

See your first rack become infrastructure intelligence.

**Visual Direction**

Return to a resolved, verified infrastructure object. The final screen should feel calm and confident.

**CTA**

`Request platform brief`

**Investor takeaway**

The next step is a focused evaluation, not casual browsing.

**Status**

No video needed — bookends the story by reusing `assets/Verified Rack Object.jpeg` (same asset as Chapter 1), static like the hero, with the CTA as live HTML/CSS. No asset brief required; build directly when ready.

## What The Homepage Should Explain

The homepage should answer these questions in order:

1. What is RackTrack?
   - Physical infrastructure intelligence for data centers.

2. What is the core product action?
   - A phone sweep captures physical rack reality.

3. What does the product produce?
   - Verified inventory, ports, cables, topology, and audit evidence.

4. Why does this matter?
   - CMDB, DCIM, asset records, and diagrams drift from physical reality.

5. What makes RackTrack different?
   - Visual rack intelligence plus network telemetry validation plus reconciliation.

6. Who benefits?
   - Infrastructure leaders, network engineers, security teams, compliance owners, incident responders, and M&A or migration teams.

7. Why now?
   - Manual rack audits are slow, records decay, and audit or incident teams need defensible current evidence.

8. What should the buyer do?
   - Request a platform brief or demo around the first rack.

## What Goes On Deeper Pages

The homepage should not carry every detail. Deeper pages should explain:

- **Why RackTrack**
  - Technical moat, patent-pending cable mapping, why CMDB/DCIM drift happens.

- **Solutions**
  - Full capability detail: visual rack intelligence, cable-to-port mapping, topology, posture, capacity, procurement, compliance.

- **Use Cases**
  - Role-specific stories for network, security, compliance, incident response, M&A, and infrastructure leadership.

- **Trust & Security**
  - Data ownership, tenant processing, access control, audit logs, deployment model, SOC 2 progress.

- **Resources**
  - Thought leadership around CMDB drift, topology debt, audit readiness, physical infrastructure security, and continuous reconciliation.

## Immediate Build Brief: Post-Scan Explanation Bridge

**Status: completed and accepted (Chapter 3).** Kept below as historical record of the brief that produced it.

### Purpose

The bridge after the scan should make the buyer understand what changes after RackTrack captures the rack.

The message should not be vague. It should explain that the scan becomes structured evidence the platform can reason over.

### Core Message

`A phone sweep is only the capture. RackTrack turns it into structured rack evidence.`

### What The Bridge Should Explain

- The scan captures physical evidence.
- RackTrack extracts device identity, rack position, labels, visible ports, cable observations, and timestamps.
- The result is not a photo archive. It is a structured model that can be checked against records and network signals.

### Visual Direction

- Add a calm breathing gap after the scan animation.
- Use live HTML/CSS labels and small technical callouts.
- Keep the background light, clean, and premium.
- Use subtle motion only if it clarifies extraction from scan to structured facts.
- Do not use a generic SaaS feature grid.
- Do not use dashboards or fake product screenshots.
- Do not bake the explanation into images or video.

### Possible Live Labels

- `Device identity`
- `Rack position`
- `Visible ports`
- `Cable observations`
- `Evidence timestamp`
- `Ready for reconciliation`

### Draft Copy Direction

Headline:

`Captured facts. Ready to verify.`

Supporting copy:

`The sweep becomes device, position, port, cable, and timestamp evidence.`

### Acceptance Criteria

- The bridge explains why the scan matters.
- It prepares the visitor for the rack model/rack-open beat.
- It feels like part of the scroll story, not a normal content section.
- Text remains editable in HTML/CSS.
- The section has breathing room before the next pinned animation.

## Working Rule

Generate and approve one chapter at a time.

Do not stitch multiple *chapters* into one long video — each chapter gets its own frame sequence in the live site. (A single chapter *can* be built from more than one source clip stitched into one frame sequence, as Chapter 4 was — Clip 1 + Clip 2 concatenated into one 131-frame sequence. That's a multi-shot chapter, not multiple chapters merged, and is fine.)

## Status Summary (update this after every chapter)

All 9 chapters are accounted for: 1-8 built and accepted, 9 (Final CTA) is the only remaining item and needs no video generation — just a static HTML/CSS section reusing the hero image. See `CLAUDE.md`'s Build Progress table for the current authoritative status table; keep both in sync when either changes.

Prioritize explanation quality over perfect frame-to-frame continuity. If the clearest next chapter needs a new composed start frame, use one.
