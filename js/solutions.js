document.documentElement.classList.add('solutions-motion');

// The cabinet reader uses the original source-page interaction model: pointer
// tilt, mode-specific overlays, and keyboard-friendly reading controls.
const rackStage = document.getElementById('rk-stage');
const rackControls = document.getElementById('rk-controls');
const rackReadout = document.getElementById('rk-read');
if (rackStage && rackControls) {
  const copy = {
    sweep: 'Reading the cabinet top to bottom. Each device registers as the sweep passes it.',
    ports: 'Port grids resolved on the patch panel and the ToR switch. Filled ports are in use.',
    leds: 'Link indicators on the powered devices. The patch panel is passive and stays dark.',
    cables: 'Cable paths traced between the ToR switch and the patch panel above it.',
  };
  const buttons = [...rackControls.querySelectorAll('.rk-btn')];
  const tilt = rackStage.querySelector('.rk-tilt');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (tilt && !reduced?.matches) {
    rackStage.addEventListener('pointermove', (event) => {
      const bounds = rackStage.getBoundingClientRect();
      const value = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      tilt.style.setProperty('--nudge', `${(value * 5).toFixed(2)}deg`);
    });
    rackStage.addEventListener('pointerleave', () => tilt.style.setProperty('--nudge', '0deg'));
  }
  const select = (button) => {
    const mode = button.dataset.rk;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    rackStage.removeAttribute('data-mode');
    void rackStage.offsetWidth;
    rackStage.dataset.mode = mode;
    if (rackReadout && copy[mode]) rackReadout.textContent = copy[mode];
  };
  rackControls.addEventListener('click', (event) => {
    const button = event.target.closest('.rk-btn');
    if (button && rackControls.contains(button)) select(button);
  });
  rackControls.addEventListener('keydown', (event) => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    let next = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next === null) return;
    event.preventDefault();
    buttons[next].focus();
    select(buttons[next]);
  });
}

const revealItems = document.querySelectorAll('.process-intro .eyebrow, .process-intro h2, .process-intro .section-lede, .process-station, .schematic-section .eyebrow, .schematic-section .schematic-lede, .original-schematic, .workflow-section, .surface-grid article, .solutions-cta, [data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));

  // Safety net: force-reveal anything the observer hasn't caught a few
  // seconds after load, so nothing can stay permanently blank.
  window.setTimeout(() => {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }, 2500);
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Process rail: the vertical line next to Capture/Check/Use fills in step
// with how far you've scrolled through the section — a plain scroll-fraction
// calc, not a pinned/scrubbed section, so it never fights the page scroll.
const processRail = document.querySelector('[data-process-rail]');
if (processRail) {
  const fill = processRail.querySelector('[data-process-fill]');
  const reducedForRail = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  if (reducedForRail?.matches) {
    fill.style.height = '100%';
  } else {
    let railTicking = false;
    const updateRail = () => {
      railTicking = false;
      const rect = processRail.getBoundingClientRect();
      const viewportAnchor = window.innerHeight * 0.75;
      const total = rect.height + viewportAnchor - window.innerHeight * 0.25;
      const traveled = Math.max(0, Math.min(total, viewportAnchor - rect.top));
      fill.style.height = `${total ? (traveled / total) * 100 : 0}%`;
    };
    const onRailScroll = () => {
      if (railTicking) return;
      railTicking = true;
      requestAnimationFrame(updateRail);
    };
    window.addEventListener('scroll', onRailScroll, { passive: true });
    window.addEventListener('resize', onRailScroll);
    updateRail();
  }
}

const surfaceGrid = document.querySelector('.surface-grid');
const workflowSection = surfaceGrid?.closest('.workflow-section');
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const wideWorkflow = window.matchMedia?.('(min-width: 981px)');
if (surfaceGrid && workflowSection) {
  const surfaceCards = [...surfaceGrid.querySelectorAll('article')];
  let surfaceIndex = 0;
  const surfaceCount = surfaceCards.length;
  let surfaceRaf = 0;
  let surfaceLoopActive = false;

  surfaceGrid.dataset.scrollMode = 'true';

  const updateSurfaceRail = () => {
    surfaceGrid.dataset.carouselIndex = String(surfaceIndex);
    surfaceCards.forEach((card, index) => {
      const slot = index - surfaceIndex;
      card.dataset.slot = String(slot);
      card.dataset.active = index === surfaceIndex ? 'true' : 'false';
      card.tabIndex = index === surfaceIndex ? 0 : -1;
    });
  };

  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));

  const renderSurfaceScroll = () => {
    surfaceRaf = 0;

    if (!surfaceLoopActive || reducedMotion?.matches || wideWorkflow?.matches === false) {
      updateSurfaceRail();
      return;
    }

    const sectionBounds = workflowSection.getBoundingClientRect();
    const travel = Math.max(1, workflowSection.offsetHeight - window.innerHeight);
    const progress = clamp(0, -sectionBounds.top / travel, 1);
    const focus = progress * Math.max(0, surfaceCount - 1);
    const nextIndex = clamp(0, Math.round(focus), surfaceCount - 1);

    if (nextIndex !== surfaceIndex) {
      surfaceIndex = nextIndex;
      surfaceGrid.dataset.carouselIndex = String(surfaceIndex);
    }

    surfaceCards.forEach((card, index) => {
      const slot = index - focus;
      const absSlot = Math.abs(slot);
      const limited = clamp(-5, slot, 5);
      const absLimited = Math.abs(limited);
      const x = limited * 17.6;
      const rotation = clamp(-18, limited * 4.5, 18);
      const scale = clamp(0.58, 1.04 - absLimited * 0.105, 1.04);
      const opacity = clamp(0.05, 1 - absSlot * 0.24, 1);
      const blur = absSlot > 3 ? Math.min(1.2, (absSlot - 3) * 0.6) : 0;
      const saturation = clamp(0.82, 1 - absSlot * 0.035, 1);
      const zIndex = String(Math.max(1, 10 - Math.round(absSlot * 2)));
      const isActive = index === nextIndex;

      card.dataset.slot = String(Math.round(index - nextIndex));
      card.dataset.active = isActive ? 'true' : 'false';
      card.tabIndex = isActive ? 0 : -1;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = blur ? `blur(${blur.toFixed(2)}px) saturate(${saturation.toFixed(2)})` : `saturate(${saturation.toFixed(2)})`;
      card.style.transform = `translateX(-50%) translateX(${x.toFixed(3)}vw) rotate(${rotation.toFixed(3)}deg) scale(${scale.toFixed(3)})`;
    });

    surfaceRaf = requestAnimationFrame(renderSurfaceScroll);
  };

  const startSurfaceLoop = () => {
    if (surfaceLoopActive) return;
    surfaceLoopActive = true;
    surfaceRaf = requestAnimationFrame(renderSurfaceScroll);
  };

  const stopSurfaceLoop = () => {
    surfaceLoopActive = false;
    if (surfaceRaf) {
      cancelAnimationFrame(surfaceRaf);
      surfaceRaf = 0;
    }
  };

  // `.workflow-section` is ~4200px tall, so an intersection-ratio threshold
  // is the wrong tool for "start a bit after the heading" — 0.18 of a
  // 4200px box needs ~750px of simultaneous overlap, which this sticky
  // layout may rarely or never reach, and the loop silently never starts.
  // Use the original lenient trigger (reliable) and instead delay just the
  // FIRST activation by a fixed beat, so the heading's own 700ms fade has
  // a head start before cards begin easing in from opacity 0.
  let hasActivatedOnce = false;
  const activateSurfaceLoop = () => {
    if (hasActivatedOnce) {
      startSurfaceLoop();
      return;
    }
    hasActivatedOnce = true;
    window.setTimeout(startSurfaceLoop, 350);
  };

  if ('IntersectionObserver' in window) {
    const workflowObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateSurfaceLoop();
        } else {
          stopSurfaceLoop();
        }
      });
    }, {
      rootMargin: '10% 0px 10% 0px',
      threshold: 0,
    });

    workflowObserver.observe(workflowSection);
  } else {
    startSurfaceLoop();
  }

  updateSurfaceRail();
}
