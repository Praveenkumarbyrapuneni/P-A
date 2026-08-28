// Role filmstrip: a draggable/scrollable horizontal reel of six team stories.
// Replaces the earlier 660dvh sticky-pin tab switcher (see styles.css comment
// at .uc-filmstrip for why) — this is simpler to follow and works the same
// way on touch, trackpad, and mouse.
const track = document.querySelector('[data-reel-track]');

if (track) {
  const reels = [...track.querySelectorAll('[data-reel]')];
  const dotsWrap = document.querySelector('[data-reel-dots]');

  const dots = reels.map((reel, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to story ${index + 1} of ${reels.length}`);
    dot.addEventListener('click', () => {
      reel.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const setActiveDot = () => {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = 0;
    let closestDistance = Infinity;
    reels.forEach((reel, index) => {
      const reelRect = reel.getBoundingClientRect();
      const distance = Math.abs(reelRect.left + reelRect.width / 2 - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === closest));
  };

  let scrollFrame = 0;
  track.addEventListener(
    'scroll',
    () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        setActiveDot();
        scrollFrame = 0;
      });
    },
    { passive: true }
  );

  // Mouse drag-to-scroll. Touch and trackpad already scroll natively.
  let dragging = false;
  let dragMoved = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') return;
    dragging = true;
    dragMoved = false;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) dragMoved = true;
    track.scrollLeft = startScroll - delta;
  });

  const endDrag = () => {
    dragging = false;
    track.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // Suppress the "Read the case" click that fires right after a drag.
  track.addEventListener(
    'click',
    (event) => {
      if (dragMoved) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  setActiveDot();
}
