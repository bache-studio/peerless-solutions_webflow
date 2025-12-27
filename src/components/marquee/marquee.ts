import './marquee.css';

// Helper function to wait for all images to load
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll<HTMLImageElement>('img');
  // eslint-disable-next-line no-console
  console.log('[Marquee] Found', images.length, 'images in list');

  if (images.length === 0) {
    // eslint-disable-next-line no-console
    console.log('[Marquee] No images found, proceeding immediately');
    return Promise.resolve();
  }

  const imagePromises = Array.from(images).map((img, index) => {
    if (img.complete) {
      // eslint-disable-next-line no-console
      console.log(`[Marquee] Image ${index + 1} already loaded`);
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => {
        // eslint-disable-next-line no-console
        console.log(`[Marquee] Image ${index + 1} loaded`);
        resolve();
      };
      img.onerror = () => {
        // eslint-disable-next-line no-console
        console.warn(`[Marquee] Image ${index + 1} failed to load, continuing anyway`);
        resolve(); // Resolve even on error to not block
      };
    });
  });

  return Promise.all(imagePromises).then(() => {
    // eslint-disable-next-line no-console
    console.log('[Marquee] All images loaded');
  });
};

export const initMarquee = () => {
  // eslint-disable-next-line no-console
  console.log('[Marquee] Initializing marquee...');

  const track = document.querySelector<HTMLElement>('.marquee-track');
  const list = document.querySelector<HTMLElement>('.marquee-list');

  if (!track) {
    // eslint-disable-next-line no-console
    console.warn('[Marquee] .marquee-track not found, aborting');
    return;
  }

  if (!list) {
    // eslint-disable-next-line no-console
    console.warn('[Marquee] .marquee-list not found, aborting');
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[Marquee] Elements found - track and list exist');

  // 1. Clear any existing clones (safety for re-runs)
  const existingClones = track.querySelectorAll('.marquee-list:not(:first-child)');
  if (existingClones.length > 0) {
    // eslint-disable-next-line no-console
    console.log('[Marquee] Removing', existingClones.length, 'existing clones');
    existingClones.forEach((clone) => clone.remove());
  }

  // 2. Wait for all images to load before measuring
  // eslint-disable-next-line no-console
  console.log('[Marquee] Waiting for images to load...');
  waitForImages(list)
    .then(() => {
      // Use requestAnimationFrame to ensure layout is calculated
      requestAnimationFrame(() => {
        // 3. Get the width of one list item set (after images are loaded)
        const listWidth = list.offsetWidth;
        // eslint-disable-next-line no-console
        console.log('[Marquee] List width measured:', listWidth, 'px');

        if (listWidth === 0) {
          console.error(
            '[Marquee] List width is 0, aborting. This might indicate images failed to load or layout issues.'
          );
          return; // Exit if list still has no width
        }

        // 4. Calculate how many clones we need to fill viewport + buffer
        // We want at least 2x viewport width for seamless scrolling
        const viewportWidth = window.innerWidth;
        const minContentWidth = viewportWidth * 2;
        const clonesNeeded = Math.ceil(minContentWidth / listWidth) + 1; // +1 for extra buffer
        // eslint-disable-next-line no-console
        console.log('[Marquee] Viewport width:', viewportWidth, 'px');
        // eslint-disable-next-line no-console
        console.log('[Marquee] Clones needed:', clonesNeeded);

        // 5. Clone the content enough times
        // eslint-disable-next-line no-console
        console.log('[Marquee] Creating clones...');
        for (let i = 0; i < clonesNeeded; i++) {
          const clone = list.cloneNode(true) as HTMLElement;
          clone.setAttribute('aria-hidden', 'true'); // Hide from screen readers
          track.appendChild(clone);
        }
        // eslint-disable-next-line no-console
        console.log('[Marquee] Created', clonesNeeded, 'clones');

        // 6. Measure the total track width after all clones are added
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          const trackWidth = track.scrollWidth;
          const singleListWidth = list.offsetWidth;

          // eslint-disable-next-line no-console
          console.log('[Marquee] Final measurements:');
          // eslint-disable-next-line no-console
          console.log('  - Track width:', trackWidth, 'px');
          // eslint-disable-next-line no-console
          console.log('  - Single list width:', singleListWidth, 'px');
          // eslint-disable-next-line no-console
          console.log('  - Move distance:', `-${singleListWidth}px`);

          // Calculate animation duration based on constant speed
          // Speed = Distance / Time, so Time = Distance / Speed
          // We want constant speed regardless of marquee size (e.g., 50px per second)
          const MARQUEE_SPEED_PX_PER_SEC = 50; // Adjust this value to change speed
          const animationDuration = singleListWidth / MARQUEE_SPEED_PX_PER_SEC;

          // Set CSS variables
          track.style.setProperty('--track-width', `${trackWidth}px`);
          track.style.setProperty('--list-width', `${singleListWidth}px`);
          track.style.setProperty('--move-distance', `-${singleListWidth}px`);
          track.style.setProperty('--marquee-duration', `${animationDuration}s`);
          // eslint-disable-next-line no-console
          console.log('[Marquee] CSS variables set');
          // eslint-disable-next-line no-console
          console.log(
            '  - Animation duration:',
            animationDuration.toFixed(2),
            's (speed:',
            MARQUEE_SPEED_PX_PER_SEC,
            'px/s)'
          );

          // Show the marquee once everything is ready
          track.classList.add('marquee-ready');
          // eslint-disable-next-line no-console
          console.log('[Marquee] Marquee ready! Added marquee-ready class');
        });
      });
    })
    .catch((error) => {
      console.error('[Marquee] Error during initialization:', error);
    });
};
