(() => {
  const icons = {
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-up-right': '<path d="M17 7 7 17"/><path d="M8 7h9v9"/>',
    'mail': '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m3 7 9 6 9-6"/>',
    'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'close': '<path d="m18 6-12 12M6 6l12 12"/>',
    'brand-telegram': '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    'brand-whatsapp': '<path d="M3 21l1.65-3.8A9 9 0 1 1 8 20.1z"/><path d="M9 10a5 5 0 0 0 5 5h1l1-2-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2-2 1v1z"/>'
  };
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const path = icons[el.dataset.icon];
    if (!path) return;
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  });
})();
