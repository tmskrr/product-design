(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  window.addEventListener('load', () => {
    window.setTimeout(() => root.classList.add('is-loaded'), reduced ? 0 : 760);
  });

  const reveals = document.querySelectorAll('.reveal-group, .reveal-interface');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((element) => revealObserver.observe(element));
  }

  const links = [...document.querySelectorAll('.preview-index a')];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-24% 0px -62% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
