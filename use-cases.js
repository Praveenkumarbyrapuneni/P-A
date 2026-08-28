const navigator = document.querySelector('[data-role-navigator]');

if (navigator) {
  const buttons = [...navigator.querySelectorAll('[data-role]')];
  const panels = [...navigator.querySelectorAll('[data-role-panel]')];
  const images = [...navigator.querySelectorAll('[data-role-image]')];
  const number = navigator.querySelector('[data-role-number]');
  const casePages = [
    'use-case-infrastructure-data-center-leaders.html',
    'use-case-network-architects-engineers.html',
    'use-case-security-vulnerability-teams.html',
    'use-case-compliance-audit-owners.html',
    'use-case-incident-responders-on-call.html',
    'use-case-m-a-migration-teams.html',
  ];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 981px)');
  let activeIndex = 0;
  let frame = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const setActive = (index, shouldFocus = false) => {
    activeIndex = clamp(index, 0, buttons.length - 1);
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeIndex;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      if (selected && shouldFocus) button.focus({ preventScroll: true });
    });

    panels.forEach((panel, panelIndex) => {
      const selected = panelIndex === activeIndex;
      panel.classList.toggle('is-active', selected);
      panel.hidden = !selected;
      const link = panel.querySelector('a');
      if (link) {
        link.href = casePages[panelIndex];
        link.firstChild.textContent = 'Read the case ';
      }
    });

    images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === activeIndex));
    if (number) number.textContent = String(activeIndex + 1).padStart(2, '0');
  };

  const scrollToRole = (index) => {
    if (!desktop.matches || reducedMotion.matches) return;
    const range = Math.max(1, navigator.offsetHeight - window.innerHeight);
    const target = navigator.offsetTop + range * (index / (buttons.length - 1));
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      setActive(index);
      scrollToRole(index);
    });
    button.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === null) return;
      event.preventDefault();
      setActive(next, true);
      scrollToRole(next);
    });
  });

  const updateFromScroll = () => {
    frame = 0;
    if (!desktop.matches || reducedMotion.matches) return;
    const bounds = navigator.getBoundingClientRect();
    const range = Math.max(1, navigator.offsetHeight - window.innerHeight);
    const progress = clamp(-bounds.top / range, 0, 1);
    setActive(Math.round(progress * (buttons.length - 1)));
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(updateFromScroll);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  desktop.addEventListener?.('change', requestUpdate);
  reducedMotion.addEventListener?.('change', requestUpdate);
  setActive(0);
  requestUpdate();
}
