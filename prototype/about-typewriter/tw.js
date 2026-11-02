/* «Обо мне» — листы и машинка.
   Листы: тянуть вверх — лист выезжает целиком, тянуть вниз — уходит обратно. Нажатие на лист тоже открывает и закрывает.
   Открыт всегда один лист. Escape закрывает.
   Машинка: печатает случайный факт по кнопке «Ещё факт» или по клику на бумагу.
   Работает на отдельной странице и внутри окна Finder (там finder-app.js вызывает window.twInit(page)). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SHORT = /(?<=^|[\s«(„"])(в|во|и|а|о|об|у|к|ко|с|со|на|по|за|из|от|до|не|ни|но|же|ли|бы|то|для|при|без|под|над|про|что|как|или|его|её|их|мы|вы|он|она|оно|они|я|ты|это|все|всё)[ \t\r\n]+/giu;
  const typo = (t) => t.replace(SHORT, '$1 ').replace(/\s+—/g, ' —');

  const init = (scope) => {
    const root = scope.querySelector('[data-tw]');
    if (!root || root.dataset.ready) return () => {};
    root.dataset.ready = '1';
    const off = [];
    const on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); off.push(() => el.removeEventListener(type, fn, opts)); };

    // ---------- Листы ----------
    const tray = root.querySelector('[data-tray]');
    const cards = [...root.querySelectorAll('[data-card]')];
    // сколько листа спрятано внизу: та же формула, что --peek в стилях
    const rest = (card) => {
      const cs = getComputedStyle(card);
      const i = parseFloat(cs.getPropertyValue('--i')) || 0;
      const step = parseFloat(cs.getPropertyValue('--peek-step')) || 30;
      return card.offsetHeight - (50 + (cards.length - 1 - i) * step);
    };
    const lift = (card) => parseFloat(getComputedStyle(card).getPropertyValue('--lift')) || 0;
    const setOpen = (card, open) => {
      card.classList.toggle('is-open', open);
      card.querySelector('.tw-card__head').setAttribute('aria-expanded', String(open));
    };
    // у длинного текста внизу затухание, пока не долистали до конца
    const markMore = (body) => body.classList.toggle('is-more', body.scrollTop + body.clientHeight < body.scrollHeight - 4);
    cards.forEach((c) => { const b = c.querySelector('.tw-card__body'); on(b, 'scroll', () => markMore(b), { passive: true }); });
    // телефон: листы в потоке, раскрываются на месте. Компьютер: стопка, лист вытягивают
    const isFlow = () => getComputedStyle(cards[0]).position !== 'absolute';
    // открытый лист подбирает высоту по тексту: если помещается — стоит над стопкой,
    // если нет — поднимается выше, вплоть до верха колонки. Не помещается и так — прокрутка внутри
    const fit = (card) => {
      card.style.removeProperty('--open-h'); card.style.removeProperty('--open-lift');
      if (isFlow()) return;
      const body = card.querySelector('.tw-card__body');
      // высота текста без растягивания: на время замера тело листа не заполняет карточку
      const prev = body.style.flex;
      const full = body.clientHeight;
      body.style.flex = 'none';
      const natural = body.scrollHeight;
      body.style.flex = prev;
      const need = card.offsetHeight - full + natural + 2;
      const trayH = tray.offsetTop + tray.clientHeight;   // от верха колонки до низа стопки
      const col = tray.parentElement.clientHeight;          // под стопкой есть свободное место: длинный лист может опуститься туда
      const lift = parseFloat(getComputedStyle(card).getPropertyValue('--lift')) || 0;
      // лист ровно по тексту: короткий не превращается в большой пустой лист
      const oh = Math.max(Math.min(need, col - 4), 140);
      card.style.setProperty('--open-h', `${oh}px`);
      // поднимается над стопкой, если хватает места, иначе опускается ниже её края (отрицательный подъём)
      card.style.setProperty('--open-lift', `${Math.max(trayH - col, Math.min(lift, trayH - 4 - oh))}px`);
    };
    const openCard = (card) => {
      cards.forEach((c) => { if (c !== card) { setOpen(c, false); c.style.removeProperty('--open-h'); c.style.removeProperty('--open-lift'); } });
      setOpen(card, true);
      tray.classList.add('has-open');
      if (!isFlow()) root.classList.add('is-reading');   // пока читают лист, машинка затихает: тексты не спорят
      const body = card.querySelector('.tw-card__body');
      body.scrollTop = 0;
      fit(card);
      setTimeout(() => markMore(body), 450);
    };
    const closeAll = () => { cards.forEach((c) => setOpen(c, false)); tray.classList.remove('has-open'); root.classList.remove('is-reading'); };
    const ro = new ResizeObserver(() => { const c = cards.find((x) => x.classList.contains('is-open')); if (c) { fit(c); markMore(c.querySelector('.tw-card__body')); } });
    ro.observe(tray);
    off.push(() => ro.disconnect());
    // клик мимо открытого листа (не по другому листу) закрывает его
    on(document, 'pointerdown', (e) => {
      if (isFlow() || !tray.classList.contains('has-open')) return;
      if (e.target.closest('[data-card]')) return;
      if (!root.contains(e.target)) return;
      closeAll();
    });
    const toggle = (card) => (card.classList.contains('is-open') ? closeAll() : openCard(card));

    cards.forEach((card) => {
      let startY = 0; let moved = false; let wasOpen = false; let dist = 0; let id = null;
      on(card, 'pointerdown', (e) => {
        if (e.button !== 0 || isFlow()) return;
        // у открытого листа длинный текст прокручивается пальцем — тогда это не перетаскивание листа
        const body = card.querySelector('.tw-card__body');
        if (card.classList.contains('is-open') && e.target.closest('.tw-card__body') && body.scrollHeight > body.clientHeight + 1) return;
        id = e.pointerId; startY = e.clientY; moved = false; dist = 0; wasOpen = card.classList.contains('is-open');
        card.setPointerCapture(id);
      });
      on(card, 'pointermove', (e) => {
        if (e.pointerId !== id) return;
        const dy = e.clientY - startY;
        if (!moved && Math.abs(dy) < 5) return;
        moved = true;
        card.classList.add('is-dragging');
        const max = rest(card);
        if (wasOpen) { dist = Math.max(0, Math.min(max + lift(card), dy)); card.style.setProperty('--drag-open', `${dist}px`); }
        else { dist = Math.max(0, Math.min(max + lift(card), -dy)); card.style.setProperty('--drag', `${dist}px`); if (dist > 0) card.style.zIndex = 20; }
      });
      const end = (e) => {
        if (e.pointerId !== id) return;
        id = null;
        card.classList.remove('is-dragging');
        card.style.removeProperty('--drag'); card.style.removeProperty('--drag-open'); card.style.zIndex = '';
        if (!moved) { toggle(card); card.dataset.skipClick = '1'; return; }
        // потянули достаточно — лист выезжает (или уходит обратно)
        if (wasOpen) { if (dist > 48) closeAll(); } else if (dist > 48) openCard(card);
        card.dataset.skipClick = '1';
      };
      on(card, 'pointerup', end);
      on(card, 'pointercancel', end);
      // клавиатура: Enter и пробел на заголовке
      on(card.querySelector('.tw-card__head'), 'click', (e) => {
        if (card.dataset.skipClick) { delete card.dataset.skipClick; return; }
        if (e.detail === 0) toggle(card);
      });
      // телефон: тап по листу раскрывает и сворачивает его (ссылки внутри работают как ссылки)
      on(card, 'click', (e) => {
        if (!isFlow() || e.detail === 0 || e.target.closest('a')) return;
        toggle(card);
      });
    });
    on(document, 'keydown', (e) => { if (e.key === 'Escape' && cards.some((c) => c.classList.contains('is-open'))) closeAll(); });

    // ---------- Машинка печатает факты ----------
    const facts = [...root.querySelectorAll('[data-facts] li')].map((li) => typo(li.textContent.trim()));
    const roll = root.querySelector('[data-fact-roll]');
    const paper = root.querySelector('[data-fact-paper]');
    const sr = root.querySelector('[data-fact-sr]');
    const nextBtn = root.querySelector('[data-fact-next]');
    let fi = -1; let timer = 0; let typing = null;
    // клавиши: координаты в пикселях исходной картинки (1313×879) и место в спрайте tw3-keys.webp (1060×390)
    const keyLayer = root.querySelector('[data-keys]');
    const KEYS = keyLayer ? JSON.parse(keyLayer.dataset.keys) : [];
    const SPR = '/product-design/assets/images/portfolio/tw3-keys.webp';
    const press = (word) => {
      if (!keyLayer || !KEYS.length || reduce.matches) return;
      let h = 0; for (const c of word.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 997;
      const i = word === ' ' ? KEYS.length - 1 : h % (KEYS.length - 1);   // последняя — пробел
      const [x, y, w, hh, sx, sy] = KEYS[i];
      const u = (n) => `calc(var(--u) * ${n})`;
      const pos = `${u(-sx)} ${u(-sy)}`; const size = `${u(1060)} ${u(390)}`;
      const el = document.createElement('div');
      el.className = 'tw-k';
      el.style.cssText = `left:${u(x)};top:${u(y)};width:${u(w)};height:${u(hh)}`;
      el.innerHTML = `<i class="hole" style="-webkit-mask-image:url(${SPR});mask-image:url(${SPR});-webkit-mask-position:${pos};mask-position:${pos};-webkit-mask-size:${size};mask-size:${size}"></i><i class="cap" style="background-image:url(${SPR});background-position:${pos};background-size:${size}"></i>`;
      keyLayer.appendChild(el);
      setTimeout(() => el.remove(), word === ' ' ? 110 : 85);
    };
    const finish = () => {
      clearInterval(timer); timer = 0;
      if (typing) { typing.querySelectorAll('.w').forEach((w) => w.classList.add('on')); typing.classList.remove('is-typing'); typing.classList.add('is-done'); typing = null; }
      roll.classList.remove('is-feeding'); roll.style.transform = ''; roll.classList.add('is-up');
    };
    const next = () => {
      if (!roll || !facts.length) return;
      if (typing) { finish(); return; }                 // второй клик во время печати — сразу допечатать
      fi = (fi + 1) % facts.length;
      sr.textContent = facts[fi];
      [...roll.children].forEach((p) => {
        if (p.classList.contains('is-old')) p.remove();
        else if (p.classList.contains('is-prev')) { p.classList.remove('is-prev'); p.classList.add('is-old'); } else p.classList.add('is-prev');
      });
      const up = roll.classList.contains('is-up') ? parseFloat(getComputedStyle(roll).transform.split(',')[5]) || 0 : 0;
      roll.classList.remove('is-up');
      const before = roll.offsetHeight;
      const p = document.createElement('p');
      p.innerHTML = facts[fi].split(' ').map((w) => `<span class="w${reduce.matches ? ' on' : ''}">${w}</span>`).join(' ');
      [...roll.children].forEach((x) => x.classList.remove('is-last', 'is-done'));
      p.classList.add('is-last');
      roll.appendChild(p);
      if (reduce.matches) { p.classList.add('is-done'); roll.classList.add('is-up'); return; }
      // подача бумаги на строку
      const delta = roll.offsetHeight - before;
      roll.classList.remove('is-feeding');
      roll.style.transform = `translateY(${delta + up}px)`;
      void roll.offsetHeight;
      roll.classList.add('is-feeding');
      roll.style.transform = '';
      // строка печатается по словам меньше чем за секунду
      const words = [...p.querySelectorAll('.w')];
      const step = Math.max(30, Math.min(70, 700 / words.length));
      typing = p;
      let k = 0;
      const t0 = setTimeout(() => {
        if (typing !== p) return;
        p.classList.add('is-typing');
        timer = setInterval(() => { words[k].classList.add('on'); press(words[k].textContent); if (k % 3 === 2) setTimeout(() => press(' '), step / 2); k += 1; if (k >= words.length) finish(); }, step);
      }, 200);
      off.push(() => clearTimeout(t0));
    };
    // нажали на машинку, пока открыт лист: лист уходит в стопку, машинка печатает
    const fromMachine = () => { if (root.classList.contains('is-reading')) { closeAll(); setTimeout(next, 250); return; } next(); };
    if (nextBtn) on(nextBtn, 'click', fromMachine);
    if (paper) on(paper, 'click', fromMachine);
    if (paper) on(paper, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fromMachine(); } });
    off.push(() => clearInterval(timer));
    const t1 = setTimeout(next, 500);
    off.push(() => clearTimeout(t1));

    return () => off.forEach((fn) => fn());
  };

  window.twInit = init;
  init(document);

  // кнопка разворота окна на отдельной странице
  const zoom = document.querySelector('[data-zoom]');
  zoom?.addEventListener('click', () => {
    const on = !document.body.classList.contains('is-zoomed');
    document.body.classList.toggle('is-zoomed', on);
    zoom.setAttribute('aria-pressed', String(on));
  });
})();
