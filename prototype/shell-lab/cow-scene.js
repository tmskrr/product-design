// Корова на рабочем столе прототипа: пар над кофе, реакции и короткое знакомство.
// Вместо /product-design/js/workspace-scene.js (общий файл основного сайта не трогаем).
// Корова — одна растровая картинка, поэтому всё строится накладками поверх нужных зон
// в координатах исходного изображения (1774 × 887). Без JS сцена остаётся статичной,
// навигация по папкам от коровы не зависит.
(() => {
  const home = document.querySelector('.workspace-home');
  const background = document.querySelector('.workspace-home__background');
  const trigger = document.querySelector('.cow-work-trigger');
  if (!home || !background || !trigger) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const SOURCE = { width: 1774, height: 887 };
  const NB = ' ';

  // Зоны в пикселях исходной картинки
  const ZONES = {
    steam: { x: 1100, y: 520, width: 46, height: 74 },
    chest: { x: 1200, y: 424, width: 220, height: 139 },   // свет экрана на корове: кончается над крышкой ноутбука, на саму крышку не попадает
    heart: { x: 1291, y: 603, width: 40, height: 36 },
    armLeft: { x: 1182, y: 600, width: 38, height: 64 },
    armRight: { x: 1399, y: 600, width: 42, height: 64 },
    typing: { x: 1376, y: 536, width: 34, height: 15 },
    glasses: { x: 1252, y: 398, width: 132, height: 38 },
    laptop: { x: 1211, y: 563, width: 198, height: 117 },
    face: { x: 1190, y: 340, width: 252, height: 218 },
    crown: { x: 1300, y: 330, width: 34, height: 10 },   // точка над головой: оттуда всплывают «Му» и сердечко
    twin: { x: 1140, y: 320, width: 350, height: 242 },   // не используется: двойник убран
    horizon: { x: 930, y: 330, width: 180, height: 210 },   // кусок неба над линией горизонта, из-за которой вылезает танцующая корова
    press: { x: 1250, y: 641, width: 120, height: 24 }   // надпись «жмите» на крышке ноутбука, под сердечком
  };

  // Реплика знакомства — от имени Маргариты
  const HELLO = `Привет, я${NB}Марго. Не${NB}супермен, но${NB}схватываю как${NB}молния`;
  // Повторные тыки — голос коровы (порядок — в CHAIN ниже)
  const TIRED = 'Я вообще-то работаю';
  const PLAY = 'Ладно, давай поиграем';
  const TWIN_SRC = '/product-design/prototype/shell-lab/cow-twin.webp';

  // ---------- Слой сцены ----------
  const scene = document.createElement('div');
  scene.className = 'cow-scene';
  scene.setAttribute('aria-hidden', 'true');
  // Двойник прячется за коровой: сзади копия (отражённая), спереди — та же вырезка точно на своём месте
  scene.innerHTML = `
    <span class="cow-scene__horizon" data-zone="horizon"><img class="cow-scene__dancer" src="/product-design/prototype/shell-lab/cow-dance.webp" alt="" decoding="async"></span>
    <span class="cow-scene__steam" data-zone="steam">
      <svg viewBox="0 0 46 74" preserveAspectRatio="none">
        <path d="M19 72 C 13 61, 26 52, 19 39 S 15 19, 22 6" />
        <path d="M27 72 C 33 62, 21 54, 28 42 S 31 22, 25 10" />
        <path d="M23 72 C 18 63, 29 55, 23 44 S 19 28, 24 16" />
      </svg>
    </span>
    <span class="cow-scene__glow" data-zone="chest"></span>
    <span class="cow-scene__heart" data-zone="heart"></span>
    <span class="cow-scene__arm" data-zone="armLeft"></span>
    <span class="cow-scene__arm" data-zone="armRight"></span>
    <span class="cow-scene__typing" data-zone="typing"><i></i><i></i><i></i></span>
    <span class="cow-scene__glint" data-zone="glasses"></span>
    <span class="cow-scene__press" data-zone="press">жмите</span>`;
  home.insertBefore(scene, trigger);

  // Старая подсказка-облачко «Тыкните на корову» убрана: теперь на крышке ноутбука написано «жмите».
  // Элемент остаётся пустым и в DOM не попадает, чтобы не трогать остальную логику
  const hint = document.createElement('span');

  // Облачко знакомства
  const say = document.createElement('div');
  say.className = 'cow-say';
  say.id = 'cow-say';
  say.innerHTML = `
    <p class="cow-say__text" aria-live="polite"><span data-say-text></span><i class="cow-say__caret" aria-hidden="true"></i></p>
    <a class="cow-say__link" href="/product-design/about/" data-open-window="about">Познакомиться ближе <span aria-hidden="true">→</span></a>`;
  home.append(say);

  // Короткие реакции над головой («Му», сердечко, «Я вообще-то работаю»)
  const pop = document.createElement('span');
  pop.className = 'cow-pop';
  pop.setAttribute('aria-hidden', 'true');
  home.append(pop);
  const status = document.createElement('p');
  status.className = 'cow-status';
  status.setAttribute('role', 'status');
  home.append(status);

  const zoneEls = [...scene.querySelectorAll('[data-zone]')];
  const arms = [...scene.querySelectorAll('.cow-scene__arm')];
  const sayText = say.querySelector('[data-say-text]');
  const sayLink = say.querySelector('.cow-say__link');

  trigger.setAttribute('aria-label', 'Корова: потыкайте, она отвечает');
  trigger.removeAttribute('aria-expanded');

  // ---------- Геометрия: та же логика object-fit: cover, что у кнопки коровы ----------
  let geometry = null;
  const ratio = (value, fallback) => {
    if (!value) return fallback;
    if (value.endsWith('%')) return Number.parseFloat(value) / 100;
    if (value === 'left' || value === 'top') return 0;
    if (value === 'right' || value === 'bottom') return 1;
    return fallback;
  };
  const src = (z) => ({
    left: geometry.x + z.x * geometry.scale,
    top: geometry.y + z.y * geometry.scale,
    right: geometry.x + (z.x + z.width) * geometry.scale,
    bottom: geometry.y + (z.y + z.height) * geometry.scale
  });

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
      if (el.dataset.zone === 'press') el.style.fontSize = `${z.height * geometry.scale * .58}px`;
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
    placeOverHead(hint);
    placeOverHead(pop);
    if (say.classList.contains('is-open')) placeSay();
    const g = document.getElementById('cow-game');   // игра создаётся ниже, при первом замере её ещё может не быть
    if (g?.classList.contains('is-open')) placeSay(g);
  };

  // Метка у головы коровы (подсказка, «Му», сердечко). Ищет свободное место по порядку:
  // над головой → слева от морды → справа от морды → над облачком. Не наезжает на текст hero, папки и облачко
  const box = (el) => {
    const homeRect = home.getBoundingClientRect();
    const r = el?.getBoundingClientRect();
    return r && r.width ? { left: r.left - homeRect.left, right: r.right - homeRect.left, top: r.top - homeRect.top, bottom: r.bottom - homeRect.top } : null;
  };
  const placeOverHead = (el) => {
    if (!geometry) return;
    const homeRect = home.getBoundingClientRect();
    const crown = src(ZONES.crown);
    const face = src(ZONES.face);
    const glasses = src(ZONES.glasses);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const gap = 10;
    const cx = (crown.left + crown.right) / 2;
    const eyes = (glasses.top + glasses.bottom) / 2;
    const sayBox = say.classList.contains('is-open') ? box(say) : null;
    const blockers = [box(document.querySelector('.workspace-intro')), box(document.querySelector('.desktop-folders')), sayBox].filter(Boolean);
    const candidates = [
      { side: 'top', left: cx - w / 2, top: crown.top - h - gap },
      { side: 'left', left: face.left + (face.right - face.left) * .12 - w - gap, top: eyes - h / 2 },
      { side: 'right', left: face.right - (face.right - face.left) * .12 + gap, top: eyes - h / 2 },
      sayBox ? { side: 'none', left: sayBox.right - w, top: sayBox.top - h - 8 } : null
    ].filter(Boolean);
    const fits = ({ left, top }) =>
      left >= 12 && top >= 12 && left + w <= homeRect.width - 12 && top + h <= homeRect.height - 12 &&
      blockers.every((r) => left + w <= r.left - 6 || left >= r.right + 6 || top + h <= r.top - 6 || top >= r.bottom + 6);
    const spot = candidates.find(fits) || candidates[0];
    const left = Math.max(12, Math.min(spot.left, homeRect.width - w - 12));
    el.style.left = `${left}px`;
    el.style.top = `${Math.max(12, spot.top)}px`;
    el.dataset.side = spot.side;
    // хвостик подсказки смотрит на голову, даже если метку пришлось сдвинуть от края
    if (spot.side === 'top') el.style.setProperty('--tail', `${Math.max(14, Math.min(w - 14, cx - left))}px`);
    else el.style.setProperty('--tail', `${Math.max(10, Math.min(h - 10, eyes - Math.max(12, spot.top)))}px`);
  };

  // Облачко ищет свободное место по порядку: слева от головы над ноутбуком →
  // над головой → над папками. Не перекрывает текст hero, морду коровы, папки и Dock.
  const placeSay = (el = say) => {
    if (!geometry) return;
    const homeRect = home.getBoundingClientRect();
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const gap = 12;
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
    el.style.left = `${Math.max(gap, Math.min(spot.left, homeRect.width - width - gap))}px`;
    el.style.top = `${Math.max(gap, spot.top)}px`;
  };

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; measure(); });
  });
  const syncStill = () => scene.classList.toggle('is-still', reduceMotion.matches);
  reduceMotion.addEventListener?.('change', syncStill);
  syncStill();

  // ---------- Подсказка: показываем один раз. Если браузер не даёт запомнить, просто покажем ещё раз ----------
  const HINT_KEY = 'cow-hint-seen';
  const hintSeen = () => { try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return false; } };
  const hideHint = () => {
    hint.classList.remove('is-on');
    try { localStorage.setItem(HINT_KEY, '1'); } catch { /* без хранилища подсказка покажется снова */ }
  };
  let hintTimer = 0;

  const start = () => {
    measure();
    scene.classList.add('is-ready');
  };
  if (background.complete && background.naturalWidth) start();
  else background.addEventListener('load', start, { once: true });

  // ---------- Печать: короткие неровные серии нажатий ----------
  let typingTimer = 0;
  let typingStop = 0;
  let typingUntil = 0;
  const tap = () => {
    if (performance.now() > typingUntil) { stopTyping(); return; }
    const arm = arms[Math.random() < .5 ? 0 : 1];
    arm.classList.add('is-down');
    window.setTimeout(() => arm.classList.remove('is-down'), 70);
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
  trigger.addEventListener('pointerleave', () => { if (finePointer.matches && !say.classList.contains('is-typing')) stopTyping(120); });

  // ---------- Реакции ----------
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const glint = () => { if (!reduceMotion.matches) restart(scene, 'is-glint'); };
  const heartPulse = () => restart(scene, 'is-love');

  let popTimer = 0;
  const showPop = (kind, text) => {
    window.clearTimeout(popTimer);
    pop.className = `cow-pop cow-pop--${kind}`;
    pop.textContent = text;
    placeOverHead(pop);
    void pop.offsetWidth;
    pop.classList.add('is-on');
    status.textContent = kind === 'heart' ? '' : text;
    popTimer = window.setTimeout(() => pop.classList.remove('is-on'), kind === 'tired' ? 2600 : 1500);
  };

  // Двойник: вылезает из-за спины, стоит и прячется обратно
  let twinTimer = 0;
  const twin = () => {
    if (reduceMotion.matches || scene.classList.contains('is-twin')) { showPop('moo', 'Му'); return; }
    scene.classList.add('is-twin');
    window.clearTimeout(twinTimer);
    twinTimer = window.setTimeout(() => scene.classList.remove('is-twin'), 3400);
  };

  // Танцующая корова: поднимается из-за горизонта, пританцовывает и уходит обратно
  let danceTimer = 0;
  const dance = () => {
    if (reduceMotion.matches || scene.classList.contains('is-dance')) { showPop('moo', 'Му'); return; }
    scene.classList.add('is-dance');
    window.clearTimeout(danceTimer);
    danceTimer = window.setTimeout(() => scene.classList.remove('is-dance'), 3600);
  };

  // ---------- Облачко знакомства ----------
  let typeTimer = 0;
  let hideTimer = 0;
  const closeSay = () => {
    window.clearTimeout(typeTimer);
    window.clearTimeout(hideTimer);
    say.classList.remove('is-open', 'is-typing', 'is-done');
    stopTyping(0);
  };
  // облачко само уходит через 10 секунд, но не пока на нём курсор или фокус
  const scheduleHide = () => {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (say.matches(':hover') || say.contains(document.activeElement)) { scheduleHide(); return; }
      closeSay();
    }, 10000);
  };

  const openSay = (fromKeyboard) => {
    window.clearTimeout(typeTimer);
    say.classList.remove('is-done', 'is-typing');
    say.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    sayText.textContent = reduceMotion.matches ? HELLO : '';
    placeSay();
    const finish = () => {
      say.classList.remove('is-typing');
      say.classList.add('is-done');
      if (!finePointer.matches || !trigger.matches(':hover')) stopTyping(400);
      if (fromKeyboard) sayLink.focus({ preventScroll: true });
      scheduleHide();
    };
    if (reduceMotion.matches) { finish(); return; }
    // корова «печатает» реплику
    typeTimer = window.setTimeout(() => {
      say.classList.add('is-typing');
      startTyping(HELLO.length * 34 + 600);
      let letter = 0;
      const typeNext = () => {
        letter += 1;
        sayText.textContent = HELLO.slice(0, letter);
        if (letter < HELLO.length) typeTimer = window.setTimeout(typeNext, 26 + Math.random() * 22);
        else finish();
      };
      typeNext();
    }, 380);
  };

  // ---------- Тыки ----------
  // Короткая история: знакомство (один раз) → «Му» → корова за горизонтом → сердечко →
  // «Я вообще-то работаю» → «Ладно, давай поиграем» и игра. Шаг — на каждый тык, скорость не важна.
  // После игры цепочка реакций начинается заново, знакомство больше не повторяется.
  // Тык по корове во время игры закрывает игру
  const CHAIN = ['moo', 'dance', 'heart', 'tired', 'play'];
  // знакомство «Привет, я Марго» убрано: корова сразу играет, а «Обо мне» и так рядом в папке
  let introduced = true;
  let step = 0;

  // рамка фокуса нужна только при управлении с клавиатуры, после тыка мышью или пальцем её не показываем
  trigger.addEventListener('pointerdown', () => trigger.classList.add('is-pointer'));
  trigger.addEventListener('keydown', () => trigger.classList.remove('is-pointer'));
  trigger.addEventListener('click', (event) => {
    // тык по корове во время игры = выход из игры, без параллельных реакций
    if (document.getElementById('cow-game')?.classList.contains('is-open')) { closeGame(); return; }
    window.clearTimeout(hintTimer);
    if (hint.classList.contains('is-on') || !hintSeen()) hideHint();
    glint();
    heartPulse();

    if (!introduced) {
      introduced = true;
      openSay(event.detail === 0);
      return;
    }
    // облачко и реакции не смешиваются: тык при открытом облачке закрывает его, реакции идут уже без него
    if (say.classList.contains('is-open')) closeSay();

    const kind = CHAIN[step];
    step = Math.min(step + 1, CHAIN.length - 1);
    if (kind === 'moo') showPop('moo', 'Му');
    if (kind === 'dance') dance();
    if (kind === 'heart') showPop('heart', '♥');
    if (kind === 'tired') { showPop('tired', TIRED); startTyping(2600); }
    if (kind === 'play') { showPop('tired', PLAY); window.setTimeout(openGame, 700); step = 0; }
  });

  // ---------- Крестики-нолики с коровой ----------
  // Вы — крестики, корова — нолики. Корова выигрывает, если может, и обычно мешает вам, но иногда зевает
  const game = document.createElement('div');
  game.className = 'cow-game';
  game.id = 'cow-game';
  game.setAttribute('role', 'dialog');
  game.setAttribute('aria-label', 'Крестики-нолики с коровой');
  game.innerHTML = `
    <div class="cow-game__head"><p class="cow-game__title">Крестики-нолики</p><button type="button" class="cow-game__close" data-game-close aria-label="Закрыть игру">×</button></div>
    <div class="cow-game__grid" data-grid>${Array.from({ length: 9 }, (_, i) => `<button type="button" data-cell="${i}"></button>`).join('')}</div>
    <p class="cow-game__status" role="status" data-game-status></p>
    <button type="button" class="cow-game__again" data-game-again hidden>Ещё раз</button>`;
  home.append(game);
  const cells = [...game.querySelectorAll('[data-cell]')];
  const gameStatus = game.querySelector('[data-game-status]');
  const again = game.querySelector('[data-game-again]');
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let board = [];
  let busy = false;
  const winner = (b) => LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]);
  const paintBoard = (line) => cells.forEach((c, i) => {
    c.textContent = board[i] === 'x' ? '×' : board[i] === 'o' ? '○' : '';
    c.className = board[i] ? `is-${board[i]}` : '';
    if (line?.includes(i)) c.classList.add('is-win');
    c.disabled = Boolean(board[i]) || Boolean(line) || busy;
    c.setAttribute('aria-label', `Клетка ${i + 1}: ${board[i] === 'x' ? 'крестик' : board[i] === 'o' ? 'нолик' : 'пусто'}`);
  });
  const finish = (text, line) => {
    gameStatus.textContent = text;
    again.hidden = false;
    paintBoard(line || []);
    cells.forEach((c) => { c.disabled = true; });
  };
  const check = () => {
    const line = winner(board);
    if (line) { finish(board[line[0]] === 'x' ? 'Ладно, ваша взяла' : 'Му! Моя победа', line); return true; }
    if (board.every(Boolean)) { finish('Ничья. Ещё?'); return true; }
    return false;
  };
  const cowMove = () => {
    const free = board.map((v, i) => (v ? null : i)).filter((i) => i !== null);
    const finishing = (who) => free.find((i) => { const b = [...board]; b[i] = who; return winner(b); });
    let move = finishing('o');
    if (move === undefined && Math.random() > .25) move = finishing('x');   // иногда зевает и не мешает
    if (move === undefined && !board[4] && Math.random() > .3) move = 4;
    if (move === undefined) move = free[Math.floor(Math.random() * free.length)];
    board[move] = 'o';
  };
  const newGame = () => {
    board = Array(9).fill('');
    busy = false;
    again.hidden = true;
    gameStatus.textContent = 'Вы — крестики. Ходите';
    paintBoard();
  };
  cells.forEach((c, i) => c.addEventListener('click', () => {
    if (board[i] || busy) return;
    board[i] = 'x';
    busy = true;
    paintBoard();
    if (check()) return;
    gameStatus.textContent = 'Думаю…';
    startTyping(700);
    window.setTimeout(() => {
      cowMove();
      busy = false;
      paintBoard();
      if (!check()) gameStatus.textContent = 'Ваш ход';
      (cells.find((x) => !x.disabled) || again).focus({ preventScroll: true });
    }, reduceMotion.matches ? 150 : 650);
  }));
  again.addEventListener('click', () => { newGame(); cells[4].focus({ preventScroll: true }); });
  const closeGame = () => {
    if (!game.classList.contains('is-open')) return;
    const inside = game.contains(document.activeElement);
    game.classList.remove('is-open');
    if (inside) trigger.focus({ preventScroll: true });
  };
  game.querySelector('[data-game-close]').addEventListener('click', closeGame);
  function openGame() {
    closeSay();
    newGame();
    game.classList.add('is-open');
    placeSay(game);
    cells[4].focus({ preventScroll: true });
  }

  sayLink.addEventListener('click', () => window.setTimeout(closeSay, 0));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeGame(); });
  document.addEventListener('pointerdown', (event) => {
    if (game.classList.contains('is-open') && !game.contains(event.target) && !trigger.contains(event.target)) closeGame();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !say.classList.contains('is-open')) return;
    const inside = say.contains(document.activeElement);
    closeSay();
    if (inside) trigger.focus({ preventScroll: true });
  });
  document.addEventListener('pointerdown', (event) => {
    if (!say.classList.contains('is-open')) return;
    if (trigger.contains(event.target) || say.contains(event.target)) return;
    closeSay();
  });
  // окно раздела открылось поверх рабочего стола — облачко больше не нужно
  document.querySelectorAll('[data-open-window]').forEach((el) => el.addEventListener('click', () => { closeSay(); closeGame(); }));
})();
