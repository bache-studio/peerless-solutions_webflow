export function initNavOnScroll() {
  const navbar = document.querySelector<HTMLElement>('.navbar');

  if (!navbar) {
    throw new Error('Navbar not found');
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      navbar.style.backgroundColor = '#2e2927';
    } else {
      navbar.style.backgroundColor = 'transparent';
    }
  });
}
