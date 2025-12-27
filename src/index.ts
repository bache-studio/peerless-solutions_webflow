import './index.css';

import { initAccordion } from './components/accordion';
import { initMarquee } from './components/marquee/marquee';
import { initSwipers } from './components/swipers';
import { initNavOnScroll } from './navigation-header/nav-on-scroll';
import { initServicesAnimation } from './navigation-header/services-animation';

window.Webflow ||= [];
window.Webflow.push(() => {
  initNavOnScroll();
  initServicesAnimation();
  initSwipers();
  initAccordion();
  initMarquee();
});
