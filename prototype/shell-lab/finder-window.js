// Окно раздела поверх живого рабочего стола (прототип, направление A).
// Состояния: open → minimized → open, open → closed, open ↔ zoomed.
// Рабочий стол, шапка и Dock не перезагружаются: меняется только состояние окна,
// адрес в браузере обновляется через History API (кнопки «назад/вперёд» работают).
(() => {
  const body = document.body;
  const win = document.querySelector('.win');
  if (!win) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE_OUT = 'cubic-bezier(.2, .7, .2, 1)';
  const EASE_IN = 'cubic-bezier(.4, 0, .75, .2)';
  const WINDOW_URL = win.dataset.windowUrl;
  const WINDOW_TITLE = win.dataset.windowTitle || document.title;
  const DESKTOP_URL = body.dataset.desktopUrl;
  const DESKTOP_TITLE = body.dataset.desktopTitle || document.title;
  const LABEL = win.querySelector('.win__title')?.textContent.trim() || 'Окно';

  let state = 'open';          // open | minimized | closed
  let busy = null;             // текущая анимация окна

  const dur = (ms) => (reduce.matches ? 0 : ms);
  const animate = (keyframes, options) => {
    busy?.cancel();
    busy = win.animate(keyframes, { fill: 'both', ...options, duration: dur(options.duration) });
    return busy.finished.catch(() => {});
  };

  // ---------- Dock: тот же элемент открытого окна, что в workspace-a ----------
  let dock = null;
  let dockItem = null;
  const folderIcon = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3.5 9.5A3.5 3.5 0 0 1 7 6h6l3 3h9a3.5 3.5 0 0 1 3.5 3.5v11A3.5 3.5 0 0 1 25 27H7a3.5 3.5 0 0 1-3.5-3.5Z"/></svg>';

  const ensureDockItem = () => {
    dock = dock || document.querySelector('.workspace-dock');
    if (!dock || dockItem) return;
    dock.insertAdjacentHTML('beforeend', `
      <span class="workspace-dock__separator" aria-hidden="true"></span>
      <a class="workspace-dock__current workspace-dock__current--projects" href="${WINDOW_URL}" aria-controls="${win.id}">
        <span class="workspace-dock__window" aria-hidden="true"><i></i>${folderIcon}<b>${LABEL}</b></span>
        <span class="workspace-dock__label">${LABEL}</span>
      </a>`);
    dockItem = dock.querySelector('.workspace-dock__current');
    dockItem.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      if (state === 'minimized') restore();
      else if (state === 'closed') open({ from: dockItem });
      else if (state === 'open') win.focus({ preventScroll: true });
    });
  };

  const syncDock = () => {
    ensureDockItem();
    if (!dock || !dockItem) return;
    dock.classList.toggle('is-window-closed', state === 'closed');
    dockItem.classList.toggle('is-minimized', state === 'minimized');
    const label = dockItem.querySelector('.workspace-dock__label');
    if (state === 'open') {
      dockItem.setAttribute('aria-current', 'page');
      dockItem.setAttribute('aria-label', `Открыт раздел: ${LABEL}`);
      label.textContent = LABEL;
    } else if (state === 'minimized') {
      dockItem.removeAttribute('aria-current');
      dockItem.setAttribute('aria-label', `Вернуть свёрнутое окно: ${LABEL}`);
      label.textContent = `${LABEL} — свёрнуто`;
    } else {
      dockItem.removeAttribute('aria-current');
      dockItem.setAttribute('aria-label', `Открыть: ${LABEL}`);
    }
    dockItem.tabIndex = state === 'closed' ? -1 : 0;
  };

  // ---------- Адрес и заголовок вкладки ----------
  const setUrl = (next, mode = 'push') => {
    const open = next === 'open';
    const url = open ? WINDOW_URL : DESKTOP_URL;
    document.title = open ? WINDOW_TITLE : DESKTOP_TITLE;
    if (mode === 'none' || !url) return;
    const data = { window: next };
    if (mode === 'replace') history.replaceState(data, '', url);
    else history.pushState(data, '', url);
  };

  // ---------- Геометрия для анимаций ----------
  const rectOf = (el) => el?.getBoundingClientRect();
  const towards = (target) => {
    const w = rectOf(win);
    const t = rectOf(target);
    if (!w || !t || !t.width) return 'translateY(40px) scale(.9)';
    const dx = t.left + t.width / 2 - (w.left + w.width / 2);
    const dy = t.top + t.height / 2 - (w.top + w.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${Math.max(.04, t.width / w.width)}, ${Math.max(.04, t.height / w.height)})`;
  };

  // ---------- Переходы состояний ----------
  const show = () => { win.hidden = false; body.classList.add('is-window-open'); };
  const hide = () => {
    win.hidden = true;
    body.classList.remove('is-window-open', 'is-menu-open');
    busy?.cancel(); busy = null;
  };

  const open = async ({ from, url = 'push' } = {}) => {
    if (state === 'open' && !win.hidden) return;
    const wasMinimized = state === 'minimized';
    state = 'open';
    show();
    syncDock();
    setUrl('open', url);
    if (dockItem && !wasMinimized) { dockItem.classList.remove('is-arriving'); void dockItem.offsetWidth; dockItem.classList.add('is-arriving'); }
    const start = from ? towards(from) : 'translateY(8px) scale(.985)';
    await animate([{ transform: start, opacity: from ? .3 : 0 }, { transform: 'none', opacity: 1 }], { duration: from ? 340 : 260, easing: EASE_OUT });
    win.focus({ preventScroll: true });
  };

  const restore = (options = {}) => open({ from: dockItem, ...options });

  const close = async ({ url = 'push' } = {}) => {
    if (state === 'closed') return;
    if (body.classList.contains('is-zoomed')) setZoomed(false, false);
    state = 'closed';
    syncDock();
    setUrl('closed', url);
    await animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.97)', opacity: 0 }], { duration: 190, easing: 'ease-in' });
    if (state === 'closed') hide();
    document.querySelector('[data-open-window]')?.focus({ preventScroll: true });
  };

  const minimize = async ({ url = 'push' } = {}) => {
    if (state !== 'open') return;
    state = 'minimized';
    syncDock();
    setUrl('minimized', url);
    await animate([{ transform: 'none', opacity: 1 }, { transform: towards(dockItem), opacity: .15 }], { duration: 360, easing: EASE_IN });
    if (state === 'minimized') hide();
    dockItem?.focus({ preventScroll: true });
  };

  // ---------- Разворот ----------
  const zoom = win.querySelector('[data-win="zoom"]');
  const setZoomed = (value, animated = true) => {
    if (value === body.classList.contains('is-zoomed')) return;
    if (animated && !reduce.matches) {
      win.classList.add('is-resizing');
      window.setTimeout(() => win.classList.remove('is-resizing'), 320);
    }
    body.classList.toggle('is-zoomed', value);
    zoom?.setAttribute('aria-pressed', String(value));
    zoom?.setAttribute('aria-label', value ? 'Вернуть обычный размер окна' : 'Развернуть окно');
  };

  // ---------- Кнопки окна ----------
  const plainClick = (event) => !(event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1);
  win.querySelectorAll('[data-win="close"], [data-win="back"]').forEach((el) => el.addEventListener('click', (event) => {
    if (!plainClick(event)) return;
    event.preventDefault();
    close();
  }));
  win.querySelector('[data-win="minimize"]')?.addEventListener('click', () => minimize());
  zoom?.addEventListener('click', () => setZoomed(!body.classList.contains('is-zoomed')));
  win.addEventListener('dblclick', (event) => { if (event.target.closest('.win__toolbar') && !event.target.closest('a, button')) setZoomed(!body.classList.contains('is-zoomed')); });

  // Папка «Проекты» на рабочем столе открывает это же окно, без перехода на другую страницу
  document.querySelectorAll('[data-open-window]').forEach((folder) => folder.addEventListener('click', (event) => {
    if (!plainClick(event)) return;
    event.preventDefault();
    if (state === 'minimized') restore();
    else open({ from: folder.querySelector('.desktop-folder__icon') || folder });
  }));

  // ---------- Смена раздела: выделение переезжает, содержимое тает, окно остаётся ----------
  const nav = win.querySelector('[data-win-nav]');
  const indicator = nav?.querySelector('[data-indicator]');
  const current = () => nav?.querySelector('[aria-current="page"]');
  const moveIndicator = (link, animated = true) => {
    if (!indicator || !link) return;
    indicator.classList.toggle('is-instant', !animated);
    indicator.style.transform = `translateY(${link.offsetTop}px)`;
    indicator.style.height = `${link.offsetHeight}px`;
    indicator.style.opacity = '1';
  };
  moveIndicator(current(), false);
  window.addEventListener('resize', () => moveIndicator(current(), false));

  const leaveTo = (link) => {
    body.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = link.href; }, dur(220));
  };
  nav?.querySelectorAll('a[href]:not([data-win])').forEach((link) => link.addEventListener('click', (event) => {
    if (!plainClick(event)) return;
    event.preventDefault();
    if (link.getAttribute('aria-current') === 'page') return;
    current()?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'page');
    moveIndicator(link);
    leaveTo(link);
  }));

  // ---------- Mobile: меню разделов в заголовке ----------
  const menuButton = win.querySelector('[data-win-menu-button]');
  const menu = win.querySelector('[data-win-menu]');
  const setMenu = (value) => {
    if (!menuButton || !menu) return;
    body.classList.toggle('is-menu-open', value);
    menuButton.setAttribute('aria-expanded', String(value));
  };
  menuButton?.addEventListener('click', () => setMenu(!body.classList.contains('is-menu-open')));
  menu?.querySelectorAll('a[href]:not([data-win])').forEach((link) => link.addEventListener('click', (event) => {
    if (!plainClick(event) || link.getAttribute('aria-current') === 'page') { if (link.getAttribute('aria-current') === 'page') { event.preventDefault(); setMenu(false); } return; }
    event.preventDefault();
    setMenu(false);
    leaveTo(link);
  }));
  document.addEventListener('pointerdown', (event) => {
    if (!body.classList.contains('is-menu-open') || menu.contains(event.target) || menuButton.contains(event.target)) return;
    setMenu(false);
  });

  // ---------- Прокрутка: разделитель под toolbar ----------
  const scroller = win.querySelector('[data-win-scroll]');
  const toolbar = win.querySelector('.win__toolbar');
  scroller?.addEventListener('scroll', () => toolbar?.classList.toggle('is-scrolled', scroller.scrollTop > 2), { passive: true });

  // ---------- Клавиатура ----------
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (body.classList.contains('is-menu-open')) { setMenu(false); menuButton?.focus(); return; }
    if (state === 'open' && body.classList.contains('is-zoomed')) setZoomed(false);
  });

  // ---------- История браузера ----------
  window.addEventListener('popstate', (event) => {
    const next = event.state?.window || (location.pathname === new URL(WINDOW_URL, location.href).pathname ? 'open' : 'closed');
    if (next === 'open') state === 'minimized' ? restore({ url: 'none' }) : open({ url: 'none' });
    else if (next === 'minimized') minimize({ url: 'none' });
    else close({ url: 'none' });
  });

  // ---------- Старт: окно уже открыто поверх стола ----------
  const start = () => {
    ensureDockItem();
    syncDock();
    history.replaceState({ window: 'open' }, '', location.href);
    body.classList.add('is-window-open');
    if (!reduce.matches) {
      busy = win.animate([{ transform: 'translateY(8px) scale(.985)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: EASE_OUT, fill: 'both' });
    }
  };
  // Dock создаёт portfolio-prototype.js — он подключён раньше и уже отработал
  start();
})();
