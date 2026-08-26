# RackTrack Site Map

## Local Routes

| Route | Purpose | Main interaction |
|---|---|---|
| `index.html` | Homepage | Scroll-driven phone scan, continuous rack story, proof-tour walkthrough |
| `why-racktrack.html` | Why RackTrack | Verification manifest controls and sticky evidence-card sequence |
| `solutions.html` | Solutions | Original system schematic, interactive cabinet reader, and six intelligence surfaces |
| `contact.html` | Contact and platform brief | Pointer-responsive reconciliation canvas, scan replay, validated request form, FAQ accordions |

## Local Assets

- Homepage hero frames: `homepage-hero-animation/`
- Homepage lower animation frames: `homepage-lower-animation/`
- Why RackTrack generated visuals: `assets/why-racktrack/`
- Solutions local visuals: `assets/solutions/`
- Solutions original schematic: `assets/solutions/system-schematic.svg`
- Solutions original cabinet reader styles: `assets/solutions/rack-reader.css`
- Solutions cabinet backplate: `assets/media-rack3d-cabinet-face.jpg`
- Contact visual: `assets/contact/media-contact-run.jpg`
- User-provided Why RackTrack upload set retained for provenance: `why-rack-track-assets/`

The live pages use only repository-relative asset paths. Nothing depends on `/Users/praveen/Desktop/Racktrack_Website` at runtime.

## Scripts

- `main.js` powers the homepage animation and proof tour.
- `why-racktrack.js` powers the `01 / 03` verification manifest.
- `solutions.js` powers the cabinet reading controls and section reveal states.
- `contact.js` powers the contact form validation, email handoff, and animated network field.

## Verification

Run the animation invariants with:

```sh
node tests/world-timeline.test.mjs
```

Run the local preview from the repository root with:

```sh
python3 -m http.server 5174
```

Then open `/`, `/why-racktrack.html`, `/solutions.html`, or `/contact.html`.
