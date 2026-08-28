const manifest = document.querySelector("[data-manifest]");

if (manifest) {
  const rows = [...manifest.querySelectorAll("[data-manifest-row]")];
  const steps = [...manifest.querySelectorAll("[data-manifest-step]")];
  const count = manifest.querySelector("[data-manifest-count]");
  const copy = manifest.querySelector("[data-manifest-copy]");
  const previous = manifest.querySelector("[data-manifest-prev]");
  const next = manifest.querySelector("[data-manifest-next]");
  const descriptions = [
    "See exactly what's physically installed in the rack right now.",
    "Checked against your CMDB, spreadsheets, and network tools.",
    "A plain list of what matches, what's missing, and what changed."
  ];
  let activeStep = 0;

  function setStep(nextStep) {
    activeStep = (nextStep + steps.length) % steps.length;
    const displayStep = String(activeStep + 1).padStart(2, "0");

    count.textContent = `${displayStep} / ${steps.length}`;
    copy.textContent = descriptions[activeStep];

    rows.forEach((row, index) => {
      row.classList.toggle("is-active", index === activeStep);
    });

    steps.forEach((step, index) => {
      step.setAttribute("aria-selected", String(index === activeStep));
      step.classList.toggle("is-active", index === activeStep);
    });
  }

  steps.forEach((step, index) => {
    step.addEventListener("click", () => setStep(index));
  });

  previous.addEventListener("click", () => setStep(activeStep - 1));
  next.addEventListener("click", () => setStep(activeStep + 1));
}

// Pointer-tilt: gives flat cards a physical, handled-object feel by rotating
// them toward the cursor. Off for touch pointers (no hover) and for
// prefers-reduced-motion, so it's a purely decorative enhancement, never a
// dependency for reading the page. ponytail: no gesture/inertia physics,
// plain angle-follows-pointer is enough for the effect this page needs.
const wantsTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (wantsTilt) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = 7;

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    });

    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

// Evidence deck: five cards held in a physical stack, front card raised and
// legible, the rest fanned out behind it in real depth (translateZ).
const deck = document.querySelector("[data-deck]");

if (deck) {
  const cards = [...deck.querySelectorAll("[data-deck-card]")];
  const prev = deck.querySelector("[data-deck-prev]");
  const next = deck.querySelector("[data-deck-next]");
  const countEl = deck.querySelector("[data-deck-count]");
  let active = 0;

  function layout() {
    const total = cards.length;

    cards.forEach((card, index) => {
      let offset = index - active;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      card.style.setProperty("--pos", offset);
      card.style.setProperty("--depth", Math.abs(offset));
      card.classList.toggle("is-front", offset === 0);
      card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    });

    countEl.textContent = String(active + 1).padStart(2, "0");
  }

  function go(delta) {
    active = (active + delta + cards.length) % cards.length;
    layout();
  }

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (index === active) return;
      active = index;
      layout();
    });
  });

  layout();
}

// Evidence compare slider: one photo, drag to reveal "unverified" (desaturated
// overlay) vs "verified" (the base photo showing through). A native range
// input drives it — free keyboard/touch/screen-reader support, no hand-rolled
// pointer-drag math to get wrong.
const compare = document.querySelector("[data-compare]");

if (compare) {
  const range = compare.querySelector(".why-compare-range");
  const frame = compare.querySelector(".why-compare-frame");

  const setReveal = () => frame.style.setProperty("--reveal", `${range.value}%`);

  setReveal();
  range.addEventListener("input", setReveal);
}

// Scroll reveal: sections animate in as they're scrolled to, instead of
// sitting fully rendered on load. The hero is deliberately excluded — it
// must be visible the instant the page loads, only later sections reveal.
// ponytail: single shared observer + CSS transition, no animation library.
const revealTargets = [...document.querySelectorAll("[data-reveal]")];
const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (revealTargets.length && wantsMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.revealDelay || 0) * 90;
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((el) => observer.observe(el));
} else {
  // No IntersectionObserver, or the visitor asked for reduced motion:
  // show everything immediately rather than leaving it hidden forever.
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}
