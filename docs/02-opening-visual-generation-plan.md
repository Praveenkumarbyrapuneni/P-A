# Opening Visual And Motion Plan

## Decision

The first fold is locked as a static quality foundation. The homepage scroll story now uses controlled motion beats below the hero.

Current direction: **Verified Rack Object**.

Reason: the user likes the current still image quality, but the homepage needs motion-driven product storytelling to justify the rebuild. Motion should be built one beat at a time rather than as one stitched long video.

## Current Live Asset

The current live hero image is:

- `assets/Verified Rack Object.jpeg`
- 2752 x 1536
- static first-fold checkpoint

This asset is acceptable for the first fold and as visual reference. It is not enough for aggressive zooming or true 3D camera movement.

## Current Live Motion Beats

Beat 1, The Scan:

- Source video: `assets/phone-scan-2.mp4`
- Live frames: `assets/phone-scan-2-frames-webp/`
- Frame count: 240
- Implementation: pinned canvas scroll scrub in `main.js`

Draft bridge:

- Live HTML/CSS section after the scan.
- Copy: "Captured facts. Ready to verify."
- Status: reworked in live files. Pending user visual/content approval.
- Purpose: explain what RackTrack extracts from the scan before the next motion chapter.

Draft Beat 2, The Rack Opens:

- Source video: `assets/rack-open.mp4`
- Source video details: 1280 x 720, 24 fps, 10 seconds, 240 frames
- PNG masters: `assets/rack-open-frames-png/`
- Live frames: `assets/rack-open-frames-webp/`
- Implementation: draft canvas logic may exist in `main.js`
- Status: not accepted as a completed homepage chapter. Treat these assets as draft material only. The section is not currently shown in the live homepage flow.

## Removed Assets

Do not bring back these old directions:

- old generated rack image backups
- watermarked Gemini video
- temporary browser verification screenshots
- temporary Playwright metadata
- unfinished static scan-section prototype
- static drift/problem section after the scan

## What To Generate Or Source Next

Generate or build only the next needed piece, not the whole remaining homepage.

The immediate next piece is reviewing the reworked post-scan explanation bridge:

- keep a small breathing gap after the scan
- explain that RackTrack extracts usable infrastructure facts from visual evidence
- keep the explanation as live HTML/CSS
- avoid a normal static SaaS section
- avoid generic dashboard mockups

After the bridge is approved, decide/build the rack model or rack-open beat:

- the visual does not need to use the exact last scan frame
- it can use a premium product-rendered rack intelligence object
- it should show the scan becoming structured rack facts
- it should explain inventory, rack position, ports, labels, and evidence

After those are approved, the next likely beat is cable/topology truth:

- start from an opened rack or a similar rack-layer state if that is the clearest visual
- focus on cable paths and physical-to-logical topology
- show verified paths in green
- show one small amber mismatch only if useful
- avoid dashboards, people, cyberpunk rooms, and baked large text
- leave room for editable website text overlays

Three.js remains an option only if it can exceed the video/frame-sequence quality:

- one rack/infrastructure object
- light infrastructure glass environment
- camera moves closer or rotates slightly on scroll
- translucent scan plane passes through
- verified/cable/topology highlights appear
- labels remain live HTML/CSS

## Still Image Prompt For Future Visual Reference

Use this only for still visual reference or texture direction, not final video:

```text
Create a high-resolution premium 3D product-render style hero visual for a data center infrastructure intelligence company.

Subject: an abstracted enterprise rack intelligence object on the right side of the frame. It should suggest a server/network rack without looking like a raw photograph: stacked matte graphite hardware modules, precise port grids, patch-panel details, small status LEDs, subtle cable paths, translucent scan planes, and verified topology lines.

Composition: wide desktop website hero, 16:9 or wider. Left 45% must remain clean bright negative space for headline text. The object sits on the right 45%, slightly angled, crisp, premium, and highly detailed. Avoid a visible rectangular image boundary when placed on a light website background.

Style: high-end product render, clean infrastructure glass, light mist-blue and white environment, sharp edges, realistic material shading, subtle reflections, controlled studio lighting, enterprise hardware aesthetic.

Mood: calm, technical, expensive, trustworthy.

Do not include people, hands, phones, text, logos, watermarks, dashboards, purple gradients, glowing blobs, generic AI spheres, or real brand hardware.
```

Negative prompt:

```text
No person. No technician. No hand. No phone. No low-resolution video frame. No watermark. No text. No logo. No dashboard UI. No cyberpunk server room. No neon purple. No black background. No generic AI orb. No abstract blob. No messy cable pile. No fake brand hardware. No blurry ports. No distorted rack geometry. No visible crop boundary.
```

## Selection Criteria

Choose or build a visual system only if:

- it looks crisp at laptop hero size
- it can support controlled scroll motion
- it feels premium, technical, and ownable
- it explains RackTrack's product value
- the palette matches light infrastructure glass
- labels and business text remain editable in code

Reject a path if:

- it depends on blurry generated video
- it creates watermarks or baked text
- it looks like generic AI sci-fi
- it cannot support camera movement cleanly
- it forces aggressive zooming into a low-resolution bitmap

## Current Build Target

Continue the scroll story one chapter at a time.

Current completed chapters:

- Hero
- Scan

Current not accepted:

- Bridge
- Rack Opens

Next chapter/work:

- Review/approve post-scan explanation bridge
- Then approve or rebuild rack model / rack-open beat
- Then create Cable Truth Moment

After the user approves or supplies a new video beat, extract frames and add it as a separate pinned section.
