(() => {
  const portal = document.querySelector('[data-enterprise-portal]');
  if (!portal) return;

  const screenButtons = [...document.querySelectorAll('[data-preview-screen], [data-portal-screen]')];
  const screens = [...portal.querySelectorAll('[data-screen]')];
  const popover = portal.querySelector('[data-notification-popover]');
  const bell = portal.querySelector('[data-notification-toggle]');

  const openScreen = (name) => {
    const navigationName = ['material', 'form'].includes(name) ? 'documents' : name;
    screens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === name));
    screenButtons.forEach((button) => button.classList.toggle('is-active', (button.dataset.previewScreen || button.dataset.portalScreen) === navigationName));
    popover.hidden = true;
    bell.setAttribute('aria-expanded', 'false');
    portal.scrollIntoView({ block: 'start' });
  };

  screenButtons.forEach((button) => button.addEventListener('click', () => {
    const name = button.dataset.previewScreen || button.dataset.portalScreen;
    if (name) openScreen(name);
  }));

  portal.querySelectorAll('[data-open-profile]').forEach((button) => button.addEventListener('click', () => openScreen('profile')));
  portal.querySelectorAll('[data-open-material]').forEach((button) => button.addEventListener('click', () => openScreen('material')));
  portal.querySelectorAll('[data-open-form]').forEach((button) => button.addEventListener('click', () => openScreen('form')));
  portal.querySelectorAll('[data-open-processes]').forEach((button) => button.addEventListener('click', () => openScreen('processes')));
  portal.querySelectorAll('[data-submit-form]').forEach((button) => button.addEventListener('click', () => openScreen('processes')));

  bell.addEventListener('click', () => {
    const open = popover.hidden;
    popover.hidden = !open;
    bell.setAttribute('aria-expanded', String(open));
  });

  portal.querySelector('[data-read-all]')?.addEventListener('click', () => {
    popover.querySelectorAll('.is-unread').forEach((item) => item.classList.remove('is-unread'));
    bell.querySelector('i').textContent = '0';
  });
})();
