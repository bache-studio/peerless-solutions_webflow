export function initServicesAnimation() {
  // Interaction
  // Background blur is set to 100 opacity
  // Menu background is set to 0.6 opacity
  // menu wrapper is set to 280px height

  // Select all required elements
  const navTriggers = document.querySelectorAll<HTMLElement>('[nav-dropdown="trigger"]');

  const menuWrapper = document.querySelector<HTMLElement>('[nav-dropdown="menu-wrapper"]');
  const menuBackground = document.querySelector<HTMLElement>('[nav-dropdown="menu-background"]');
  const backgroundBlur = document.querySelector<HTMLElement>('[nav-dropdown="background-blur"]');

  // Validate all elements are found
  const missingElements: string[] = [];
  if (!navTriggers.length) {
    missingElements.push('navigation triggers [nav-dropdown="trigger"]');
  }
  if (!menuWrapper) {
    missingElements.push('menu wrapper [nav-dropdown="menu-wrapper"]');
  }
  if (!menuBackground) {
    missingElements.push('menu background [nav-dropdown="menu-background"]');
  }
  if (!backgroundBlur) {
    missingElements.push('background blur [nav-dropdown="background-blur"]');
  }

  if (missingElements.length > 0) {
    throw new Error(
      `initServicesAnimation: Missing required elements: ${missingElements.join(', ')}`
    );
  }

  // All elements found, proceed with animation setup
  // TypeScript: elements are guaranteed to exist after validation above

  let closeTimeout: number | null = null;
  let activeTrigger: HTMLElement | null = null;

  function openMenu(trigger?: HTMLElement) {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }

    // Apply menu styles
    backgroundBlur!.style.opacity = '1';
    backgroundBlur!.style.transition = 'opacity 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
    backgroundBlur!.style.backdropFilter = 'blur(10px)';
    menuWrapper!.style.transition = 'height 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)';
    menuWrapper!.style.height = '280px';
    menuWrapper!.style.opacity = '1';
    menuBackground!.style.opacity = '0.6';
    menuBackground!.style.transition = 'opacity 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)';

    // Apply active trigger styles
    if (trigger && trigger !== activeTrigger) {
      // Remove styles from previous active trigger
      if (activeTrigger) {
        activeTrigger.style.backgroundColor = '';
        const prevImage = activeTrigger.querySelector('img');
        if (prevImage) {
          prevImage.style.transform = '';
        }

        // Reset text boxes on previous trigger
        const prevTextBoxes = activeTrigger.querySelectorAll<HTMLElement>(
          '.button-interactive-mark'
        );
        prevTextBoxes.forEach((textBox) => {
          textBox.style.transform = '';
        });
      }

      // Apply styles to new active trigger
      trigger.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      const image = trigger.querySelector('img');
      if (image) {
        image.style.transform = 'rotate(180deg)';
      }

      // Animate text boxes
      const textBoxes = trigger.querySelectorAll<HTMLElement>('.button-interactive-mark');
      textBoxes.forEach((textBox) => {
        textBox.style.transform = 'translateY(-100%)';
      });

      activeTrigger = trigger;
    }
  }

  function closeMenu() {
    // Remove menu styles
    menuWrapper!.style.transition = 'height 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
    backgroundBlur!.style.opacity = '0';
    menuWrapper!.style.height = '0px';
    menuWrapper!.style.opacity = '0';
    menuBackground!.style.opacity = '0';

    // Remove active trigger styles
    if (activeTrigger) {
      activeTrigger.style.backgroundColor = '';
      const image = activeTrigger.querySelector('img');
      if (image) {
        image.style.transform = '';
      }

      // Reset text boxes
      const textBoxes = activeTrigger.querySelectorAll<HTMLElement>('.button-interactive-mark');
      textBoxes.forEach((textBox) => {
        textBox.style.transform = '';
      });

      activeTrigger = null;
    }
  }

  function scheduleClose() {
    closeTimeout = window.setTimeout(() => {
      closeMenu();
      closeTimeout = null;
    }, 100);
  }

  // Add hover listeners to all nav triggers
  navTriggers.forEach((trigger) => {
    // Set up transitions on triggers and their images
    trigger.style.transition = 'background-color 200ms ease';
    const image = trigger.querySelector('img');
    if (image) {
      image.style.transition = 'transform 200ms ease';
    }

    // Set up transitions on text boxes
    const textBoxes = trigger.querySelectorAll<HTMLElement>('.button-interactive-mark');
    textBoxes.forEach((textBox) => {
      textBox.style.transition = 'transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1)';
    });

    trigger.addEventListener('mouseenter', () => openMenu(trigger));
    trigger.addEventListener('mouseleave', scheduleClose);
  });

  // Add hover listeners to menu wrapper to keep menu open
  menuWrapper!.addEventListener('mouseenter', () => openMenu());
  menuWrapper!.addEventListener('mouseleave', scheduleClose);
}
