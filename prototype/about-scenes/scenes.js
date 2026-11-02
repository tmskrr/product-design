/* «Обо мне» — прототип листов, вторая итерация.
   Прокрутка остаётся прокруткой окна, листы останавливает CSS scroll snap.
   Скрипт: текущий лист, меню и кнопки листов, история, подсказка, колесо (один жест — один лист),
   режим обычной прокрутки, шкала «Пути» и машинка фактов. */
(() => {
  // init работает и на отдельной странице прототипа, и внутри окна Finder на главной:
  // там содержимое вставляется без скриптов, и finder-app.js вызывает window.scenesInit(page)
  const init = (scope) => {
  const root = scope.querySelector('[data-sc]');
  if (!root || root.dataset.ready) return () => {};
  root.dataset.ready = '1';
  const inFinder = !root.closest('[data-sc-scroller]');
  const scroller = inFinder ? root.closest('[data-win-scroll]') : root.closest('[data-sc-scroller]');
  if (!scroller) return () => {};
  const off = [];
  const listen = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); off.push(() => el.removeEventListener(type, fn, opts)); };
  // в Finder прокручивается общее окно: на время раздела оно получает поведение листов
  if (inFinder) {
    scroller.classList.add('sc-scroller');
    scroller.setAttribute('data-sc-scroller', '');
    off.push(() => { scroller.classList.remove('sc-scroller'); scroller.removeAttribute('data-sc-scroller'); delete scroller.dataset.mode; });
  }
  const scenes = [...root.querySelectorAll('[data-scene]')];
  const keys = scenes.map((s) => s.dataset.scene);
  const links = [...root.querySelectorAll('[data-go]')];
  const steps = [...root.querySelectorAll('[data-step]')];
  const progress = root.querySelector('[data-progress]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => (reduce.matches ? 'auto' : 'smooth');

  // ---------- Режим: листы или обычная прокрутка ----------
  // Листы — только если окно достаточно большое и каждый лист помещается целиком.
  const fits = () => scenes.filter((s) => s.dataset.scene !== 'facts').every((s) => {
    const body = s.querySelector('.sc-body');
    return !body || body.scrollHeight <= body.clientHeight + 1;
  });
  let mode = '';
  const setMode = () => {
    const keep = active;
    scroller.dataset.mode = 'scenes';
    const next = scroller.clientWidth >= 620 && scroller.clientHeight >= 520 && fits() ? 'scenes' : 'flow';
    scroller.dataset.mode = next;
    if (next !== mode) { mode = next; jump(keep, 'auto'); }
  };

  // ---------- Текущий лист ----------
  let active = 0;
  const current = () => {
    const y = scroller.scrollTop + scroller.clientHeight * 0.4;
    let i = 0;
    scenes.forEach((s, n) => { if (s.offsetTop <= y) i = n; });
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) i = scenes.length - 1;
    return i;
  };
  const paint = (i) => {
    links.forEach((a, n) => (n === i ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
    steps[0].disabled = i === 0;
    steps[1].disabled = i === scenes.length - 1;
    const on = links[i];
    const box = on.parentElement;
    if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: Math.max(0, on.offsetLeft - 16), behavior: behavior() });
  };
  const jump = (i, how = behavior()) => scroller.scrollTo({ top: scenes[i].offsetTop, behavior: how });
  const go = (i) => { jump(Math.min(scenes.length - 1, Math.max(0, i))); };

  // ---------- Адрес и история ----------
  // Лист записывается в историю, когда прокрутка остановилась: промежуточные листы при длинном переходе не попадают.
  const urlFor = (i) => { const u = new URL(location.href); u.searchParams.set('scene', keys[i]); return u.pathname + u.search + u.hash; };
  let committed = -1;
  let restoring = false;
  const commit = () => {
    if (restoring) { restoring = false; committed = active; return; }
    if (active === committed) return;
    if (inFinder) history.replaceState(history.state, '', urlFor(active));   // в окне Finder своя история — лист только в адресе
    else history.pushState({ scene: keys[active] }, '', urlFor(active));
    committed = active;
  };
  listen(window, 'popstate', () => {
    const i = Math.max(0, keys.indexOf(new URLSearchParams(location.search).get('scene')));
    if (i === active) { committed = i; return; }
    restoring = true;
    jump(i);
  });

  let idle = 0;
  let frame = 0;
  listen(scroller, 'scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const i = current();
      if (i !== active) { active = i; paint(i); }
      const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      progress.style.transform = `scaleX(${Math.min(1, scroller.scrollTop / max)})`;
    });
    clearTimeout(idle);
    idle = setTimeout(commit, 180);
  }, { passive: true });

  // ---------- Колесо и тачпад: один жест — один лист ----------
  // Встроенная остановка CSS не спасает от сильного рывка: Chrome проскакивает несколько листов.
  // Вертикальное колесо в режиме листов ведём сами и ждём, пока затихнет инерция тачпада.
  // Горизонталь, ctrl+колесо и обычный режим прокрутки не трогаем.
  let acc = 0;
  let locked = false;
  let lockedAt = 0;
  let lastWheel = 0;
  listen(scroller, 'wheel', (e) => {
    if (mode !== 'scenes' || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.target.closest('.tl__scroll') && Math.abs(e.deltaX) > 0) return;
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * scroller.clientHeight : e.deltaY;
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    if (gap > 160) acc = 0;
    if (locked && gap > 160 && now - lockedAt > 450) locked = false;
    if (locked) return;
    acc += dy;
    if (Math.abs(acc) < 50) return;
    const to = Math.min(scenes.length - 1, Math.max(0, current() + Math.sign(acc)));
    acc = 0;
    if (to === current()) return;
    locked = true; lockedAt = now;
    jump(to);
  }, { passive: false });

  links.forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(keys.indexOf(a.dataset.go));
  }));
  steps.forEach((b) => b.addEventListener('click', () => go(current() + Number(b.dataset.step))));

  // ---------- Подсказка при первом открытии ----------
  const hint = root.querySelector('[data-hint]');
  const SEEN = 'about-scenes-hint-seen';
  let seen = false;
  try { seen = localStorage.getItem(SEEN) === '1'; } catch (e) { /* хранилище недоступно — просто покажем */ }
  if (!seen) {
    if (matchMedia('(pointer: coarse)').matches) hint.textContent = 'Листайте вниз или выбирайте раздел сверху';
    hint.hidden = false;
    const hide = () => {
      hint.classList.add('is-gone');
      setTimeout(() => { hint.hidden = true; }, reduce.matches ? 0 : 300);
      try { localStorage.setItem(SEEN, '1'); } catch (e) { /* ничего */ }
      ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach((t) => window.removeEventListener(t, hide, true));
    };
    ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach((t) => window.addEventListener(t, hide, { capture: true, passive: true }));
    off.push(() => ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach((t) => window.removeEventListener(t, hide, true)));
  }

  // ---------- Путь: шкала лет ----------
  // Шкала не строго пропорциональная: 2014–2021 сжаты (отмечено разрывом), 2024–2025 растянуты — там этапы плотнее.
  const ANCHORS = [[2014, 0], [2021.5, 17], [2022, 24], [2023, 37], [2024, 50], [2025, 72], [2026, 90], [2026.6, 100]];
  const pos = (t) => {
    for (let k = 1; k < ANCHORS.length; k += 1) {
      const [t0, x0] = ANCHORS[k - 1]; const [t1, x1] = ANCHORS[k];
      if (t <= t1) return x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
    }
    return 100;
  };
  const PATH = [
    { from: 2014, to: 2021.45, lane: 1, label: 'До цифровых продуктов', dates: '2014 — 2021', name: 'До цифровых продуктов', role: '', text: 'Работа с клиентами, продажи, личный ассистент и административная работа' },
    { from: 2021.5, to: 2023.8, lane: 0, label: 'iConText', dates: 'июль 2021 — октябрь 2023', name: 'iConText', role: 'Редактор внутренних коммуникаций', text: 'С нуля запустила внутренние коммуникации: рубрики, Telegram, внутренний портал' },
    { from: 2024.25, to: 2024.85, lane: 0, label: 'Uzum', dates: 'апрель — ноябрь 2024', name: 'Uzum Technologies', role: 'Ведущий продуктовый редактор', text: 'Продуктовая редактура и развитие коммуникаций для цифровых сервисов бизнеса' },
    { from: 2024.88, to: 2025.3, lane: 1, label: 'Comand Studio', dates: 'ноябрь 2024 — апрель 2025 · параллельно с YourGoods', name: 'Comand Studio', role: 'Руководитель контент-направления', text: 'Alphacon: без UX-текстов продукт не выходил в релиз' },
    { from: 2024.88, to: 2025.3, lane: 2, label: 'YourGoods', dates: 'ноябрь 2024 — апрель 2025 · параллельно с Comand Studio', name: 'YourGoods', role: 'Ведущий продуктовый редактор', text: 'База знаний Widget за месяц: структура, тексты и все иллюстрации' },
    { from: 2025.35, to: 2026.55, lane: 0, label: 'Дизайн-проекты', dates: 'май 2025 — июль 2026', name: 'Дизайн-проекты', role: '', text: 'Проектная дизайн-работа: Технониколь, FlowUp' },
  ];
  const lanes = root.querySelector('[data-tl-lanes]');
  const axis = root.querySelector('[data-tl-axis]');
  const card = root.querySelector('[data-tl-card]');
  lanes.innerHTML = PATH.map((s, n) => {
    const l = pos(s.from); const w = Math.max(2.5, pos(s.to) - l);
    return `<button class="tl__stage" role="tab" type="button" id="tl-${n}" aria-controls="tl-card" style="left:${l}%;width:${w}%;top:${s.lane * 44}px"><span>${s.label}</span><i></i></button>`;
  }).join('');
  axis.innerHTML = [2014, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => `<b style="left:${pos(y)}%"><span>${y}</span></b>`).join('') + `<em style="left:${pos(2021.3)}%">//</em>`;
  card.id = 'tl-card';
  const tabs = [...lanes.querySelectorAll('.tl__stage')];
  const pick = (i, focus = false) => {
    tabs.forEach((t, n) => { t.setAttribute('aria-selected', String(n === i)); t.tabIndex = n === i ? 0 : -1; });
    const s = PATH[i];
    card.setAttribute('aria-labelledby', `tl-${i}`);
    card.innerHTML = `<small>${s.dates}</small><b>${s.name}</b>${s.role ? `<em>${s.role}</em>` : ''}<p>${s.text}</p>`;
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, n) => {
    t.addEventListener('click', () => pick(n));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); pick((n + d + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); pick(0, true); }
      if (e.key === 'End') { e.preventDefault(); pick(tabs.length - 1, true); }
    });
  });
  pick(4);

  // ---------- Факты: машинка подаёт бумагу и печатает строку ----------
  const FACTS = [
    'Анализирую всё, что можно проанализировать. Иногда даже то, что вообще не просили',
    'Недавно начала ходить в горы. Пока больше впечатлений, чем походного снаряжения',
    'У меня дома живёт чайный гриб. И, кажется, это уже небольшое хозяйство',
    'Люблю готовить. Особенно когда можно попробовать что-то новое',
    'Иногда лучший способ провести время — просто долго гулять без конкретной цели',
    'Люблю разбираться в себе: почему что-то чувствую, как принимаю решения и что на меня влияет',
    'Разговариваю со своим мозгом как с отдельным существом. Иногда приходится договариваться',
    'На прогулках замечаю детали и красоту вокруг. Когда-то специально училась замечать жизнь',
  ];
  const roll = root.querySelector('[data-roll]');
  const sr = root.querySelector('[data-fact-sr]');
  const count = root.querySelector('[data-fact-count]');
  const nextBtn = root.querySelector('[data-fact-next]');
  let fi = 0;
  let timer = 0;
  let typingLine = null;
  // Короткие слова не висят в конце строки: неразрывный пробел после предлогов и союзов
  const SHORT = /(?<=^|[\s«(„"])(в|во|и|а|о|об|у|к|ко|с|со|на|по|за|из|от|до|не|ни|но|же|ли|бы|то|для|при|без|под|над|про|что|как|или|его|её|их|мы|вы|он|она|оно|они|я|ты|это|все|всё)[ \t\r\n]+/giu;
  const typo = (t) => t.replace(SHORT, '$1\u00a0').replace(/\s+—/g, '\u00a0—');
  const line = (text, typed) => {
    const p = document.createElement('p');
    p.innerHTML = typo(text).split(' ').map((w) => `<span class="w${typed ? '' : ' on'}">${w}</span>`).join(' ');
    return p;
  };
  const finishTyping = () => {
    clearInterval(timer); timer = 0;
    if (typingLine) { typingLine.querySelectorAll('.w').forEach((w) => w.classList.add('on')); typingLine.classList.remove('is-typing'); typingLine = null; }
  };
  const nextFact = () => {
    if (typingLine) { finishTyping(); return; }               // повторное нажатие во время подачи или печати сразу допечатывает
    fi = (fi + 1) % FACTS.length;
    count.textContent = `${fi + 1} / ${FACTS.length}`;
    sr.textContent = FACTS[fi];                               // читалка получает факт целиком сразу
    // строки сдвигаются вверх: текущая бледнеет, предыдущая почти исчезает, более старые уходят
    const lines = [...roll.children];
    lines.forEach((p) => { if (p.classList.contains('is-old')) p.remove(); else if (p.classList.contains('is-prev')) { p.classList.remove('is-prev'); p.classList.add('is-old'); } else p.classList.add('is-prev'); });
    const before = roll.offsetHeight;
    const p = line(FACTS[fi], !reduce.matches);
    roll.appendChild(p);
    if (reduce.matches) return;
    // подача бумаги: вся колонка строк стоит на месте старой высоты и плавно поднимается на одну строку
    const delta = roll.offsetHeight - before;
    roll.classList.remove('is-feeding');
    roll.style.transform = `translateY(${delta}px)`;
    void roll.offsetHeight;
    roll.classList.add('is-feeding');
    roll.style.transform = '';
    // печать по словам: вся строка за ~0,45 секунды
    const words = [...p.querySelectorAll('.w')];
    const step = Math.max(25, Math.min(60, 450 / words.length));
    typingLine = p;
    let k = 0;
    setTimeout(() => {
      if (typingLine !== p) return;
      p.classList.add('is-typing');
      timer = setInterval(() => { words[k].classList.add('on'); k += 1; if (k >= words.length) finishTyping(); }, step);
    }, 160);
  };
  nextBtn.addEventListener('click', nextFact);
  roll.appendChild(line(FACTS[0], false));
  count.textContent = `1 / ${FACTS.length}`;

  // ---------- Кнопка разворота окна: проверить, как листы ведут себя при смене размера ----------
  const zoom = inFinder ? null : document.querySelector('[data-zoom]');
  zoom?.addEventListener('click', () => {
    const on = !document.body.classList.contains('is-zoomed');
    document.body.classList.toggle('is-zoomed', on);
    zoom.setAttribute('aria-pressed', String(on));
  });

  // ---------- Старт ----------
  const start = Math.max(0, keys.indexOf(new URLSearchParams(location.search).get('scene')));
  active = start;
  setMode();
  jump(start, 'auto');
  paint(start);
  committed = start;
  history.replaceState(inFinder ? history.state : { scene: keys[start] }, '', urlFor(start));
  const ro = new ResizeObserver(() => setMode());
  ro.observe(scroller);
  off.push(() => ro.disconnect());
  off.push(() => { clearInterval(timer); clearTimeout(idle); cancelAnimationFrame(frame); });
  // уходя из раздела, убираем лист из адреса
  if (inFinder) off.push(() => { const u = new URL(location.href); u.searchParams.delete('scene'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); });
  if (!inFinder) scroller.focus({ preventScroll: true });
  return () => off.forEach((fn) => fn());
  };

  window.scenesInit = init;
  init(document);
})();
