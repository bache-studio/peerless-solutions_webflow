export function initAccordion() {
  const accordions = document.querySelectorAll<HTMLElement>('.dropdown');

  accordions.forEach((accordion) => {
    const p = accordion.querySelector('p');
    if (p && (!p.textContent || !p.textContent.trim())) {
      accordion.style.display = 'none';
    }
  });
}
