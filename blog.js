import './header-menu.js';

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
