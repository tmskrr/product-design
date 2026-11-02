(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const iconPaths = {
    'arrow-down': '<path d="M12 5v14"/><path d="m18 13-6 6-6-6"/>',
    'arrow-left': '<path d="M5 12h14"/><path d="m5 12 6 6"/><path d="m5 12 6-6"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m13 18 6-6"/><path d="m13 6 6 6"/>',
    'arrow-up': '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
    'arrow-up-right': '<path d="M17 7 7 17"/><path d="M8 7h9v9"/>',
    'mail': '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="m3 7 9 6 9-6"/>',
    'menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    'close': '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
    'plus': '<path d="M12 5v14"/><path d="M5 12h14"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'graduation-cap': '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    'bell': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'brand-telegram': '<path d="m15 10-4 4 6 4 4-16L3 9l4 2 2 6 3-4"/><path d="m7 11 10-5"/>',
    'brand-whatsapp': '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>'
  };

  const renderIcon = (el, name = el.dataset.icon) => {
    el.dataset.icon = name;
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ''}</svg>`;
  };
  window.renderSiteIcon = renderIcon;
  document.querySelectorAll('[data-icon]').forEach((el) => renderIcon(el));

  const widgetLoader = document.querySelector('.widget-loader');
  if (widgetLoader) {
    const finishWidgetLoad = () => {
      if (reduced) {
        widgetLoader.remove();
        return;
      }
      window.setTimeout(() => {
        widgetLoader.classList.add('is-hidden');
        if (window.location.hash) {
          document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' });
        }
      }, 420);
    };
    if (document.readyState === 'complete') finishWidgetLoad();
    else window.addEventListener('load', finishWidgetLoad, { once: true });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (menuButton && siteNav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      siteNav.classList.toggle('is-open', open);
      const icon = menuButton.querySelector('[data-icon]');
      if (icon) renderIcon(icon, open ? 'close' : 'menu');
    });
    siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
      const icon = menuButton.querySelector('[data-icon]');
      if (icon) renderIcon(icon, 'menu');
    }));
  }

  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => observer.observe(el));
  }

  const hero = document.querySelector('.hero');
  const field = hero?.querySelector('.system-field');
  const spots = [...(field?.querySelectorAll('.system-spot') || [])];
  if (hero && field && spots.length && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const motion = spots.map((spot) => ({ spot, x: 0, y: 0, r: 0, s: 1, tx: 0, ty: 0, tr: 0, ts: 1 }));
    let frame = 0;

    const render = () => {
      let moving = false;
      motion.forEach((item) => {
        item.x += (item.tx - item.x) * 0.11;
        item.y += (item.ty - item.y) * 0.11;
        item.r += (item.tr - item.r) * 0.09;
        item.s += (item.ts - item.s) * 0.09;
        item.spot.style.setProperty('--tx', `${item.x.toFixed(2)}px`);
        item.spot.style.setProperty('--ty', `${item.y.toFixed(2)}px`);
        item.spot.style.setProperty('--rot', `${item.r.toFixed(2)}deg`);
        item.spot.style.setProperty('--stretch', item.s.toFixed(3));
        moving ||= Math.abs(item.tx - item.x) + Math.abs(item.ty - item.y) + Math.abs(item.tr - item.r) > 0.3;
      });
      frame = moving ? requestAnimationFrame(render) : 0;
    };

    const start = () => { if (!frame) frame = requestAnimationFrame(render); };
    hero.addEventListener('pointerenter', () => field.classList.add('is-active'));
    hero.addEventListener('pointermove', (event) => {
      motion.forEach((item) => {
        const rect = item.spot.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / 360);
        const depth = Number(item.spot.dataset.depth || 0.6);
        item.tx = distance ? (-dx / distance) * 24 * influence * depth : 0;
        item.ty = distance ? (-dy / distance) * 18 * influence * depth : 0;
        item.tr = (dx / 360) * 8 * influence * depth;
        item.ts = 1 + influence * 0.16;
      });
      start();
    });
    hero.addEventListener('pointerleave', () => {
      field.classList.remove('is-active');
      motion.forEach((item) => { item.tx = 0; item.ty = 0; item.tr = 0; item.ts = 1; });
      start();
    });
  }

  document.querySelectorAll('.internal-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (reduced || event.metaKey || event.ctrlKey || link.target === '_blank') return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      document.querySelector('.page-transition')?.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = link.href; }, 360);
    });
  });

  const chapterLinks = [...document.querySelectorAll('.case-index a')];
  const chapters = chapterLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if (chapters.length) {
    let chapterFrame = 0;
    const updateChapter = () => {
      const marker = window.innerHeight * 0.32;
      let current = chapters[0];
      chapters.forEach((chapter) => {
        if (chapter.getBoundingClientRect().top <= marker) current = chapter;
      });
      chapterLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${current.id}`));
      chapterFrame = 0;
    };
    const requestChapterUpdate = () => {
      if (!chapterFrame) chapterFrame = window.requestAnimationFrame(updateChapter);
    };
    window.addEventListener('scroll', requestChapterUpdate, { passive: true });
    window.addEventListener('resize', requestChapterUpdate);
    updateChapter();
  }

  document.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      const summary = detail.querySelector('summary');
      summary?.setAttribute('aria-expanded', detail.open ? 'true' : 'false');
    });
  });

  if (document.body.dataset.page === 'home') {
    const modal = document.querySelector('.editorial-modal');
    const modalTitle = modal?.querySelector('[data-modal-title]');
    const closeButton = modal?.querySelector('[data-modal-close]');

    document.querySelectorAll('[data-editorial-project]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (!modal || !modalTitle) return;
        modalTitle.textContent = trigger.dataset.editorialProject || '';
        modal.showModal();
      });
    });

    closeButton?.addEventListener('click', () => modal.close());
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) modal.close();
    });
  }

  if (document.body.dataset.page === 'case') {
    const progress = document.querySelector('[data-case-progress]');
    if (progress) {
      let progressFrame = 0;
      const updateProgress = () => {
        const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const value = Math.min(1, Math.max(0, window.scrollY / maximum));
        progress.style.transform = `scaleX(${value})`;
        progressFrame = 0;
      };
      const requestProgressUpdate = () => {
        if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
      };
      window.addEventListener('scroll', requestProgressUpdate, { passive: true });
      window.addEventListener('resize', requestProgressUpdate);
      updateProgress();
    }

    const readingTime = document.querySelector('[data-reading-time]');
    const caseStory = document.querySelector('[data-reading-root], .case-story');
    if (readingTime && caseStory) {
      const walker = document.createTreeWalker(caseStory, NodeFilter.SHOW_TEXT);
      const fragments = [];
      let textNode = walker.nextNode();
      while (textNode) {
        const parent = textNode.parentElement;
        const excluded = parent?.closest('nav,footer,script,style,template,[hidden],[aria-hidden="true"]');
        if (!excluded && parent && getComputedStyle(parent).display !== 'none' && getComputedStyle(parent).visibility !== 'hidden') {
          fragments.push(textNode.textContent || '');
        }
        textNode = walker.nextNode();
      }
      const words = fragments.join(' ').match(/[A-Za-zА-Яа-яЁё0-9]+(?:[-–—][A-Za-zА-Яа-яЁё0-9]+)*/g) || [];
      const minutes = Math.max(1, Math.round(words.length / 190));
      readingTime.textContent = `≈ ${minutes} мин чтения`;
    }
  }

  if (document.body.dataset.project === 'flowup') {
    document.querySelectorAll('[data-switcher-controls]').forEach((controls) => {
      const group = controls.closest('.interface-feature, .view-logic, .data-view-switcher, .ai-evidence');
      const target = group?.querySelector('[data-switcher]');
      const image = target?.querySelector('[data-switcher-image]');
      const caption = target?.querySelector('[data-switcher-caption]');
      if (!image) return;

      controls.querySelectorAll('button[data-src]').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.getAttribute('aria-pressed') === 'true') return;
          controls.querySelectorAll('button[data-src]').forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });
          image.classList.add('is-changing');
          window.setTimeout(() => {
            const finish = () => image.classList.remove('is-changing');
            image.addEventListener('load', finish, { once: true });
            image.src = button.dataset.src;
            image.alt = button.dataset.alt || '';
            if (caption && button.dataset.caption) caption.textContent = button.dataset.caption;
            if (image.complete) finish();
          }, reduced ? 0 : 120);
        });
      });
    });

    document.querySelectorAll('[data-state-switcher]').forEach((switcher) => {
      const buttons = [...switcher.querySelectorAll('.state-tabs button[data-src]')];
      const image = switcher.querySelector('[data-state-image]');
      const title = switcher.querySelector('[data-state-title]');
      const copy = switcher.querySelector('[data-state-copy]');
      const caption = switcher.querySelector('[data-state-caption]');
      if (!buttons.length || !image) return;

      const activate = (button) => {
        if (button.getAttribute('aria-pressed') === 'true') return;
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        image.classList.add('is-changing');
        const finish = () => image.classList.remove('is-changing');
        window.setTimeout(() => {
          image.addEventListener('load', finish, { once: true });
          image.src = button.dataset.src;
          image.alt = button.dataset.alt || '';
          if (title) title.textContent = button.dataset.title || '';
          if (copy) copy.textContent = button.dataset.copy || '';
          if (caption) caption.textContent = button.dataset.caption || '';
          if (image.complete) finish();
        }, reduced ? 0 : 100);
      };

      buttons.forEach((button, index) => {
        button.tabIndex = button.getAttribute('aria-pressed') === 'true' ? 0 : -1;
        button.addEventListener('click', () => activate(button));
        button.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
          buttons[nextIndex].focus();
          activate(buttons[nextIndex]);
        });
      });
    });

    const analysisModal = document.querySelector('[data-analysis-modal]');
    if (analysisModal) {
      const dialog = analysisModal.querySelector('[role="dialog"]');
      const openers = document.querySelectorAll('[data-analysis-modal-open]');
      const closers = analysisModal.querySelectorAll('[data-analysis-modal-close]');
      let lastFocused = null;

      const openModal = () => {
        lastFocused = document.activeElement;
        analysisModal.hidden = false;
        document.body.classList.add('analysis-modal-open');
        requestAnimationFrame(() => analysisModal.classList.add('is-open'));
        analysisModal.querySelector('[data-analysis-modal-close]:not(.analysis-modal__backdrop)')?.focus();
      };

      const closeModal = () => {
        analysisModal.classList.remove('is-open');
        document.body.classList.remove('analysis-modal-open');
        window.setTimeout(() => {
          analysisModal.hidden = true;
          lastFocused?.focus();
        }, reduced ? 0 : 180);
      };

      openers.forEach((button) => button.addEventListener('click', openModal));
      closers.forEach((button) => button.addEventListener('click', closeModal));
      analysisModal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
        if (event.key !== 'Tab') return;
        const focusable = [...dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')].filter((item) => !item.hidden);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
    }

    document.querySelectorAll('[data-competitor-switcher]').forEach((switcher) => {
      const tabs = [...switcher.querySelectorAll('[role="tab"][data-analysis-target]')];
      const panels = [...switcher.querySelectorAll('.competitor-panel[role="tabpanel"]')];
      const activate = (tab) => {
        tabs.forEach((item) => {
          const active = item === tab;
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        panels.forEach((panel) => {
          const active = panel.id === tab.dataset.analysisTarget;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });
      };

      tabs.forEach((tab, index) => {
        tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
        tab.addEventListener('click', () => activate(tab));
        tab.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          tabs[nextIndex].focus();
          activate(tabs[nextIndex]);
        });
      });
    });

    document.querySelectorAll('[data-episode-switcher]').forEach((switcher) => {
      const tabs = [...switcher.querySelectorAll('[role="tab"][data-episode-target]')];
      const panels = [...switcher.querySelectorAll('[role="tabpanel"]')];
      const activate = (tab) => {
        tabs.forEach((item) => {
          const active = item === tab;
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        panels.forEach((panel) => {
          const active = panel.id === tab.dataset.episodeTarget;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });
      };

      tabs.forEach((tab, index) => {
        tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
        tab.addEventListener('click', () => activate(tab));
        tab.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          tabs[nextIndex].focus();
          activate(tabs[nextIndex]);
        });
      });
    });
  }
})();
