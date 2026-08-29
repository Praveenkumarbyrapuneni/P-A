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
  // Deliberately NOT using setPointerCapture here — capturing the pointer
  // re-targets the eventual pointerup (and the click it produces) to the
  // track itself instead of the link the user's cursor is actually over,
  // which silently ate every "See their case" click. Tracking the drag via
  // window-level listeners gets the same robustness without that trade-off.
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
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  function onPointerMove(event) {
    if (!dragging) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 4) dragMoved = true;
    track.scrollLeft = startScroll - delta;
  }

  function endDrag() {
    dragging = false;
    track.classList.remove('is-dragging');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  }

  // Suppress the "See their case" click that fires right after an actual
  // drag (so a drag-release doesn't accidentally follow the link), while
  // leaving normal clicks untouched.
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
