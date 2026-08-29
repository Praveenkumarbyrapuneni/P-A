// About Us — same proven-safe pattern as trust-security.js: content
// visibility is driven ONLY by IntersectionObserver toggling `.is-in`
// (never by a ScrollTrigger callback — see AGENTS.md for why). GSAP is
// strictly decoration layered on top of content that's already visible
// by construction: the founder-narrative spine line drawing itself, the
// stat numbers counting up, a load-in on the headline.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const gsapReady = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
if (gsapReady) window.gsap.registerPlugin(window.ScrollTrigger);

// ---- Base content reveal (bulletproof, IntersectionObserver only). ----
const revealTargets = document.querySelectorAll("[data-reveal]");
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

  // Safety net: force-reveal anything the observer hasn't caught a few
  // seconds after load, so nothing can stay permanently blank.
  window.setTimeout(() => {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }, 2500);
}

// ---- Stat count-up: only fires once its number is already visible
// (piggybacks on the same reveal, not a separate ScrollTrigger gate). ----
const statNums = document.querySelectorAll("[data-count-to]");
if (statNums.length) {
  if (reduceMotion) {
    statNums.forEach((el) => {
      el.textContent = `${el.dataset.countTo}${el.dataset.countSuffix || ""}`;
    });
  } else if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countObserver.unobserve(entry.target);
          const el = entry.target;
          const target = parseFloat(el.dataset.countTo);
          const suffix = el.dataset.countSuffix || "";
          const decimals = (el.dataset.countTo.split(".")[1] || "").length;
          const duration = 1100;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach((el) => countObserver.observe(el));
  } else {
    statNums.forEach((el) => {
      el.textContent = `${el.dataset.countTo}${el.dataset.countSuffix || ""}`;
    });
  }
}

// ---- Everything below is pure enhancement on already-visible content. ----
if (gsapReady && !reduceMotion) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Hero headline rises in on load.
  gsap.from(".ab-h-line span", { y: "110%", autoAlpha: 0, duration: 0.8, ease: "power3.out" });

  // Hero photo drifts slightly slower than the copy on scroll.
  gsap.to(".ab-hero-figure", {
    y: -26, ease: "none",
    scrollTrigger: { trigger: ".ab-hero", start: "top top", end: "bottom top", scrub: true },
  });

  // Founder-narrative spine: the connecting line draws itself as the
  // visitor scrolls through the four beats.
  const spineLine = document.querySelector(".ab-spine-svg line");
  const spineWrap = document.querySelector(".ab-spine-wrap");
  if (spineLine && spineWrap) {
    spineLine.classList.add("ab-spine-progress");
    gsap.to(spineLine, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: spineWrap, start: "top 70%", end: "bottom 80%", scrub: 0.6 },
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
