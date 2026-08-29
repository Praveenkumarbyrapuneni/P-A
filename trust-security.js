// Trust & Security — motion pass.
//
// Lesson from the first cut of this file: base content visibility was
// wired through GSAP ScrollTrigger callbacks, and something about that
// setup silently never fired for several sections, leaving real content
// stuck at its CSS "not yet revealed" opacity:0 forever — invisible, not
// just unanimated. That's a worse failure than no motion at all.
//
// Fix: content visibility is now driven ONLY by IntersectionObserver
// (the same dependency-free mechanism every other page script in this
// repo already uses successfully) toggling a plain `.is-in` class that
// CSS transitions handle. GSAP + ScrollTrigger are layered on top purely
// as enhancement — line-drawing, scroll parallax, a magnetic button, an
// auto-played demo — on content that is ALREADY guaranteed visible by the
// observer. If GSAP fails to load entirely, every visible thing on this
// page still works; you just lose the extra flourish.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const gsapReady = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
if (gsapReady) window.gsap.registerPlugin(window.ScrollTrigger);

// ---- Console readout: stagger the status lines in on load. ----
const consoleLines = document.querySelectorAll("[data-console] .tsec-console-lines li");
if (reduceMotion) {
  consoleLines.forEach((line) => line.classList.add("is-in"));
} else {
  consoleLines.forEach((line, i) => {
    window.setTimeout(() => line.classList.add("is-in"), 260 + i * 140);
  });
}

// ---- Base content reveal: ledger rows, filing entries, flow nodes.
// IntersectionObserver only — this is the part that must never fail. ----
const revealTargets = document.querySelectorAll("[data-reveal], .tsec-flow-node");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("is-in"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -22% 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// ---- Left-rail scrollspy: which section is active right now. Also
// IntersectionObserver, independent of the fill animation below. ----
const indexLinks = document.querySelectorAll("[data-index-link]");
const sections = Array.from(document.querySelectorAll("[data-index-section]"));
if (sections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        indexLinks.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.indexLink === visible.target.dataset.indexSection);
        });
      }
    },
    { threshold: [0.15, 0.3, 0.5, 0.7], rootMargin: "-15% 0px -55% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
  indexLinks[0]?.classList.add("is-active");
}

// ---- Deployment spectrum click handling. Independent of GSAP. ----
const spectrum = document.querySelector("[data-spectrum]");
if (spectrum) {
  const stops = spectrum.querySelectorAll(".tsec-spectrum-stop");
  const details = spectrum.querySelectorAll("[data-spectrum-detail]");
  const fill = spectrum.querySelector("[data-spectrum-fill]");

  function activateStop(index) {
    stops.forEach((stop, i) => {
      const active = i === index;
      stop.classList.toggle("is-active", active);
      stop.setAttribute("aria-pressed", String(active));
    });
    details.forEach((detail) => {
      detail.classList.toggle("is-active", Number(detail.dataset.spectrumDetail) === index);
    });
    if (fill) {
      const pct = `${(index / (stops.length - 1)) * 100}%`;
      if (gsapReady) window.gsap.to(fill, { width: pct, duration: 0.5, ease: "power3.out" });
      else fill.style.width = pct;
    }
  }
  window.tsecActivateStop = activateStop;
  stops.forEach((stop, i) => stop.addEventListener("click", () => activateStop(i)));
}

// ---- Everything below is pure enhancement layered on already-visible
// content: safe to skip entirely if GSAP didn't load. ----
if (gsapReady && !reduceMotion) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Hero headline lines rise in on load.
  gsap.from(".tsec-h-line span", { y: "110%", autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" });

  // Hero copy / console drift at slightly different scroll speeds.
  gsap.to(".tsec-hero-copy", {
    y: -34, ease: "none",
    scrollTrigger: { trigger: ".tsec-hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".tsec-console", {
    y: 22, ease: "none",
    scrollTrigger: { trigger: ".tsec-hero", start: "top top", end: "bottom top", scrub: true },
  });

  // Data Handling: the connecting SVG line draws itself as the section
  // scrolls past, lighting each node solid the instant it's reached.
  const flowNodes = gsap.utils.toArray(".tsec-flow-node");
  const flowLine = document.querySelector(".tsec-flow-svg line");
  if (flowNodes.length && flowLine) {
    gsap.to(flowLine, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: {
        trigger: ".tsec-flow", start: "top 65%", end: "bottom 75%", scrub: 0.6,
        onUpdate: (self) => {
          const litCount = Math.min(flowNodes.length, Math.ceil(self.progress * flowNodes.length) + 1);
          flowNodes.forEach((node, i) => node.classList.toggle("is-lit", i < litCount));
        },
      },
    });
  }

  // Left rail: continuous scroll-progress fill (decorative, the active
  // section highlight above already works without this).
  const indexFill = document.querySelector("[data-index-fill]");
  const sectionsBlock = document.querySelector(".tsec-sections");
  if (indexFill && sectionsBlock) {
    gsap.to(indexFill, {
      height: "100%", ease: "none",
      scrollTrigger: { trigger: sectionsBlock, start: "top 35%", end: "bottom 65%", scrub: true },
    });
  }

  // Deployment spectrum: auto-walk the four stops once on first view.
  if (spectrum) {
    ScrollTrigger.create({
      trigger: spectrum, start: "top 70%", once: true,
      onEnter: () => {
        const tl = gsap.timeline({ delay: 0.3 });
        [0, 1, 2, 3].forEach((i) => {
          tl.call(() => window.tsecActivateStop && window.tsecActivateStop(i), null, i === 0 ? 0 : "+=0.55");
        });
      },
    });
  }

  // Magnetic primary CTAs, pointer-fine devices only.
  if (canHover) {
    document.querySelectorAll(".tsec-hero-ctas .button-primary, .tsec-cta-actions .button-primary").forEach((btn) => {
      const moveX = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      const moveY = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        moveX((e.clientX - (rect.left + rect.width / 2)) * 0.28);
        moveY((e.clientY - (rect.top + rect.height / 2)) * 0.35);
      });
      btn.addEventListener("mouseleave", () => { moveX(0); moveY(0); });
    });
  }

  // Defensive: web fonts and images can shift layout after these
  // triggers are created, which would offset the scrub start/end points.
  window.addEventListener("load", () => ScrollTrigger.refresh());
} else if (gsapReady && reduceMotion) {
  // GSAP is present but the visitor asked for reduced motion — light the
  // flow diagram and index fill straight to their end states, no scrub.
  document.querySelectorAll(".tsec-flow-node").forEach((n) => n.classList.add("is-lit"));
  const line = document.querySelector(".tsec-flow-svg line");
  if (line) line.style.strokeDashoffset = "0";
  const indexFill = document.querySelector("[data-index-fill]");
  if (indexFill) indexFill.style.height = "100%";
}
