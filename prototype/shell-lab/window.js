// Поведение окна раздела (прототип оболочки, shell-lab). Общее для обоих направлений.
// Кнопки окна: закрыть → рабочий стол, свернуть → в Dock, развернуть → на весь экран.
// Переход между разделами: выделение переезжает, содержимое тает, затем открывается страница.
(() => {
  const body = document.body;
  const win = document.querySelector('.win');
  if (!win) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const later = (fn, ms) => window.setTimeout(fn, reduce.matches ? 0 : ms);

  // Часы в системной строке
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
    const tick = () => {
      const d = new Date();
      clock.textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(d)}`;
    };
    tick();
    window.setInterval(tick, 30000);
  }

  // Открытие окна
  requestAnimationFrame(() => body.classList.add('is-open'));

  // Кнопки окна
  const close = win.querySelector('[data-win="close"]');
  const minimize = win.querySelector('[data-win="minimize"]');
  const zoom = win.querySelector('[data-win="zoom"]');
  const dockWindow = document.querySelector('[data-dock-window]');

  close?.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    body.classList.add('is-closing');
    later(() => { window.location.href = close.href; }, 200);
  });

  const setMinimized = (state) => {
    body.classList.toggle('is-minimized', state);
    dockWindow?.setAttribute('aria-label', state ? 'Вернуть окно «Проекты»' : 'Окно «Проекты» открыто');
    if (!state) win.focus({ preventScroll: true });
  };
  minimize?.addEventListener('click', () => setMinimized(true));
  dockWindow?.addEventListener('click', (event) => {
    event.preventDefault();
    if (body.classList.contains('is-minimized')) setMinimized(false);
  });

  const setZoomed = (state) => {
    body.classList.toggle('is-zoomed', state);
    zoom?.setAttribute('aria-pressed', String(state));
    zoom?.setAttribute('aria-label', state ? 'Вернуть обычный размер окна' : 'Развернуть окно');
  };
  zoom?.addEventListener('click', () => setZoomed(!body.classList.contains('is-zoomed')));

  // Переход между разделами
  const nav = win.querySelector('[data-win-nav]');
  const indicator = nav?.querySelector('[data-indicator]');
  const moveIndicator = (link, animate = true) => {
    if (!indicator || !link) return;
    indicator.classList.toggle('is-instant', !animate);
    indicator.style.transform = `translateY(${link.offsetTop}px)`;
    indicator.style.height = `${link.offsetHeight}px`;
    indicator.style.opacity = '1';
  };
  const current = () => nav?.querySelector('[aria-current="page"]');
  moveIndicator(current(), false);
  window.addEventListener('resize', () => moveIndicator(current(), false));

  nav?.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || link.getAttribute('aria-current') === 'page') {
        if (link.getAttribute('aria-current') === 'page') event.preventDefault();
        return;
      }
      event.preventDefault();
      current()?.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'page');
      moveIndicator(link);
      body.classList.add('is-leaving');
      later(() => { window.location.href = link.href; }, 240);
    });
  });

  // Разделитель под toolbar появляется, когда содержимое прокручено
  const scroller = win.querySelector('[data-win-scroll]');
  const toolbar = win.querySelector('.win__toolbar');
  scroller?.addEventListener('scroll', () => toolbar?.classList.toggle('is-scrolled', scroller.scrollTop > 2), { passive: true });

  // Меню разделов на mobile (заголовок окна как переключатель)
  const menuButton = win.querySelector('[data-win-menu-button]');
  const menu = win.querySelector('[data-win-menu]');
  const setMenu = (state) => {
    if (!menuButton || !menu) return;
    body.classList.toggle('is-menu-open', state);
    menuButton.setAttribute('aria-expanded', String(state));
    if (state) menu.querySelector('[aria-current="page"], a')?.focus({ preventScroll: true });
  };
  menuButton?.addEventListener('click', () => setMenu(!body.classList.contains('is-menu-open')));
  document.addEventListener('pointerdown', (event) => {
    if (!body.classList.contains('is-menu-open')) return;
    if (menu.contains(event.target) || menuButton.contains(event.target)) return;
    setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (body.classList.contains('is-menu-open')) { setMenu(false); menuButton.focus(); return; }
    if (body.classList.contains('is-zoomed')) setZoomed(false);
  });
})();
