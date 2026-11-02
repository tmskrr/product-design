(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const icon = {
    telegram: '<img src="/product-design/assets/icons/system/telegram.png" alt="">',
    whatsapp: '<img src="/product-design/assets/icons/system/whatsapp.png" alt="">',
    mail: '<img src="/product-design/assets/icons/system/mail.png" alt="">',
    folder: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3.5 9.5A3.5 3.5 0 0 1 7 6h6l3 3h9a3.5 3.5 0 0 1 3.5 3.5v11A3.5 3.5 0 0 1 25 27H7a3.5 3.5 0 0 1-3.5-3.5Z"/></svg>'
  };

  const sectionByPath = [
    { match: '/product-design/projects/', key: 'projects', label: 'Проекты', href: '/product-design/prototype/projects/?v=desktop-27' },
    { match: '/product-design/about', key: 'about', label: 'Обо мне', href: '/product-design/prototype/about-direction/?v=desktop-27' },
    { match: '/product-design/books', key: 'books', label: 'Книги', href: '/product-design/prototype/books-direction/?v=desktop-27' },
    { match: '/product-design/design/', key: 'design', label: 'Дизайн', href: '/product-design/prototype/design/?v=desktop-27' }
  ];
  const currentSection = 'pretty' in document.body.dataset ? null : sectionByPath.find((section) => location.pathname.includes(section.match));

  if (location.pathname.startsWith('/product-design/prototype/') || 'pretty' in document.body.dataset) {
    document.body.classList.add('has-workspace-dock');
    const dock = document.createElement('nav');
    dock.className = 'workspace-dock';
    dock.setAttribute('aria-label', 'Контакты и разделы сайта');
    const openSection = currentSection ? `
      <span class="workspace-dock__separator" aria-hidden="true"></span>
      <a class="workspace-dock__current${currentSection.key === 'projects' ? ' workspace-dock__current--projects' : ''}" href="${currentSection.href}" aria-current="page" aria-label="Открыт раздел: ${currentSection.label}">
        <span class="workspace-dock__window" aria-hidden="true">
          <i></i>${icon.folder}<b>${currentSection.label}</b>
        </span>
        <span class="workspace-dock__label">${currentSection.label}</span>
      </a>` : '';
    dock.innerHTML = `
      <div class="workspace-dock__apps">
        <a class="workspace-dock__app workspace-dock__app--telegram" href="https://t.me/tmskrr" aria-label="Telegram">${icon.telegram}<span class="workspace-dock__label">Telegram</span></a>
        <a class="workspace-dock__app workspace-dock__app--whatsapp" href="https://wa.me/79998052272" aria-label="WhatsApp">${icon.whatsapp}<span class="workspace-dock__label">WhatsApp</span></a>
        <a class="workspace-dock__app workspace-dock__app--mail" href="mailto:tmskrarr@gmail.com" aria-label="Почта">${icon.mail}<span class="workspace-dock__label">Почта</span></a>
      </div>${openSection}`;
    document.body.append(dock);

    const siteNav = document.querySelector('.site-nav');
    if (siteNav) {
      const status = document.createElement('span');
      status.className = 'system-status';
      const updateClock = () => {
        const now = new Date();
        const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
        const time = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(now);
        // дата отдельным куском: на телефоне остаётся только время, как в строке состояния
        status.innerHTML = `<span class="system-status__date">${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} </span>${time}`;
      };
      updateClock();
      // обновляем ровно в начале минуты, чтобы часы не отставали от системных
      const tick = () => { updateClock(); window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50); };
      window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
      siteNav.append(status);
    }

    const syncHeaderHeight = () => {
      const header = document.querySelector('.site-header');
      if (!header) return;
      document.documentElement.style.setProperty('--system-header-height', `${header.getBoundingClientRect().height}px`);
    };
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    if ('ResizeObserver' in window) {
      const header = document.querySelector('.site-header');
      if (header) new ResizeObserver(syncHeaderHeight).observe(header);
    }
  }

  if (currentSection) {
    document.body.classList.add('has-finder-sidebar');
    const finder = document.createElement('aside');
    finder.className = 'finder-sidebar';
    finder.id = 'finder-sidebar';
    finder.setAttribute('aria-label', 'Разделы портфолио');
    finder.innerHTML = `
      <div class="finder-sidebar__bar">
        <span class="finder-window-controls" aria-label="Управление окном">
          <a class="finder-window-control finder-window-control--close" href="/product-design/prototype/workspace-a/?v=desktop-25" aria-label="Закрыть окно и вернуться на рабочий стол"></a>
          <button class="finder-window-control finder-window-control--minimize" type="button" aria-label="Свернуть окно в Dock"></button>
          <button class="finder-window-control finder-window-control--expand" type="button" aria-label="Развернуть окно" aria-pressed="false"></button>
        </span>
        <strong>${currentSection.label}</strong>
      </div>
      <nav class="finder-sidebar__nav" aria-label="Избранное">
        <a class="finder-sidebar__desktop-link" href="/product-design/prototype/workspace-a/?v=desktop-25">
          <span aria-hidden="true">←</span><span>Рабочий стол</span>
        </a>
        <p>Избранное</p>
        ${sectionByPath.map((section) => `
          <a href="${section.href}"${section.key === currentSection.key ? ' class="is-active" aria-current="page"' : ''}>
            ${icon.folder}<span>${section.label}</span>
          </a>`).join('')}
      </nav>`;
    document.body.append(finder);

    const finderBackdrop = document.createElement('button');
    finderBackdrop.className = 'finder-backdrop';
    finderBackdrop.type = 'button';
    finderBackdrop.setAttribute('aria-label', 'Закрыть меню разделов');
    document.body.append(finderBackdrop);

    const finderToggle = document.createElement('button');
    finderToggle.className = 'finder-toggle';
    finderToggle.type = 'button';
    finderToggle.setAttribute('aria-controls', finder.id);
    finderToggle.setAttribute('aria-expanded', 'false');
    finderToggle.innerHTML = `${icon.folder}<span>Разделы</span>`;
    document.querySelector('main')?.prepend(finderToggle);

    const setFinderOpen = (isOpen) => {
      document.body.classList.toggle('is-finder-open', isOpen);
      finderToggle.setAttribute('aria-expanded', String(isOpen));
    };
    finderToggle.addEventListener('click', () => setFinderOpen(!document.body.classList.contains('is-finder-open')));
    finderBackdrop.addEventListener('click', () => setFinderOpen(false));
    finder.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setFinderOpen(false)));

    const finderMain = document.querySelector('main');
    const minimizeControl = finder.querySelector('.finder-window-control--minimize');
    const expandControl = finder.querySelector('.finder-window-control--expand');
    const dockWindow = document.querySelector('.workspace-dock__current');
    let minimizeTimer = 0;
    let restoreTimer = 0;
    let scrollFrame = 0;
    let windowScrollPosition = window.scrollY;

    const restoreScrollPosition = (target) => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        if (target === 'main' && finderMain) finderMain.scrollTop = windowScrollPosition;
        else window.scrollTo({ top: windowScrollPosition, behavior: 'instant' });
      });
    };

    const finishMinimize = () => {
      document.body.classList.remove('is-finder-minimizing');
      document.body.classList.add('is-finder-minimized');
      dockWindow?.classList.add('is-minimized');
      dockWindow?.setAttribute('aria-label', `Восстановить раздел: ${currentSection.label}`);
    };

    const setFinderMinimized = (isMinimized) => {
      window.clearTimeout(minimizeTimer);
      window.clearTimeout(restoreTimer);
      setFinderOpen(false);

      if (isMinimized) {
        if (document.body.classList.contains('is-finder-minimized')) return;
        windowScrollPosition = document.body.classList.contains('is-finder-fullscreen')
          ? (finderMain?.scrollTop || 0)
          : window.scrollY;
        document.body.classList.remove('is-finder-restoring');
        document.body.classList.add('is-finder-minimizing');
        if (reduceMotion) finishMinimize();
        else minimizeTimer = window.setTimeout(finishMinimize, 300);
        return;
      }

      if (!document.body.classList.contains('is-finder-minimized')) return;
      document.body.classList.remove('is-finder-minimized', 'is-finder-minimizing');
      document.body.classList.add('is-finder-restoring');
      dockWindow?.classList.remove('is-minimized');
      dockWindow?.setAttribute('aria-label', `Открыт раздел: ${currentSection.label}`);
      restoreScrollPosition(document.body.classList.contains('is-finder-fullscreen') ? 'main' : 'window');
      if (reduceMotion) document.body.classList.remove('is-finder-restoring');
      else restoreTimer = window.setTimeout(() => document.body.classList.remove('is-finder-restoring'), 320);
    };

    const setFinderFullscreen = (isFullscreen) => {
      if (!finderMain) return;
      if (document.body.classList.contains('is-finder-minimized')) setFinderMinimized(false);

      if (isFullscreen) {
        windowScrollPosition = window.scrollY;
        document.body.classList.add('is-finder-fullscreen');
        restoreScrollPosition('main');
      } else {
        windowScrollPosition = finderMain.scrollTop;
        document.body.classList.remove('is-finder-fullscreen');
        restoreScrollPosition('window');
      }
      expandControl?.setAttribute('aria-pressed', String(isFullscreen));
      expandControl?.setAttribute('aria-label', isFullscreen ? 'Вернуть обычный размер окна' : 'Развернуть окно');
    };

    minimizeControl?.addEventListener('click', () => setFinderMinimized(true));
    expandControl?.addEventListener('click', () => {
      setFinderFullscreen(!document.body.classList.contains('is-finder-fullscreen'));
    });
    dockWindow?.addEventListener('click', (event) => {
      event.preventDefault();
      if (document.body.classList.contains('is-finder-minimized')) setFinderMinimized(false);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (document.body.classList.contains('is-finder-fullscreen')) setFinderFullscreen(false);
      else setFinderOpen(false);
    });

    const projectSlug = location.pathname.match(/\/projects\/([^/]+)\.html$/)?.[1];
    if (projectSlug) {
      const projectTitle = document.querySelector('.case-hero h1')?.textContent?.trim();
      if (projectTitle) {
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'finder-breadcrumb container';
        breadcrumb.setAttribute('aria-label', 'Хлебные крошки');
        breadcrumb.innerHTML = `<a href="/product-design/prototype/projects/?v=desktop-27">Проекты</a><span aria-hidden="true">/</span><span aria-current="page">${projectTitle}</span>`;
        const main = document.querySelector('main');
        main?.insertBefore(breadcrumb, finderToggle.nextSibling);
      }
    }
  }

  const workspaceHome = document.querySelector('.workspace-home');
  const cowBackground = document.querySelector('.workspace-home__background');
  const cowTrigger = document.querySelector('.cow-work-trigger');
  if (workspaceHome && cowBackground && cowTrigger) {
    const source = { width: 1774, height: 887 };
    const crop = { x: 1120, y: 270, width: 460, height: 360 };
    let resizeFrame = 0;

    const placeCowTrigger = () => {
      const rect = cowBackground.getBoundingClientRect();
      const scale = Math.max(rect.width / source.width, rect.height / source.height);
      const renderedWidth = source.width * scale;
      const renderedHeight = source.height * scale;
      const objectPosition = getComputedStyle(cowBackground).objectPosition.split(/\s+/);
      const positionRatio = (value, fallback) => {
        if (!value) return fallback;
        if (value.endsWith('%')) return Number.parseFloat(value) / 100;
        if (value === 'left' || value === 'top') return 0;
        if (value === 'right' || value === 'bottom') return 1;
        return fallback;
      };
      const offsetX = (rect.width - renderedWidth) * positionRatio(objectPosition[0], .5);
      const offsetY = (rect.height - renderedHeight) * positionRatio(objectPosition[1], .5);
      const rawLeft = offsetX + crop.x * scale;
      const rawTop = offsetY + crop.y * scale;
      const left = Math.max(0, rawLeft);
      const top = Math.max(0, rawTop);
      const right = Math.min(rect.width, rawLeft + crop.width * scale);
      const bottom = Math.min(rect.height, rawTop + crop.height * scale);
      cowTrigger.style.setProperty('--cow-area-left', `${left}px`);
      cowTrigger.style.setProperty('--cow-area-top', `${top}px`);
      cowTrigger.style.setProperty('--cow-area-width', `${Math.max(0, right - left)}px`);
      cowTrigger.style.setProperty('--cow-area-height', `${Math.max(0, bottom - top)}px`);
      cowTrigger.classList.add('is-ready');
    };
    // Клик по корове теперь обрабатывает js/workspace-scene.js (редакторская правка).
    // Прежние метки направлений (.cow-system-labels) временно не показываются.
    window.addEventListener('resize', () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => { placeCowTrigger(); resizeFrame = 0; });
    });
    if (cowBackground.complete) placeCowTrigger();
    else cowBackground.addEventListener('load', placeCowTrigger, { once: true });
  }

  const liveTypewriter = document.querySelector('[data-live-typewriter]');
  if (liveTypewriter) {
    const line = liveTypewriter.querySelector('[data-typed-line]');
    const phrases = ['Веду контент-направления', 'Работаю со сложными продуктами', 'Соединяю текст и UX', 'Понимаю дизайн и реализацию'];
    if (!reduceMotion) {
      let phraseIndex = 0;
      const typePhrase = () => {
        const phrase = phrases[phraseIndex];
        let letter = 0;
        line.textContent = '';
        liveTypewriter.classList.add('is-typing-live');
        const timer = window.setInterval(() => {
          letter += 1;
          line.textContent = phrase.slice(0, letter);
          if (letter < phrase.length) return;
          window.clearInterval(timer);
          window.setTimeout(() => {
            liveTypewriter.classList.remove('is-typing-live');
            phraseIndex = (phraseIndex + 1) % phrases.length;
            window.setTimeout(typePhrase, 380);
          }, 1800);
        }, 48);
      };
      typePhrase();
    }
  }

  const dialog = document.querySelector('[data-book-dialog]');
  if (dialog) {
    const dialogTitle = dialog.querySelector('[data-book-title]');
    const dialogText = dialog.querySelector('[data-book-text]');
    document.querySelectorAll('[data-book]').forEach((book) => {
      book.addEventListener('click', () => {
        dialogTitle.textContent = book.dataset.bookTitle || 'Книга';
        dialogText.textContent = book.dataset.bookText || '';
        dialog.showModal();
      });
    });
    dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

    const typewriterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-typing');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });

    document.querySelectorAll('[data-typewriter]').forEach((element) => typewriterObserver.observe(element));
  } else {
    document.querySelectorAll('[data-typewriter]').forEach((element) => element.classList.add('is-typing'));
  }
})();
