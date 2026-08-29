// Shared behavior for all Resources article pages: reading progress bar,
// scroll-reveal on content blocks, and active-section highlighting in the
// on-page table of contents.

// Signature page-load moment: the headline's words rise into place staggered,
// instead of the whole block just appearing.
const heading = document.querySelector(".ap-header h1");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (heading && !reduceMotion) {
  const words = heading.textContent.trim().split(/\s+/);
  heading.innerHTML = words
    .map((w, i) => `<span class="ap-word" style="animation-delay:${i * 55}ms">${w}</span>`)
    .join(" ");
}

const fill = document.getElementById("ap-progress-fill");
function updateProgress() {
  if (!fill) return;
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
  fill.style.width = `${pct}%`;
}
document.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

  // Safety net: an article this long-form has several [data-reveal] blocks
  // stacked in sequence, and if the observer ever misses one (a timing
  // quirk, a very short viewport, anything), it should not stay blank
  // forever — force-reveal anything still hidden a few seconds after load.
  window.setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => {
      el.classList.add("is-visible");
    });
  }, 2500);

  const tocLinks = document.querySelectorAll(".ap-toc a");
  if (tocLinks.length) {
    const linkFor = (id) => document.querySelector(`.ap-toc a[href="#${id}"]`);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    document.querySelectorAll(".ap-body section[id]").forEach((el) => sectionObserver.observe(el));
  }
} else {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
}
