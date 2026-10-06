const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');

function closeMenu() {
  header.classList.remove('is-menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
}

toggle.addEventListener('click', () => {
  const open = !header.classList.contains('is-menu-open');
  header.classList.toggle('is-menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
    closeMenu();
    toggle.focus();
  }
});
header.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const tocLinks = [...document.querySelectorAll('.article-toc a')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    tocLinks.forEach((link) => {
      if (link.hash === `#${visible[0].target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-90px 0px -60% 0px' });
  tocLinks.forEach((link) => {
    const heading = document.getElementById(link.hash.slice(1));
    if (heading) observer.observe(heading);
    link.addEventListener('click', () => {
      heading?.focus({ preventScroll: true });
    });
    heading?.setAttribute('tabindex', '-1');
  });
}
