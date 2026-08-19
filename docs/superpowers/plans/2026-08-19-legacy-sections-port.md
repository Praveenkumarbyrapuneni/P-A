# Legacy Sections Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port two sections from the old RackTrack site (`/Users/praveen/Desktop/Racktrack_Website`) into the new `P-A` homepage, verbatim in content/behavior, re-themed to this project's CSS custom properties, at two specific insertion points.

**Architecture:** Static HTML sections + plain CSS (no Tailwind, no new build step) + one self-contained JS init function appended to `main.js` for the interactive tour. No changes to existing hero/scan/story-bridge/world-story code paths.

**Tech Stack:** Vanilla HTML/CSS/JS, matching the existing `P-A` project (no frameworks, no new dependencies).

## Global Constraints

- Content is locked verbatim from the source files cited below — do not rewrite copy, relabel steps, or alter the SVG data.
- No Tailwind classes end up in the shipped HTML — every class must resolve against `styles.css` custom CSS, using this project's tokens (`--cloud`, `--mist`, `--steel`, `--ink`, `--muted`, `--blue`, `--scan`, `--verified`, `--amber`, `--white`, `--font-ui`, `--font-mono`) in place of the old site's hardcoded hex values.
- Color remap table (apply everywhere a ported hex value appears, in both inline SVG `fill`/`stroke` attributes and CSS):
  - `#d3dae6` (pale steel border) → `var(--steel)` (`#d9e7f6`)
  - `#1a3fd4` (accent blue) → `var(--blue)` (`#2457d6`)
  - `#0a111e` / `#78829a` (dark text / muted label) → `var(--ink)` (`#102033`) / `var(--muted)` (`#53667d`)
  - `#f4f6fa` (panel fill) → `var(--mist)` (`#eef5ff`)
  - `#ffffff` → `var(--white)`
  - `#b3261e` (delta/error red) → keep as a literal hardcoded `#b3261e` (no semantic red token exists in this project's palette; do not repurpose `--amber` or any other token for it)
- Bump the cache-busting query string on `styles.css`/`main.js` in `index.html` from `?v=world-redesign-4` to `?v=world-redesign-5` as part of Task 2 (last task), so both new sections and any CSS/JS changes are picked up on reload.
- Testing convention for this project: there is no automated test suite for markup/CSS. "Test" = start `python3 -m http.server 5174` from `P-A/`, load `http://127.0.0.1:5174/`, and visually confirm. Per project rule, the assistant does NOT use browser automation to self-verify — each task ends by telling the user exactly what to look at locally.

## File Structure

- Modify `index.html` — insert Section 1 between the hero section (closes line 71) and the Scan section (opens line 73); insert Section 2 immediately after the World-story section closes (line 259), before `</main>` (line 261).
- Modify `styles.css` — append two new blocks of rules at end of file: `/* What RackTrack Is */` (Task 1) and `/* Floor-plan tour */` (Task 2), each self-contained (own class names, no edits to existing rules).
- Modify `main.js` — append one new function `createTour()` plus a top-level call, after the existing `createParticles`/world init block, following the same `if (!root) return` no-op guard pattern already used by `createWorld()`.

---

### Task 1: "What RackTrack Is" section

**Files:**
- Modify: `index.html:71-73` (insert new `<section>` between these lines)
- Modify: `styles.css` (append new rule block at end of file)
- Reference source (read-only, do not modify): `/Users/praveen/Desktop/Racktrack_Website/src/pages/index.html:82-102`

**Interfaces:**
- Produces: a `<section class="truth-shell" id="what-racktrack-is">` with no JS dependency — nothing downstream consumes it.

- [ ] **Step 1: Insert the section markup into `index.html`**

Insert immediately after line 71 (`      </section>` closing `.hero-shell`) and before line 73 (`      <section` opening the Scan section):

```html
      <section class="truth-shell" id="what-racktrack-is" aria-labelledby="truth-title">
        <div class="truth-grid">
          <div class="truth-copy">
            <p class="eyebrow">What RackTrack is</p>
            <h2 id="truth-title">Physical Infrastructure Intelligence — continuously reconciled across your entire footprint.</h2>
            <p class="truth-body">RackTrack combines computer vision, network telemetry, vendor data, and security intelligence into a single platform. One phone sweep produces a verified infrastructure digital twin — inventory, topology, port state, and firmware posture synced to your operational stack.</p>
            <p class="truth-quote">From physical rack perception to continuous reconciliation, RackTrack gives every team one verified source of infrastructure truth.</p>
          </div>
          <figure class="truth-figure">
            <div class="truth-figure-head">
              <figcaption>From capture to structured record</figcaption>
              <span class="truth-figure-tag">Detection → record</span>
            </div>
            <div class="truth-figure-frame">
              <svg viewBox='0 0 680 396' fill='none' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='Rack capture with detected devices mapped to structured records'><rect x='16.5' y='16.5' width='271' height='363' stroke='var(--steel)'/><text x='16' y='12' fill='var(--muted)' font-size='9' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>CAPTURE - RACK SWEEP</text><path d='M16 30V16H30' stroke='var(--ink)' stroke-width='1.5'/><path d='M287 30V16H273' stroke='var(--ink)' stroke-width='1.5'/><path d='M16 365V379H30' stroke='var(--ink)' stroke-width='1.5'/><path d='M287 365V379H273' stroke='var(--ink)' stroke-width='1.5'/><rect x='34.5' y='46.5' width='236' height='40' fill='var(--mist)' stroke='var(--steel)'/><rect x='34.5' y='46.5' width='236' height='40' stroke='var(--blue)' stroke-dasharray='4 3'/><text x='44' y='62' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>PATCH PANEL 48P</text><text x='262' y='62' text-anchor='end' fill='var(--blue)' font-size='8.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>0.98</text><rect x='44' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='60' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='76' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='92' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='108' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='124' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='140' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='156' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='172' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='188' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='204' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='220' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='236' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='252' y='72' width='11' height='6' stroke='var(--steel)'/><rect x='34.5' y='92.5' width='236' height='40' fill='var(--mist)' stroke='var(--steel)'/><rect x='34.5' y='92.5' width='236' height='40' stroke='var(--blue)' stroke-dasharray='4 3'/><text x='44' y='108' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>SWITCH NX-9336C</text><text x='262' y='108' text-anchor='end' fill='var(--blue)' font-size='8.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>0.99</text><rect x='44' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='60' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='76' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='92' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='108' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='124' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='140' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='156' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='172' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='188' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='204' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='220' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='236' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='252' y='118' width='11' height='6' stroke='var(--steel)'/><rect x='34.5' y='138.5' width='236' height='34' fill='var(--mist)' stroke='var(--steel)'/><rect x='34.5' y='138.5' width='236' height='34' stroke='var(--blue)' stroke-dasharray='4 3'/><text x='44' y='154' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>SERVER 2U</text><text x='262' y='154' text-anchor='end' fill='var(--blue)' font-size='8.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>0.97</text><rect x='44' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='60' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='76' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='92' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='108' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='124' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='140' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='156' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='172' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='188' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='204' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='220' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='236' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='252' y='158' width='11' height='6' stroke='var(--steel)'/><rect x='34.5' y='176.5' width='236' height='34' fill='var(--mist)' stroke='var(--steel)'/><rect x='34.5' y='176.5' width='236' height='34' stroke='var(--blue)' stroke-dasharray='4 3'/><text x='44' y='192' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>SERVER 2U</text><text x='262' y='192' text-anchor='end' fill='var(--blue)' font-size='8.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>0.97</text><rect x='44' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='60' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='76' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='92' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='108' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='124' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='140' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='156' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='172' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='188' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='204' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='220' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='236' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='252' y='196' width='11' height='6' stroke='var(--steel)'/><rect x='34.5' y='214.5' width='236' height='40' fill='var(--mist)' stroke='var(--steel)'/><rect x='34.5' y='214.5' width='236' height='40' stroke='var(--blue)' stroke-dasharray='4 3'/><text x='44' y='230' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>STORAGE ARRAY</text><text x='262' y='230' text-anchor='end' fill='var(--blue)' font-size='8.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>0.96</text><rect x='44' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='60' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='76' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='92' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='108' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='124' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='140' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='156' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='172' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='188' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='204' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='220' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='236' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='252' y='240' width='11' height='6' stroke='var(--steel)'/><rect x='34.5' y='268.5' width='236' height='40' fill='var(--mist)' stroke='var(--steel)'/><rect x='34.5' y='268.5' width='236' height='40' stroke='var(--blue)' stroke-dasharray='4 3'/><text x='44' y='284' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>PDU</text><text x='262' y='284' text-anchor='end' fill='var(--blue)' font-size='8.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>0.95</text><rect x='44' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='60' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='76' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='92' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='108' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='124' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='140' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='156' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='172' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='188' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='204' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='220' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='236' y='294' width='11' height='6' stroke='var(--steel)'/><rect x='252' y='294' width='11' height='6' stroke='var(--steel)'/><text x='330' y='12' fill='var(--muted)' font-size='9' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>STRUCTURED RECORD</text><path d='M287 66C312 66 315 41 340 41' stroke='var(--steel)'/><circle cx='287' cy='66' r='2' fill='var(--blue)'/><path d='M287 112C312 112 315 105 340 105' stroke='var(--steel)'/><circle cx='287' cy='112' r='2' fill='var(--blue)'/><path d='M287 155C312 155 315 169 340 169' stroke='var(--steel)'/><circle cx='287' cy='155' r='2' fill='var(--blue)'/><path d='M287 234C312 234 315 233 340 233' stroke='var(--steel)'/><circle cx='287' cy='234' r='2' fill='var(--blue)'/><path d='M287 288C312 288 315 297 340 297' stroke='var(--steel)'/><circle cx='287' cy='288' r='2' fill='var(--blue)'/><line x1='340' y1='30' x2='664' y2='30' stroke='var(--steel)'/><text x='340' y='44' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>asset_type</text><text x='664' y='44' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>patch_panel</text><line x1='340' y1='54' x2='664' y2='54' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='76' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>rack_unit</text><text x='664' y='76' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>U42–U38</text><line x1='340' y1='86' x2='664' y2='86' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='108' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>model</text><text x='664' y='108' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>NX-9336C</text><line x1='340' y1='118' x2='664' y2='118' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='140' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>serial</text><text x='664' y='140' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>FDO2411A7QK</text><line x1='340' y1='150' x2='664' y2='150' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='172' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>ports_total</text><text x='664' y='172' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>48</text><line x1='340' y1='182' x2='664' y2='182' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='204' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>ports_used</text><text x='664' y='204' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>31</text><line x1='340' y1='214' x2='664' y2='214' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='236' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>link_state</text><text x='664' y='236' text-anchor='end' fill='var(--blue)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>verified</text><line x1='340' y1='246' x2='664' y2='246' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='268' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>firmware</text><text x='664' y='268' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>9.3(2)</text><line x1='340' y1='278' x2='664' y2='278' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='300' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>cmdb_match</text><text x='664' y='300' text-anchor='end' fill='#b3261e' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>delta</text><line x1='340' y1='310' x2='664' y2='310' stroke='var(--steel)' stroke-opacity='.7'/><text x='340' y='332' fill='var(--muted)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>verified_at</text><text x='664' y='332' text-anchor='end' fill='var(--ink)' font-size='9.5' font-family='Geist Mono,ui-monospace,SFMono-Regular,Menlo,monospace'>2026-08-07</text><line x1='340' y1='342' x2='664' y2='342' stroke='var(--steel)' stroke-opacity='.7'/></svg>
            </div>
          </figure>
        </div>
      </section>
```

Note: `var(--steel)` etc. work directly as SVG `fill`/`stroke` attribute values in all modern browsers since SVG presentation attributes accept CSS `var()`. No JS or build step needed for this substitution.

- [ ] **Step 2: Append the section's CSS to `styles.css`**

Append at end of file:

```css

/* What RackTrack Is */
.truth-shell {
  padding: 96px 6vw;
  background: var(--cloud);
}
.truth-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}
.truth-copy .eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 16px;
}
.truth-copy h2 {
  font-family: var(--font-ui);
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0 0 20px;
}
.truth-body {
  font-size: 17px;
  line-height: 1.6;
  color: var(--muted);
  margin: 0 0 28px;
  max-width: 52ch;
}
.truth-quote {
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--ink);
  border-left: 2px solid var(--blue);
  padding-left: 20px;
  margin: 0;
}
.truth-figure {
  margin: 0;
}
.truth-figure-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--steel);
  padding-bottom: 10px;
  margin-bottom: 16px;
}
.truth-figure-head figcaption {
  font-family: var(--font-ui);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}
.truth-figure-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.truth-figure-frame {
  border: 1px solid var(--steel);
  background: var(--white);
  padding: 20px 28px;
}
.truth-figure-frame svg {
  width: 100%;
  height: auto;
  display: block;
}
@media (max-width: 900px) {
  .truth-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
```

- [ ] **Step 3: Start the local server and verify visually**

Run: `python3 -m http.server 5174` from the `P-A` folder (skip if already running).
Tell the user: "Reload `http://127.0.0.1:5174/?v=check` (hard refresh, Cmd+Shift+R) and check the new 'What RackTrack Is' section appears between the hero and the phone-scan animation — two columns on desktop (copy left, capture→record diagram right), blue accent color, stacks to one column on mobile width."
Wait for user confirmation before proceeding to Task 2.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "$(cat <<'EOF'
feat: add "What RackTrack Is" section between hero and scan

Ported verbatim from the old site (content/diagram unchanged), re-themed
to this project's CSS custom properties instead of Tailwind/hardcoded hex.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Floor-plan-to-verified-record interactive tour

**Files:**
- Modify: `index.html:259-261` (insert new `<section>` between the closing `</section>` of world-story and `</main>`)
- Modify: `styles.css` (append new rule block at end of file)
- Modify: `main.js` (append `createTour()` function + top-level call at end of file)
- Modify: `index.html` head (bump cache-busting query strings)
- Reference source (read-only, do not modify):
  - HTML/SVG: `/Users/praveen/Desktop/Racktrack_Website/src/pages/index.html:128-435`
  - JS behavior: `/Users/praveen/Desktop/Racktrack_Website/src/layout/scripts.html:51-118`

**Interfaces:**
- Produces: `<section class="tour-shell" id="proof-tour">` containing 6 `.tour-view[data-view]` elements, breadcrumb `.tour-crumb`, counter `#tour-count`, `#tour-prev`/`#tour-next` buttons, `.hot[data-goto]` clickable regions inside the SVGs, `.pmap-p.live[data-port][data-speed][data-vlan][data-nbr][data-via][data-chg]` port elements, `#port-mark rect`, `#pd-sel`/`#pd-port`/`#pd-speed`/`#pd-vlan`/`#pd-nbr`/`#pd-via`/`#pd-chg` inspector output fields, `#tour-end` end card with `#tour-restart`/`#tour-back`.
- `createTour()` consumes nothing from other tasks; it is a standalone init function, called unconditionally at the bottom of `main.js` (same pattern as `const world = createWorld();`), and no-ops via `if (!root) return` if `#proof-tour` isn't in the DOM.

- [ ] **Step 1: Copy the section markup into `index.html`**

Read the exact source block first: `Read /Users/praveen/Desktop/Racktrack_Website/src/pages/index.html` lines 128-435 (308 lines — six `.tour-view` SVGs plus the app-frame chrome, breadcrumb, and end card).

Insert it into `P-A/index.html` immediately after line 259 (`      </section>` closing `.world-story`) and before line 261 (`    </main>`), with these transformations applied to the copied block:
1. Replace the outer `<section class="py-14 md:py-20">` wrapper with `<section class="tour-shell" id="proof-tour" aria-label="Interactive walkthrough: floor plan to verified record">`.
2. Remove the `<div class="max-w-container-max-width mx-auto px-margin">` and `<div class="text-center">` / `<h2 class="h2 mx-auto max-w-[20ch]">From manual audits to verified infrastructure.</h2>` Tailwind wrapper — replace with a plain `<div class="tour-inner">` wrapping the same inner content, and `<h2 class="tour-heading">From manual audits to verified infrastructure.</h2>`.
3. Replace the Tailwind grid wrapper `<div class="grid grid-cols-1 lg:grid-cols-12 gap-x-gutter gap-y-6 mt-10 relative" id="proof-tour">` — drop it entirely since `id="proof-tour"` moved to the outer `<section>` in transformation 1 — its children (the `#tour-end` card and the `lg:col-span-12 app-frame` block) become direct children of `.tour-inner`.
4. Replace every `class="lg:col-span-12 app-frame"` → `class="tour-frame"`; every other Tailwind utility class on tour elements (`btn btn-primary`, `btn btn-ghost`, etc.) → keep `btn btn-primary`/`btn btn-ghost` only if those classes already exist in `styles.css` (check first with `grep -n "\.btn-primary\|\.btn-ghost" styles.css`); if absent, rename to `tour-btn tour-btn-primary` / `tour-btn tour-btn-ghost` and define them in Step 2's CSS instead.
5. Do NOT alter any `data-*` attribute, `id`, SVG `viewBox`, `path`/`rect`/`circle`/`text` coordinate data, or the `pmap-p`/`hot`/`port-mark` structure — the JS in Step 3 depends on these exactly as they exist in the source.
6. Apply the same color remap table from Global Constraints to every hardcoded hex in the copied SVGs and inline styles (`#d3dae6`→`var(--steel)`, `#1a3fd4`→`var(--blue)`, `#0a111e`→`var(--ink)`, `#78829a`→`var(--muted)`, `#f4f6fa`→`var(--mist)`, `#ffffff`→`var(--white)`, `#b3261e` stays literal).
7. The brand image reference `<img alt="" src="assets/logo.jpg">` inside `.app-bar`/`.app-brand` — confirm `assets/logo.jpg` exists in `P-A/assets/` (`ls P-A/assets/logo.jpg`); if missing, copy it from the old site: `cp "/Users/praveen/Desktop/Racktrack_Website/assets/logo.jpg" assets/logo.jpg`.
8. The end-card CTA `<a class="btn btn-primary" href="contact-us.html">Run a topology diagnostic</a>` — change `href` to `mailto:info@racktrack.ai` to match this project's existing CTA pattern (there is no `contact-us.html` page in `P-A`).

- [ ] **Step 2: Append the section's CSS to `styles.css`**

Read the source CSS first: `grep -n "\.tour-\|\.app-frame\|\.app-bar\|\.app-dots\|\.app-brand\|\.app-path\|\.app-count\|\.pmap-\|\.hot\b\|\.tour-bot" /Users/praveen/Desktop/Racktrack_Website/src/css/page/index.css` and read each matched rule with surrounding context.

Port every matched rule to `styles.css`, appended after Task 1's block, under a `/* Floor-plan tour */` comment, preserving all layout properties (grid/flex, positioning, SVG sizing) but with every color value passed through the Global Constraints remap table, every `font-family` referencing Tailwind's default stack replaced with `var(--font-ui)` (UI text) or `var(--font-mono)` (labels/monospace data — the source already uses `Geist Mono,ui-monospace,...` for these, keep as-is or switch to `var(--font-mono)`), and every Tailwind spacing utility folded into the rule's own `padding`/`margin`/`gap` declarations. Add:

```css
.tour-shell {
  padding: 96px 6vw;
  background: var(--mist);
}
.tour-inner {
  max-width: 1280px;
  margin: 0 auto;
}
.tour-heading {
  font-family: var(--font-ui);
  font-size: clamp(26px, 2.6vw, 34px);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-align: center;
  max-width: 20ch;
  margin: 0 auto 40px;
}
```

- [ ] **Step 3: Append the tour's JS to `main.js`**

Read the source JS first: `Read /Users/praveen/Desktop/Racktrack_Website/src/layout/scripts.html` lines 51-118.

Append at the end of `main.js`, after the existing `const world = createWorld();` / particle-field block:

```js
function createTour() {
  const root = document.getElementById("proof-tour");
  if (!root) return;

  const views = root.querySelectorAll(".tour-view");
  const steps = root.querySelectorAll(".tour-step");
  const crumbs = root.querySelectorAll(".tour-crumb");
  const dots = root.querySelectorAll(".tour-dot");
  const count = document.getElementById("tour-count");
  const prev = document.getElementById("tour-prev");
  const next = document.getElementById("tour-next");
  const total = views.length;
  let at = 0;
  const pad = (n) => (n < 10 ? "0" : "") + n;

  function show(i) {
    at = Math.max(0, Math.min(total - 1, i));
    [views, steps, crumbs, dots].forEach((set) => {
      set.forEach((el, k) => el.classList.toggle("is-active", k === at));
    });
    if (count) count.textContent = pad(at + 1) + " / " + pad(total);
    if (prev) prev.disabled = at === 0;
    if (next) next.disabled = at === total - 1;
  }

  root.addEventListener("click", (e) => {
    const h = e.target.closest ? e.target.closest(".hot") : null;
    if (h) show(parseInt(h.dataset.goto, 10));
  });
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const h = e.target.closest ? e.target.closest(".hot, .pmap-p.live") : null;
    if (!h) return;
    e.preventDefault();
    if (h.classList.contains("hot")) show(parseInt(h.dataset.goto, 10));
    else pickPort(h);
  });

  function pickPort(g) {
    root.querySelectorAll(".pmap-p.is-picked").forEach((o) => o.classList.remove("is-picked"));
    g.classList.add("is-picked");
    const d = g.dataset;
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set("pd-sel", "PORT 1/" + d.port + " SELECTED");
    set("pd-port", "Eth1/" + d.port);
    set("pd-speed", d.speed);
    set("pd-vlan", d.vlan);
    set("pd-nbr", d.nbr);
    set("pd-via", d.via);
    set("pd-chg", d.chg);
    const mark = document.querySelector("#port-mark rect");
    if (mark) mark.setAttribute("x", (14 + Math.floor((d.port - 1) / 2) * 5.6).toFixed(2));
  }
  root.querySelectorAll(".pmap-p.live").forEach((g) => {
    g.addEventListener("click", () => pickPort(g));
  });

  if (prev) prev.addEventListener("click", () => show(at - 1));
  if (next) next.addEventListener("click", () => show(at + 1));
  dots.forEach((d) => {
    d.addEventListener("click", () => show(parseInt(d.dataset.goto, 10)));
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });

  const restart = document.getElementById("tour-restart");
  const back = document.getElementById("tour-back");
  if (restart) restart.addEventListener("click", () => show(0));
  if (back) back.addEventListener("click", () => show(total - 1));

  show(0);
  return { root, show };
}

const tour = createTour();
```

Note: `total` in `show()` will be 6 once the six `.tour-view` elements from Step 1 are in the DOM.

- [ ] **Step 4: Bump cache-busting query strings**

In `index.html` `<head>`, change both occurrences of `?v=world-redesign-4` to `?v=world-redesign-5` (the `styles.css` `<link>` and the `main.js` `<script>` tag).

- [ ] **Step 5: Start the local server and verify visually**

Run: `python3 -m http.server 5174` from the `P-A` folder (skip if already running).
Tell the user: "Hard refresh `http://127.0.0.1:5174/` (Cmd+Shift+R) and scroll to the end of the rack story (after the Outcomes chapter). You should see the 6-step interactive tour: an app-frame with breadcrumb 'DC1 / Ground floor' and a floor plan showing 56 cabinets. Click Next through all 6 steps (floor plan → row → cabinet → device/port sheet → trace → reconcile), try clicking a port on the device/port sheet step to confirm the inspector panel updates, and confirm the end card with 'Restart walkthrough' appears after step 6."
Wait for user confirmation.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css main.js assets/logo.jpg 2>/dev/null
git commit -m "$(cat <<'EOF'
feat: add interactive floor-plan-to-verified-record tour after world story

Ported verbatim from the old site (6-step walkthrough, port inspector,
breadcrumb/dot/keyboard navigation) — re-themed to this project's CSS
tokens, JS logic unchanged. Placed as the closing proof beat before the
still-unbuilt Chapter 9 CTA. Bumped cache-busting query string to
world-redesign-5.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

## Self-Review Notes

- **Spec coverage:** Task 1 covers spec Section 1 in full (content, placement, styling). Task 2 covers spec Section 2 in full (content, placement, JS port, styling) plus the spec's two explicitly called-out risks (port-inspector DOM ids/dataset preserved verbatim in Step 1.5; cache-busting bump in Step 4).
- **Placeholder scan:** no TBD/TODO; every step has literal code or an exact source line range to copy from (chosen over re-transcribing the six large SVGs inline, which would risk transcription drift — line ranges are more precise than a hand-copied 300+ line SVG block).
- **Type/name consistency:** `createTour()` return shape `{ root, show }` mirrors `createWorld()`'s `{ root, update, markNeedsResize }` pattern already in `main.js`; `#proof-tour` id and all `data-*`/`id` names match 1:1 between the HTML in Task 2 Step 1 and the JS selectors in Task 2 Step 3.
