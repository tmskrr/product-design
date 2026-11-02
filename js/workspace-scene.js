// Рабочая сцена на главной (workspace-a): пар над кофе, «печать» коровы и редакторская правка.
// Корова — одна растровая картинка, поэтому всё строится накладками поверх нужных зон
// в координатах исходного изображения (1774 × 887). Без JS сцена остаётся статичной.
(() => {
  const home = document.querySelector('.workspace-home');
  const background = document.querySelector('.workspace-home__background');
  const trigger = document.querySelector('.cow-work-trigger');
  if (!home || !background || !trigger) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const SOURCE = { width: 1774, height: 887 };

  // Зоны в пикселях исходной картинки
  const ZONES = {
    steam: { x: 1103, y: 532, width: 40, height: 62 },
    chest: { x: 1232, y: 470, width: 156, height: 100 },
    heart: { x: 1291, y: 603, width: 40, height: 36 },
    armLeft: { x: 1182, y: 600, width: 38, height: 64 },
    armRight: { x: 1399, y: 600, width: 42, height: 64 },
    typing: { x: 1376, y: 536, width: 34, height: 15 },
    laptop: { x: 1211, y: 563, width: 198, height: 117 },
    face: { x: 1190, y: 340, width: 252, height: 218 }
  };

  // Короткие правки в духе UX-редактуры. Тексты — примеры, их стоит заменить своими.
  const EDITS = [
    { context: 'Кнопка', before: 'Нажмите здесь для продолжения', after: 'Подключить канал' },
    { context: 'Ошибка', before: 'Произошла ошибка', after: 'Не удалось сохранить. Проверьте подключение' },
    { context: 'Заголовок', before: 'Функционал виджета', after: 'Что умеет виджет' },
    { context: 'Подсказка', before: 'Осуществите настройку интеграции', after: 'Подключите CRM, чтобы заявки приходили в одно место' }
  ];

  // ---------- Слой сцены ----------
  const scene = document.createElement('div');
  scene.className = 'cow-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `
    <span class="cow-scene__steam" data-zone="steam">
      <svg viewBox="0 0 40 62" preserveAspectRatio="none">
        <path d="M17 60 C 11 50, 24 42, 17 30 S 13 12, 20 3" />
        <path d="M25 60 C 31 51, 19 44, 26 33 S 29 16, 23 7" />
      </svg>
    </span>
    <span class="cow-scene__glow" data-zone="chest"></span>
    <span class="cow-scene__heart" data-zone="heart"></span>
    <span class="cow-scene__arm" data-zone="armLeft"></span>
    <span class="cow-scene__arm" data-zone="armRight"></span>
    <span class="cow-scene__typing" data-zone="typing"><i></i><i></i><i></i></span>`;
  home.insertBefore(scene, trigger);

  const editor = document.createElement('div');
  editor.className = 'cow-editor';
  editor.id = 'cow-editor';
  editor.innerHTML = `
    <p class="cow-editor__context"><span aria-hidden="true"></span><b></b></p>
    <p class="cow-editor__line"><del class="cow-editor__before"></del></p>
    <p class="cow-editor__line"><ins class="cow-editor__after"></ins><i class="cow-editor__caret" aria-hidden="true"></i></p>
    <p class="cow-editor__status" role="status"></p>`;
  home.append(editor);

  const zoneEls = [...scene.querySelectorAll('[data-zone]')];
  const arms = [...scene.querySelectorAll('.cow-scene__arm')];
  const contextEl = editor.querySelector('.cow-editor__context b');
  const beforeEl = editor.querySelector('.cow-editor__before');
  const afterEl = editor.querySelector('.cow-editor__after');
  const statusEl = editor.querySelector('.cow-editor__status');

  trigger.setAttribute('aria-controls', editor.id);
  trigger.setAttribute('aria-expanded', 'false');

  // ---------- Геометрия: та же логика object-fit: cover, что у кнопки коровы ----------
  let geometry = null;
  const ratio = (value, fallback) => {
    if (!value) return fallback;
    if (value.endsWith('%')) return Number.parseFloat(value) / 100;
    if (value === 'left' || value === 'top') return 0;
    if (value === 'right' || value === 'bottom') return 1;
    return fallback;
  };

  const measure = () => {
    const rect = background.getBoundingClientRect();
    const homeRect = home.getBoundingClientRect();
    const scale = Math.max(rect.width / SOURCE.width, rect.height / SOURCE.height);
    const position = getComputedStyle(background).objectPosition.split(/\s+/);
    geometry = {
      scale,
      width: SOURCE.width * scale,
      height: SOURCE.height * scale,
      x: rect.left - homeRect.left + (rect.width - SOURCE.width * scale) * ratio(position[0], .5),
      y: rect.top - homeRect.top + (rect.height - SOURCE.height * scale) * ratio(position[1], .5)
    };

    zoneEls.forEach((el) => {
      const z = ZONES[el.dataset.zone];
      el.style.left = `${geometry.x + z.x * geometry.scale}px`;
      el.style.top = `${geometry.y + z.y * geometry.scale}px`;
      el.style.width = `${z.width * geometry.scale}px`;
      el.style.height = `${z.height * geometry.scale}px`;
    });

    // Копии ног — тот же фрагмент картинки, чтобы сдвиг на 1 px читался как нажатие клавиш
    arms.forEach((el) => {
      const z = ZONES[el.dataset.zone];
      el.style.backgroundImage = `url("${background.currentSrc || background.src}")`;
      el.style.backgroundSize = `${geometry.width}px ${geometry.height}px`;
      el.style.backgroundPosition = `${-z.x * geometry.scale}px ${-z.y * geometry.scale}px`;
    });

    if (editor.classList.contains('is-open')) placeEditor();
  };

  // Окно правки ищет свободное место по порядку: слева от головы над ноутбуком →
  // над головой коровы → над папками. Не перекрывает текст hero, морду коровы, папки и Dock.
  const placeEditor = () => {
    if (!geometry) return;
    const homeRect = home.getBoundingClientRect();
    const width = editor.offsetWidth;
    const height = editor.offsetHeight;
    const gap = 12;
    const src = (z) => ({
      left: geometry.x + z.x * geometry.scale,
      top: geometry.y + z.y * geometry.scale,
      right: geometry.x + (z.x + z.width) * geometry.scale,
      bottom: geometry.y + (z.y + z.height) * geometry.scale
    });
    const local = (el) => {
      const r = el?.getBoundingClientRect();
      return r && r.width ? { left: r.left - homeRect.left, right: r.right - homeRect.left, top: r.top - homeRect.top, bottom: r.bottom - homeRect.top } : null;
    };
    const face = src(ZONES.face);
    const laptop = src(ZONES.laptop);
    const blockers = [
      local(document.querySelector('.workspace-intro')),
      local(document.querySelector('.desktop-folders')),
      local(document.querySelector('.workspace-dock')),
      face
    ].filter(Boolean);
    const fits = ({ left, top }) =>
      left >= gap && top >= gap && left + width <= homeRect.width - gap && top + height <= homeRect.height - gap &&
      blockers.every((r) => left + width <= r.left - gap || left >= r.right + gap || top + height <= r.top - gap || top >= r.bottom + gap);

    const folders = blockers[1];
    const candidates = [
      { left: face.left - width - gap, top: laptop.top - height - 10 },
      { left: (face.left + face.right) / 2 - width / 2, top: face.top - height - gap },
      { left: face.left - width - gap, top: face.top - height - gap },
      folders ? { left: gap, top: folders.top - height - gap } : null
    ].filter(Boolean);
    const spot = candidates.find(fits) || candidates[candidates.length - 1];
    editor.style.left = `${Math.max(gap, Math.min(spot.left, homeRect.width - width - gap))}px`;
    editor.style.top = `${Math.max(gap, spot.top)}px`;
  };

  let resizeFrame = 0;
  const onResize = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; measure(); });
  };
  window.addEventListener('resize', onResize);
  reduceMotion.addEventListener?.('change', () => scene.classList.toggle('is-still', reduceMotion.matches));
  scene.classList.toggle('is-still', reduceMotion.matches);

  const start = () => {
    measure();
    scene.classList.add('is-ready');
  };
  if (background.complete && background.naturalWidth) start();
  else background.addEventListener('load', start, { once: true });

  // ---------- Печать: короткие неровные серии нажатий, не дольше 5 секунд ----------
  let typingTimer = 0;
  let typingStop = 0;
  let typingUntil = 0;

  const tap = () => {
    if (performance.now() > typingUntil) { stopTyping(); return; }
    const arm = arms[Math.random() < .5 ? 0 : 1];
    arm.classList.add('is-down');
    window.setTimeout(() => arm.classList.remove('is-down'), 70);
    // иногда короткая пауза, как между словами
    const delay = Math.random() < .14 ? 420 + Math.random() * 320 : 95 + Math.random() * 120;
    typingTimer = window.setTimeout(tap, delay);
  };

  const startTyping = (duration = 5000) => {
    window.clearTimeout(typingStop);
    typingUntil = performance.now() + duration;
    scene.classList.add('is-working');
    if (reduceMotion.matches) return;
    if (!typingTimer) typingTimer = window.setTimeout(tap, 160);
  };

  const stopTyping = (delay = 0) => {
    window.clearTimeout(typingStop);
    typingStop = window.setTimeout(() => {
      window.clearTimeout(typingTimer);
      typingTimer = 0;
      arms.forEach((arm) => arm.classList.remove('is-down'));
      scene.classList.remove('is-working');
    }, delay);
  };

  trigger.addEventListener('pointerenter', () => { if (finePointer.matches) startTyping(); });
  trigger.addEventListener('pointerleave', () => { if (finePointer.matches && !editor.classList.contains('is-typing')) stopTyping(120); });

  // ---------- Клик: одна короткая правка ----------
  let editIndex = -1;
  let typeTimer = 0;
  let hideTimer = 0;

  const closeEditor = () => {
    window.clearTimeout(typeTimer);
    window.clearTimeout(hideTimer);
    editor.classList.remove('is-open', 'is-typing', 'is-struck');
    trigger.setAttribute('aria-expanded', 'false');
    stopTyping(0);
  };

  const scheduleHide = () => {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(closeEditor, 5200);
  };

  const openEditor = () => {
    window.clearTimeout(typeTimer);
    editIndex = (editIndex + 1) % EDITS.length;
    const edit = EDITS[editIndex];
    contextEl.textContent = edit.context;
    beforeEl.textContent = edit.before;
    statusEl.textContent = `Правка: «${edit.before}» заменено на «${edit.after}»`;
    editor.classList.remove('is-struck', 'is-typing');
    editor.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    afterEl.textContent = reduceMotion.matches ? edit.after : '';
    placeEditor();

    if (reduceMotion.matches) {
      editor.classList.add('is-struck');
      scheduleHide();
      return;
    }

    // окно появилось → старый вариант зачёркивается → новый набирается
    window.clearTimeout(hideTimer);
    typeTimer = window.setTimeout(() => {
      editor.classList.add('is-struck');
      typeTimer = window.setTimeout(() => {
        editor.classList.add('is-typing');
        startTyping(edit.after.length * 38 + 600);
        let letter = 0;
        const typeNext = () => {
          letter += 1;
          afterEl.textContent = edit.after.slice(0, letter);
          placeEditor();
          if (letter < edit.after.length) {
            typeTimer = window.setTimeout(typeNext, 30 + Math.random() * 26);
          } else {
            editor.classList.remove('is-typing');
            if (!finePointer.matches || !trigger.matches(':hover')) stopTyping(400);
            scheduleHide();
          }
        };
        typeNext();
      }, 420);
    }, 320);
  };

  trigger.setAttribute('aria-label', 'Показать редакторскую правку');
  trigger.addEventListener('click', openEditor);
  trigger.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeEditor(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && editor.classList.contains('is-open')) closeEditor(); });
  document.addEventListener('pointerdown', (event) => {
    if (!editor.classList.contains('is-open')) return;
    if (trigger.contains(event.target) || editor.contains(event.target)) return;
    closeEditor();
  });
})();
