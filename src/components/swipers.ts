// Custom swipers
export function initSwipers() {
  const DEBUG = true; // toggle

  // ---- helpers -------------------------------------------------------------
  const log = (id: number | string, ...args: unknown[]) =>
    DEBUG && console.log(`[carousel:${id}]`, ...args);

  function setDisabled(ctrl: HTMLElement | null, disabled: boolean) {
    if (!ctrl) return;
    ctrl.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    ctrl.tabIndex = disabled ? -1 : 0; // generic focus mgmt for div/a/button
    ctrl.classList.toggle('disabled', !!disabled);
    ctrl.style.pointerEvents = disabled ? 'none' : ''; // critical for <div> and <a>
  }

  function firstLiveItem(track: Element): Element | null {
    // Prefer an explicit item if present; fallback to first element child
    const item = track.querySelector('[data-carousel-item]') || track.firstElementChild;
    return item || null;
  }

  function makeStepper(track: HTMLElement) {
    // Recalculate every time (responsive + Webflow IX)
    return function stepSize() {
      const item = firstLiveItem(track);
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const width = item ? item.getBoundingClientRect().width : 0;
      const step = width > 0 ? width + gap : track.clientWidth; // fallback
      return step;
    };
  }

  interface WireControlsParams {
    id: number | string;
    track: HTMLElement;
    prev: HTMLElement | null;
    next: HTMLElement | null;
  }

  function wireControls({ id, track, prev, next }: WireControlsParams) {
    const stepSize = makeStepper(track);

    function go(dir: number) {
      const dist = dir * stepSize();
      log(id, 'go()', { dir, dist });
      track.scrollBy({ left: dist, behavior: 'smooth' });
    }

    function onClick(dir: number) {
      return function (e: Event) {
        const target = e.currentTarget as HTMLElement;
        // block anchors default nav and ignore when disabled
        if (target.tagName === 'A') e.preventDefault();
        if (target.getAttribute('aria-disabled') === 'true') return;
        go(dir);
      };
    }

    if (prev) prev.addEventListener('click', onClick(-1));
    if (next) next.addEventListener('click', onClick(1));

    function updateButtons() {
      const sl = track.scrollLeft;
      const atStart = sl <= 0;
      const atEnd = sl + track.clientWidth >= track.scrollWidth - 1;
      setDisabled(prev, atStart);
      setDisabled(next, atEnd);
      log(id, 'updateButtons()', {
        atStart,
        atEnd,
        sl: Math.round(sl),
        vw: track.clientWidth,
        sw: track.scrollWidth,
      });
    }

    // keep state fresh
    track.addEventListener('scroll', updateButtons, { passive: true });
    const ro = new ResizeObserver(updateButtons);
    ro.observe(track);
    // First paint (after layout)
    requestAnimationFrame(updateButtons);
  }

  // ---- internal carousels --------------------------------------------------
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach((carousel, idx) => {
    const id = idx + 1;

    const track = carousel.querySelector('[data-carousel-track]') as HTMLElement | null;
    const prev = carousel.querySelector('[data-carousel-prev]') as HTMLElement | null;
    const next = carousel.querySelector('[data-carousel-next]') as HTMLElement | null;
    const item = carousel.querySelector('[data-carousel-item]');

    if (!track) return log(id, 'Missing [data-carousel-track] — skipping');
    if (!firstLiveItem(track) && !item) return log(id, 'No items found — skipping');

    log(id, 'Initialised', { carousel, track, prev, next });
    wireControls({ id, track, prev, next });
  });
}
