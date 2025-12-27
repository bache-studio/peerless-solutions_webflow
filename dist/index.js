"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/components/accordion.ts
  function initAccordion() {
    const accordions = document.querySelectorAll(".dropdown");
    accordions.forEach((accordion) => {
      const p = accordion.querySelector("p");
      if (p && (!p.textContent || !p.textContent.trim())) {
        accordion.style.display = "none";
      }
    });
  }

  // src/components/swipers.ts
  function initSwipers() {
    const DEBUG = true;
    const log = (id, ...args) => DEBUG && console.log(`[carousel:${id}]`, ...args);
    function setDisabled(ctrl, disabled) {
      if (!ctrl) return;
      ctrl.setAttribute("aria-disabled", disabled ? "true" : "false");
      ctrl.tabIndex = disabled ? -1 : 0;
      ctrl.classList.toggle("disabled", !!disabled);
      ctrl.style.pointerEvents = disabled ? "none" : "";
    }
    function firstLiveItem(track) {
      const item = track.querySelector("[data-carousel-item]") || track.firstElementChild;
      return item || null;
    }
    function makeStepper(track) {
      return function stepSize() {
        const item = firstLiveItem(track);
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const width = item ? item.getBoundingClientRect().width : 0;
        const step = width > 0 ? width + gap : track.clientWidth;
        return step;
      };
    }
    function wireControls({ id, track, prev, next }) {
      const stepSize = makeStepper(track);
      function go(dir) {
        const dist = dir * stepSize();
        log(id, "go()", { dir, dist });
        track.scrollBy({ left: dist, behavior: "smooth" });
      }
      function onClick(dir) {
        return function(e) {
          const target = e.currentTarget;
          if (target.tagName === "A") e.preventDefault();
          if (target.getAttribute("aria-disabled") === "true") return;
          go(dir);
        };
      }
      if (prev) prev.addEventListener("click", onClick(-1));
      if (next) next.addEventListener("click", onClick(1));
      function updateButtons() {
        const sl = track.scrollLeft;
        const atStart = sl <= 0;
        const atEnd = sl + track.clientWidth >= track.scrollWidth - 1;
        setDisabled(prev, atStart);
        setDisabled(next, atEnd);
        log(id, "updateButtons()", {
          atStart,
          atEnd,
          sl: Math.round(sl),
          vw: track.clientWidth,
          sw: track.scrollWidth
        });
      }
      track.addEventListener("scroll", updateButtons, { passive: true });
      const ro = new ResizeObserver(updateButtons);
      ro.observe(track);
      requestAnimationFrame(updateButtons);
    }
    const carousels = document.querySelectorAll("[data-carousel]");
    carousels.forEach((carousel, idx) => {
      const id = idx + 1;
      const track = carousel.querySelector("[data-carousel-track]");
      const prev = carousel.querySelector("[data-carousel-prev]");
      const next = carousel.querySelector("[data-carousel-next]");
      const item = carousel.querySelector("[data-carousel-item]");
      if (!track) return log(id, "Missing [data-carousel-track] \u2014 skipping");
      if (!firstLiveItem(track) && !item) return log(id, "No items found \u2014 skipping");
      log(id, "Initialised", { carousel, track, prev, next });
      wireControls({ id, track, prev, next });
    });
  }

  // src/navigation-header/nav-on-scroll.ts
  function initNavOnScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) {
      throw new Error("Navbar not found");
    }
    window.addEventListener("scroll", () => {
      if (window.scrollY > 0) {
        navbar.style.backgroundColor = "#2e2927";
      } else {
        navbar.style.backgroundColor = "transparent";
      }
    });
  }

  // src/navigation-header/services-animation.ts
  function initServicesAnimation() {
    const navTriggers = document.querySelectorAll('[nav-dropdown="trigger"]');
    const menuWrapper = document.querySelector('[nav-dropdown="menu-wrapper"]');
    const menuBackground = document.querySelector('[nav-dropdown="menu-background"]');
    const backgroundBlur = document.querySelector('[nav-dropdown="background-blur"]');
    const missingElements = [];
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
        `initServicesAnimation: Missing required elements: ${missingElements.join(", ")}`
      );
    }
    let closeTimeout = null;
    let activeTrigger = null;
    function openMenu(trigger) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      backgroundBlur.style.opacity = "1";
      backgroundBlur.style.transition = "opacity 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)";
      backgroundBlur.style.setProperty("-webkit-backdrop-filter", "blur(10px)");
      backgroundBlur.style.backdropFilter = "blur(10px)";
      menuWrapper.style.transition = "height 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)";
      menuWrapper.style.height = "200px";
      menuWrapper.style.opacity = "1";
      menuBackground.style.opacity = "0.6";
      menuBackground.style.transition = "opacity 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)";
      if (trigger && trigger !== activeTrigger) {
        if (activeTrigger) {
          activeTrigger.style.backgroundColor = "";
          const prevImage = activeTrigger.querySelector("img");
          if (prevImage) {
            prevImage.style.transform = "";
          }
          const prevTextBoxes = activeTrigger.querySelectorAll(
            ".button-interactive-mark"
          );
          prevTextBoxes.forEach((textBox) => {
            textBox.style.transform = "";
          });
        }
        trigger.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        const image = trigger.querySelector("img");
        if (image) {
          image.style.transform = "rotate(180deg)";
        }
        const textBoxes = trigger.querySelectorAll(".button-interactive-mark");
        textBoxes.forEach((textBox) => {
          textBox.style.transform = "translateY(-100%)";
        });
        activeTrigger = trigger;
      }
    }
    function closeMenu() {
      menuWrapper.style.transition = "height 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)";
      backgroundBlur.style.opacity = "0";
      menuWrapper.style.height = "0px";
      menuWrapper.style.opacity = "0";
      menuBackground.style.opacity = "0";
      if (activeTrigger) {
        activeTrigger.style.backgroundColor = "";
        const image = activeTrigger.querySelector("img");
        if (image) {
          image.style.transform = "";
        }
        const textBoxes = activeTrigger.querySelectorAll(".button-interactive-mark");
        textBoxes.forEach((textBox) => {
          textBox.style.transform = "";
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
    navTriggers.forEach((trigger) => {
      trigger.style.transition = "background-color 200ms ease";
      const image = trigger.querySelector("img");
      if (image) {
        image.style.transition = "transform 200ms ease";
      }
      const textBoxes = trigger.querySelectorAll(".button-interactive-mark");
      textBoxes.forEach((textBox) => {
        textBox.style.transition = "transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1)";
      });
      trigger.addEventListener("mouseenter", () => openMenu(trigger));
      trigger.addEventListener("mouseleave", scheduleClose);
    });
    menuWrapper.addEventListener("mouseenter", () => openMenu());
    menuWrapper.addEventListener("mouseleave", scheduleClose);
  }

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(() => {
    initNavOnScroll();
    initServicesAnimation();
    initSwipers();
    initAccordion();
  });
})();
//# sourceMappingURL=index.js.map
