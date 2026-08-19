# Opening Scene Spec

## Current Direction

RackTrack opening visual direction: **Verified Rack Object**.

The homepage first fold is the accepted static visual foundation. It should stay clean while the scroll story continues below it with separate motion beats.

Current live first-fold files:

- `index.html`
- `styles.css`
- `main.js`
- `assets/Verified Rack Object.jpeg`
- `assets/logo.jpg`
- `assets/phone-scan-2-frames-webp/`
- `assets/rack-open-frames-webp/`

The first fold currently has:

- light infrastructure glass palette
- right-side Verified Rack Object image
- no person
- no phone in the first fold
- no scan overlay in the first fold
- no generated video or frame sequence inside the first fold
- lightweight brand and demo navigation
- minimal blue headline cursor animation

## Goal

Make the visitor understand RackTrack in the first viewport:

RackTrack captures physical data center racks with a phone and turns that scan into verified inventory, topology, ports, cables, and audit evidence.

The first screen should feel like a premium infrastructure product object, not a normal SaaS hero, stock data-center photo, or generic AI animation.

## First View

The first view shows a bright, clean hero composition with text on the left and a Verified Rack Object on the right.

The object should suggest a server/network rack without looking like a raw server-room photo:

- stacked matte graphite hardware modules
- precise port grids
- patch-panel detail
- small status LEDs
- subtle cable paths
- translucent glass or scan layers
- calm verified-infrastructure mood

The left side must stay open and readable for the headline.

## Visual Style

Use the locked color system:

- Main environment: `#F7FAFF`, `#EEF5FF`, pale steel, soft white glass
- Text: `#102033`
- Primary accent: `#2457D6`
- Scan glow: `#7DBDFF`
- Verified states: `#43B883`
- Drift warning: do not show in the opening scene

The scene should be bright and premium, not black, cyberpunk, neon, purple, or dashboard-heavy.

## Hero Copy

Primary line:

Physical infrastructure intelligence for data centers

Headline:

One phone sweep. Verified rack truth.

Supporting line:

Inventory, ports, cables, topology, and audit evidence reconciled from physical rack reality.

Primary CTA:

Get a demo

## Build Status

Step 1 is complete: homepage first look / first fold.

Step 1A is complete: opening scene reset to Verified Rack Object.

Current live scroll story below the hero:

1. Phone scan scroll animation.
2. Short bridge from capture to structured rack model.
3. Rack-open scroll animation.

The next build should not add normal static feature sections. Continue with one premium motion beat at a time.

Important:

- Do not revive the previous phone-rise animation.
- Do not stitch all chapters into one long video.
- Keep each motion chapter as a separate scroll beat.
- Do not use Playwright unless the user explicitly asks for it again.
- If visual confirmation is needed, ask the user to check the local preview or send a screenshot.

## Next Motion Beat

The next likely beat should start from the opened rack, not the hero:

- cable/topology paths become the focus
- verified cable paths turn green
- mismatch/drift appears in amber only when needed
- camera may orbit or move behind the rack if the source video supports it
- RackTrack labels remain live HTML/CSS
- animation stays laptop-first and crisp

The current `assets/Verified Rack Object.jpeg` can be used as visual reference for lighting and brand consistency.

If true 3D quality is required later, source or build realistic rack/network geometry and animate it with Three.js.

## Acceptance Criteria

- The first viewport explains RackTrack without scrolling.
- The hero does not look like a generic SaaS page.
- The right-side object is crisp on laptop screens.
- Text is readable over the visual.
- The page uses the locked light palette.
- The object clearly connects physical rack hardware to verified infrastructure intelligence.
- No people, phones, watermarks, or baked UI labels in the first-fold image.
- No fake unsupported claims or invented metrics.
- No em-dashes in visible copy.
