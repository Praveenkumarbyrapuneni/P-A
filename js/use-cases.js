// The fixed nav sits on top of the dark opening hero (needs light text)
// and then the light body below it (needs dark text) at the same time,
// since it never scrolls away. Toggle a body class once the hero clears
// the header, instead of a hardcoded scroll-position guess, so it still
// lines up if the hero's height ever changes.
const hero = document.querySelector('.uc-opening');

if (hero) {
  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.offsetHeight : 80;

  const observer = new IntersectionObserver(
    ([entry]) => {
      document.body.classList.toggle('is-past-hero', !entry.isIntersecting);
    },
    { rootMargin: `-${headerHeight}px 0px 0px 0px` }
  );
  observer.observe(hero);
}
