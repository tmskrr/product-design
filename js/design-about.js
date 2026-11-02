// «Обо мне» на дизайн-сайте: три тестовых варианта. Разметка приходит в окно без своих скриптов,
// поэтому всё работает через делегирование событий на document.
(() => {
  // ---------- Компонент: свойства меняют data-атрибуты карточки ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ab-cmp] [data-set]');
    if (!b) return;
    const root = b.closest('[data-ab-cmp]');
    const key = b.dataset.set;
    if (key === 'coffee') {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on)); root.dataset.coffee = String(on); return;
    }
    root.dataset[key] = b.dataset.val;
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  });

  // ---------- Переписка: ответы приходят сразу, по сообщению с короткой паузой ----------
  const factIndex = new WeakMap();
  const wait = (ms) => new Promise((r) => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms));
  const addMsg = (log, html, cls) => { const p = document.createElement('p'); p.className = `ab-msg ${cls}`; p.innerHTML = html; log.appendChild(p); log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' }); return p; };
  const answer = async (root, log, q) => {
    let tpls = [...root.querySelectorAll(`template[data-a="${q}"]`)];
    if (tpls.length > 1) { const i = factIndex.get(root) || 0; factIndex.set(root, i + 1); tpls = [tpls[i % tpls.length]]; }
    for (const part of tpls[0].content.querySelectorAll('p')) { await wait(220); addMsg(log, part.innerHTML, 'ab-msg--in'); }
  };
  // «листаемые» ответы (факты, отзывы): один блок, следующий заменяет предыдущий, история не разрастается
  const CYCLE = ['fact', 'ref'];
  const REFRESH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M8 16H3v5"/></svg>';
  const idx = new WeakMap();
  const showCycle = (root, log, q) => {
    const tpls = [...root.querySelectorAll(`template[data-a="${q}"]`)];
    const m = idx.get(root) || {}; const i = (m[q] || 0) % tpls.length; m[q] = i + 1; idx.set(root, m);
    let box = log.querySelector(`[data-cycle="${q}"]`);
    if (!box) {
      box = document.createElement('div'); box.className = 'ab-fact'; box.dataset.cycle = q;
      box.innerHTML = `<div class="ab-fact__msgs" data-cycle-msgs></div><div class="ab-fact__bar"><span data-cycle-n></span><button type="button" data-cycle-next="${q}">${REFRESH}Ещё</button></div>`;
    }
    if (box.parentNode !== log) log.appendChild(box);
    const wrap = box.querySelector('[data-cycle-msgs]'); wrap.textContent = '';
    for (const part of tpls[i].content.querySelectorAll('p')) { const el = document.createElement('p'); el.className = 'ab-msg ab-msg--in'; el.innerHTML = part.innerHTML; wrap.appendChild(el); }
    box.querySelector('[data-cycle-n]').textContent = `${i + 1} из ${tpls.length}`;
    log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  };
  // вопрос и блок всегда идут парой внизу: если после них были другие ответы, переезжают вместе
  const askCycle = async (root, log, q, label) => {
    const box = log.querySelector(`[data-cycle="${q}"]`);
    if (!box || box !== log.lastElementChild) {
      if (box) { box.previousElementSibling?.remove(); box.remove(); }
      addMsg(log, label, 'ab-msg--out'); await wait(220);
    }
    showCycle(root, log, q);
  };
  let busy = false;
  document.addEventListener('click', async (e) => {
    const root = e.target.closest('[data-ab-chat]');
    if (!root) return;
    const nx = e.target.closest('[data-cycle-next]');
    if (nx) { showCycle(root, root.querySelector('[data-chat-log]'), nx.dataset.cycleNext); return; }
    // переключение чатов
    const tab = e.target.closest('[data-chat]');
    if (tab) {
      root.querySelectorAll('[data-chat]').forEach((t) => t.classList.toggle('is-on', t === tab));
      root.querySelectorAll('[data-room]').forEach((r) => r.classList.toggle('is-on', r.dataset.room === tab.dataset.chat));
      return;
    }
    // гусь отвечает «Га» на разные лады
    const g = e.target.closest('[data-goose]');
    if (g) {
      const log = root.querySelector('[data-goose-log]');
      addMsg(log, g.innerHTML, 'ab-msg--out');
      const replies = ['Га', 'Га-га', 'ГА!', 'Га… га', 'Га 👍', 'Гаааа'];
      await wait(300); addMsg(log, replies[Math.floor(Math.random() * replies.length)], 'ab-msg--in');
      return;
    }
    const chip = e.target.closest('[data-q]');
    if (!chip || busy) return;
    busy = true;
    const log = root.querySelector('[data-chat-log]');
    if (CYCLE.includes(chip.dataset.q)) { await askCycle(root, log, chip.dataset.q, chip.innerHTML); busy = false; return; }
    addMsg(log, chip.innerHTML, 'ab-msg--out');
    if (chip.dataset.q === 'all') {
      for (const c of root.querySelectorAll('[data-q]:not(.is-asked)')) {
        if (c.dataset.q === 'all' || CYCLE.includes(c.dataset.q)) continue;
        await answer(root, log, c.dataset.q); c.classList.add('is-asked');
      }
      for (const q of CYCLE) { const c = root.querySelector(`[data-q="${q}"]`); if (c) await askCycle(root, log, q, c.innerHTML); }
      chip.remove();
    } else {
      await answer(root, log, chip.dataset.q);
      chip.classList.add('is-asked');
    }
    busy = false;
  });

  // ---------- Полароиды: таскать мышью и пальцем, короткий тык переворачивает ----------
  let drag = null;
  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('[data-ab-wall] .ab-pol');
    if (!card) return;
    const wall = card.closest('[data-ab-wall]');
    wall.querySelectorAll('.ab-pol').forEach((c) => { c.style.zIndex = ''; });
    card.style.zIndex = 4;
    drag = { card, x: e.clientX, y: e.clientY, dx: parseFloat(card.style.getPropertyValue('--dx')) || 0, dy: parseFloat(card.style.getPropertyValue('--dy')) || 0, moved: false };
    card.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const mx = e.clientX - drag.x; const my = e.clientY - drag.y;
    if (Math.abs(mx) + Math.abs(my) > 4) { drag.moved = true; drag.card.classList.add('is-drag'); }
    if (!drag.moved) return;
    drag.card.style.setProperty('--dx', `${drag.dx + mx}px`);
    drag.card.style.setProperty('--dy', `${drag.dy + my}px`);
  });
  const end = () => {
    if (!drag) return;
    if (!drag.moved) drag.card.classList.toggle('is-flip');
    drag.card.classList.remove('is-drag');
    drag = null;
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);

  // ---------- Музыка: тык по плейлисту меняет пластинку и сразу открывает его в плеере Яндекс Музыки.
  // «Случайная песня» берёт трек из моих плейлистов и открывает плеер одной песни (там видно название).
  // Ничего не играет само: включают кнопкой внутри плеера ----------
  const muReduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const muDisc = (root, { color, label, num, title, kicker }) => {
    const disc = root.querySelector('[data-mu-disc]');
    disc.classList.add('is-out');
    setTimeout(() => {
      root.style.setProperty('--c', color);
      root.querySelector('[data-mu-label]').textContent = label;
      root.querySelector('.mu-disc__label').classList.toggle('is-long', label.length > 20);
      const t = root.querySelector('[data-mu-name]'); t.innerHTML = title; t.classList.toggle('is-long', label.length > 20);
      root.querySelector('[data-mu-num]').textContent = num;
      root.querySelector('.mu-kicker').innerHTML = kicker || `Плейлист <span data-mu-num2>${num}</span>/11`;
      disc.classList.remove('is-out');
    }, muReduce() ? 0 : 350);
  };
  const muPlayer = (root, src, title, track) => {
    const box = root.querySelector('[data-mu-player]');
    const old = box.querySelector('iframe');
    if (!old || old.dataset.src !== src) {
      box.innerHTML = '';
      const f = document.createElement('iframe');
      f.src = src; f.dataset.src = src; f.title = title;
      f.allow = 'clipboard-write; encrypted-media';
      box.append(f);
    }
    root.classList.add('is-player', 'is-playing');
    root.classList.toggle('is-track', track);
    requestAnimationFrame(() => box.scrollIntoView({ block: 'nearest', behavior: muReduce() ? 'auto' : 'smooth' }));
  };
  const muClose = (root) => {
    root.classList.remove('is-player', 'is-playing', 'is-track');
    root.querySelector('[data-mu-player]').innerHTML = '';
    root.querySelector('[data-mu-rand-label]').textContent = 'Случайная песня';
    const row = root.querySelector('.mu-row.is-on');
    if (row && root.dataset.mode === 'rand') {
      root.dataset.mode = '';
      const num = String([...root.querySelectorAll('.mu-row')].indexOf(row) + 1).padStart(2, '0');
      muDisc(root, { color: row.style.getPropertyValue('--c'), label: row.dataset.name, num, title: row.querySelector('.mu-row__t').innerHTML });
    }
  };
  let muLast = '';
  document.addEventListener('click', (e) => {
    const root = e.target.closest('[data-mu-root]');
    if (!root) return;
    const row = e.target.closest('.mu-row');
    if (row) {
      root.dataset.mode = '';
      root.querySelector('[data-mu-rand-label]').textContent = 'Случайная песня';
      root.querySelectorAll('.mu-row').forEach((x) => x.classList.toggle('is-on', x === row));
      const num = String([...root.querySelectorAll('.mu-row')].indexOf(row) + 1).padStart(2, '0');
      muDisc(root, { color: row.style.getPropertyValue('--c'), label: row.dataset.name, num, title: row.querySelector('.mu-row__t').innerHTML });
      muPlayer(root, `https://music.yandex.ru/iframe/playlists/${row.dataset.mu}`, `Плейлист «${row.dataset.name}» в Яндекс Музыке`, false);
      return;
    }
    if (e.target.closest('[data-mu-rand]')) {
      const pool = (root.dataset.muPool || '').split(',').filter((x) => x && x !== muLast);
      if (!pool.length) return;
      const pick = pool[Math.floor(Math.random() * pool.length)]; muLast = pick;
      const [album, track] = pick.split('/');
      if (root.dataset.mode !== 'rand') muDisc(root, { color: '#e2412b', label: 'Наугад', num: '··', title: 'Случайная песня', kicker: 'Из всех плейлистов' });
      root.dataset.mode = 'rand';
      root.querySelector('[data-mu-rand-label]').textContent = 'Ещё одну';
      muPlayer(root, `https://music.yandex.ru/iframe/album/${album}/track/${track}`, 'Случайная песня в Яндекс Музыке', true);
      return;
    }
    if (e.target.closest('[data-mu-back]')) muClose(root);
  });
})();
