// Мини-игра «Гусь бежит» (как динозаврик в Chrome). Открывается окном поверх стола: window.dzRunner.open().
// Пробел, стрелка вверх, тык или тап — прыжок. Перепрыгиваешь правки и дедлайны, собираешь кофе.
// Врезался — «Ещё раз». Рекорд хранится в браузере (без него игра тоже работает).
(() => {
  // препятствия разного вида: плашка, стопка правок, стикер с ТЗ, бейдж уведомлений, файл final_v7, будильник-дедлайн
  const CHIPS = ['Правки', 'Ещё вариантик', 'Сделайте ярче', 'Логотип больше', 'Можно созвон?', 'Срочно'];
  const KINDS = ['chip', 'chip', 'stack', 'note', 'badge', 'file', 'clock'];
  const C = { ink: '#1f2427', soft: '#8b9399', line: 'rgba(31,36,39,.18)', white: '#ffffff', beak: '#f28c28', feet: '#ee7d22', phones: '#e9a7d6', mug: '#f2a7c3', chip: '#ffffff', chipInk: '#c0392b', note: '#ffe58a', red: '#e5484d' };
  let win = null;

  const build = () => {
    const el = document.createElement('div');
    el.className = 'gr';
    el.innerHTML = `
      <div class="gr__win" role="dialog" aria-modal="true" aria-label="Игра «Гусь бежит»">
        <div class="gr__bar"><button class="gr__dot" type="button" data-gr-close aria-label="Закрыть игру"></button><i></i><i></i><span>Гусь бежит</span><button class="gr__pause" type="button" data-gr-pause aria-label="Пауза" hidden></button></div>
        <div class="gr__stage">
          <canvas class="gr__cv"></canvas>
          <div class="gr__hud"><span data-gr-coffee>кофе 0</span><span data-gr-score>00000</span><span class="gr__best" data-gr-best></span></div>
          <div class="gr__msg" data-gr-msg><b>Гусь бежит</b><span>Пробел или тап — прыжок, P — пауза. Прыгай через правки, собирай кофе</span><button type="button" data-gr-start>Поехали</button></div>
        </div>
      </div>`;
    document.body.append(el);
    return el;
  };

  const game = (el) => {
    const cv = el.querySelector('.gr__cv'); const ctx = cv.getContext('2d');
    const msg = el.querySelector('[data-gr-msg]'); const startBtn = el.querySelector('[data-gr-start]');
    const sScore = el.querySelector('[data-gr-score]'); const sCoffee = el.querySelector('[data-gr-coffee]'); const sBest = el.querySelector('[data-gr-best]');
    let best = 0; try { best = Number(localStorage.getItem('dz-runner-best')) || 0; } catch (e) { /* без памяти */ }
    const showBest = () => { sBest.textContent = best ? `рекорд ${String(best).padStart(5, '0')}` : ''; };
    showBest();
    let W = 0; let H = 0; let dpr = 1; let ground = 0; let U = 1;
    const size = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      U = H / 300; ground = H - 46 * U;
    };
    size(); addEventListener('resize', size);

    const pauseBtn = el.querySelector('[data-gr-pause]');
    const ICON = {
      pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
    };
    const S = { paused: false, run: false, over: false, t: 0, speed: 0, dist: 0, coffee: 0, y: 0, vy: 0, obs: [], cups: [], nextObs: 0, nextCup: 0, clouds: [] };
    const reset = () => {
      Object.assign(S, { run: true, over: false, t: 0, speed: 330, dist: 0, coffee: 0, y: 0, vy: 0, obs: [], cups: [], nextObs: 1.1, nextCup: 2.2 });
      S.clouds = [0, 1, 2].map((i) => ({ x: (0.2 + i * 0.35) * W, y: (40 + i * 22) * U }));
      msg.hidden = true; S.paused = false; syncPause();
    };
    // пауза: кнопка в шапке окна, клавиша P, сама включается, если ушли с вкладки или из окна
    const syncPause = () => {
      pauseBtn.hidden = !S.run;
      pauseBtn.innerHTML = S.paused ? ICON.play : ICON.pause;
      pauseBtn.setAttribute('aria-label', S.paused ? 'Продолжить' : 'Пауза');
    };
    const pause = () => {
      if (!S.run || S.paused) return;
      S.paused = true; syncPause();
      msg.hidden = false; msg.querySelector('b').textContent = 'Пауза'; msg.querySelector('span').textContent = 'Пробел или тап — продолжить'; startBtn.textContent = 'Продолжить';
    };
    const resume = () => { if (!S.paused) return; S.paused = false; msg.hidden = true; last = performance.now(); syncPause(); };
    const jump = () => {
      if (S.paused) { resume(); return; }
      if (!S.run) { if (!S.over || performance.now() - S.overAt > 350) reset(); return; }
      if (S.y <= 0.5) S.vy = 640;   // единиц/с вверх
    };

    ctx.font = '600 13px "IBM Plex Sans", Arial, sans-serif';
    const chipW = (t) => { ctx.font = `600 ${12 * U}px "IBM Plex Sans", Arial, sans-serif`; return ctx.measureText(t).width + 20 * U; };

    // ---------- рисование ----------
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
    const goose = (x, by, t, air, dead) => {
      const u = U; const step = Math.sin(t * 22);
      ctx.save(); ctx.translate(x, by);
      ctx.lineWidth = 2 * u; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.ink;
      // лапы
      ctx.strokeStyle = C.feet; ctx.lineWidth = 3 * u;
      const l1 = air ? -4 : step * 7; const l2 = air ? 4 : -step * 7;
      ctx.beginPath(); ctx.moveTo(-4 * u, -14 * u); ctx.lineTo((-4 + l1) * u, 0); ctx.lineTo((2 + l1) * u, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6 * u, -14 * u); ctx.lineTo((6 + l2) * u, 0); ctx.lineTo((12 + l2) * u, 0); ctx.stroke();
      // тело
      ctx.fillStyle = C.white; ctx.strokeStyle = C.ink; ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.ellipse(0, -26 * u, 22 * u, 14 * u, -0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-20 * u, -30 * u); ctx.lineTo(-30 * u, -38 * u); ctx.lineTo(-18 * u, -24 * u); ctx.fill(); ctx.stroke();   // хвост
      // крыло
      ctx.beginPath(); ctx.ellipse(-2 * u, (-28 + (air ? -3 : step)) * u, 12 * u, 6 * u, air ? -0.5 : -0.15, 0, Math.PI * 2); ctx.stroke();
      // шея и голова
      ctx.beginPath(); ctx.moveTo(14 * u, -34 * u); ctx.quadraticCurveTo(22 * u, -48 * u, 18 * u, -62 * u);
      ctx.lineWidth = 11 * u; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.lineWidth = 7 * u; ctx.strokeStyle = C.white; ctx.stroke();
      ctx.lineWidth = 2 * u; ctx.strokeStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(21 * u, -66 * u, 9 * u, 7 * u, 0.1, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill(); ctx.stroke();
      // клюв
      ctx.fillStyle = C.beak; ctx.beginPath(); ctx.moveTo(28 * u, -69 * u); ctx.lineTo(38 * u, -65 * u); ctx.lineTo(28 * u, -62 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      // глаз
      ctx.fillStyle = C.ink;
      if (dead) { ctx.lineWidth = 1.6 * u; ctx.beginPath(); ctx.moveTo(21 * u, -70 * u); ctx.lineTo(25 * u, -66 * u); ctx.moveTo(25 * u, -70 * u); ctx.lineTo(21 * u, -66 * u); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(23 * u, -68 * u, 1.8 * u, 0, Math.PI * 2); ctx.fill(); }
      // наушники
      // наушники в профиль: видна одна чашка на ухе, дужка уходит от неё вверх через макушку
      // дужка видна ребром: полоса от чашки до макушки, сверху повторяет контур головы
      ctx.fillStyle = C.phones; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(13.6 * u, -66 * u);
      ctx.ellipse(21 * u, -66 * u, 11.4 * u, 9.6 * u, 0.1, -2.33, -1.72, false); ctx.lineTo(19.2 * u, -66 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.phones; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.ellipse(16 * u, -65.5 * u, 4.2 * u, 5.6 * u, 0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    };
    const cup = (x, y) => {
      const u = U; ctx.save(); ctx.translate(x, y); ctx.lineWidth = 2 * u; ctx.strokeStyle = C.ink; ctx.fillStyle = C.mug;
      rr(-8 * u, -9 * u, 14 * u, 15 * u, 3 * u); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(7 * u, -2 * u, 4 * u, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(-3 * u, -13 * u); ctx.quadraticCurveTo(-6 * u, -17 * u, -2 * u, -21 * u); ctx.moveTo(2 * u, -13 * u); ctx.quadraticCurveTo(-1 * u, -17 * u, 3 * u, -21 * u); ctx.stroke();
      ctx.restore();
    };
    const label = (t, x, y, col, px) => { ctx.font = `600 ${px * U}px "IBM Plex Sans", Arial, sans-serif`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };
    const make = (x) => {
      const kind = KINDS[Math.floor(Math.random() * KINDS.length)]; const u = U;
      if (kind === 'chip') { const text = CHIPS[Math.floor(Math.random() * CHIPS.length)]; return { kind, x, text, w: chipW(text), h: 30 * u }; }
      if (kind === 'stack') return { kind, x, w: chipW('Ещё правки'), h: 54 * u };
      if (kind === 'note') return { kind, x, w: 38 * u, h: 38 * u, rot: (Math.random() - 0.5) * 0.12 };
      if (kind === 'badge') return { kind, x, w: 34 * u, h: 34 * u };
      if (kind === 'file') return { kind, x, w: 34 * u, h: 44 * u };
      return { kind, x, w: 36 * u, h: 40 * u };
    };
    const obstacle = (o) => {
      const u = U; const g = ground; ctx.save(); ctx.lineWidth = 2 * u; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round';
      const cx = o.x + o.w / 2;
      if (o.kind === 'chip') { ctx.fillStyle = C.chip; rr(o.x, g - o.h, o.w, o.h, 8 * u); ctx.fill(); ctx.stroke(); label(o.text, cx, g - o.h / 2 + 0.5 * u, C.chipInk, 12); }
      else if (o.kind === 'stack') {
        ctx.fillStyle = C.chip; rr(o.x, g - 27 * u, o.w, 27 * u, 8 * u); ctx.fill(); ctx.stroke(); label('Правки', cx, g - 13 * u, C.chipInk, 12);
        ctx.fillStyle = C.chip; rr(o.x + 6 * u, g - 54 * u, o.w - 12 * u, 27 * u, 8 * u); ctx.fill(); ctx.stroke(); label('Ещё правки', cx, g - 40 * u, C.chipInk, 11);
      } else if (o.kind === 'note') {
        ctx.translate(cx, g - o.h / 2); ctx.rotate(o.rot);
        ctx.fillStyle = C.note; ctx.beginPath(); ctx.moveTo(-19 * u, -19 * u); ctx.lineTo(19 * u, -19 * u); ctx.lineTo(19 * u, 9 * u); ctx.lineTo(9 * u, 19 * u); ctx.lineTo(-19 * u, 19 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(19 * u, 9 * u); ctx.lineTo(9 * u, 9 * u); ctx.lineTo(9 * u, 19 * u); ctx.stroke();
        label('ТЗ', 0, -3 * u, C.ink, 13);
      } else if (o.kind === 'badge') {
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, g - 17 * u, 16 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); label('99+', cx, g - 16.5 * u, '#fff', 11);
      } else if (o.kind === 'file') {
        ctx.fillStyle = C.chip; ctx.beginPath(); ctx.moveTo(o.x, g); ctx.lineTo(o.x, g - 44 * u); ctx.lineTo(o.x + 22 * u, g - 44 * u); ctx.lineTo(o.x + 34 * u, g - 32 * u); ctx.lineTo(o.x + 34 * u, g); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(o.x + 22 * u, g - 44 * u); ctx.lineTo(o.x + 22 * u, g - 32 * u); ctx.lineTo(o.x + 34 * u, g - 32 * u); ctx.stroke();
        ctx.fillStyle = C.phones; rr(o.x + 5 * u, g - 22 * u, 24 * u, 11 * u, 3 * u); ctx.fill(); label('v7', cx, g - 16 * u, C.ink, 9);
        label('final', cx, g - 5 * u, C.soft, 8);
      } else {
        // будильник-дедлайн: стрелки без пяти
        ctx.fillStyle = C.chip; ctx.beginPath(); ctx.arc(cx, g - 20 * u, 16 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.red; [-1, 1].forEach((k) => { ctx.beginPath(); ctx.arc(cx + k * 11 * u, g - 36 * u, 5 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
        ctx.beginPath(); ctx.moveTo(cx - 9 * u, g - 1 * u); ctx.lineTo(cx - 12 * u, g + 1 * u); ctx.moveTo(cx + 9 * u, g - 1 * u); ctx.lineTo(cx + 12 * u, g + 1 * u); ctx.stroke();
        ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, g - 20 * u); ctx.lineTo(cx, g - 31 * u); ctx.moveTo(cx, g - 20 * u); ctx.lineTo(cx - 6 * u, g - 23 * u); ctx.stroke();
        ctx.strokeStyle = C.red; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(cx, g - 20 * u); ctx.lineTo(cx - 5 * u, g - 30 * u); ctx.stroke();
      }
      ctx.restore();
    };

    let last = performance.now();
    const frame = (now) => {
      if (!el.isConnected) return;
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (S.run && !S.paused) {
        S.t += dt; S.speed = Math.min(720, 330 + S.t * 9); const v = S.speed * U;
        S.dist += S.speed * dt / 10;
        S.vy -= 1900 * dt; S.y = Math.max(0, S.y + S.vy * dt); if (S.y === 0 && S.vy < 0) S.vy = 0;
        S.nextObs -= dt; S.nextCup -= dt;
        if (S.nextObs <= 0) {
          S.obs.push(make(W + 10));
          S.nextObs = Math.max(0.75, 1.6 - S.t * 0.012) + Math.random() * 0.9;
        }
        // кофе не ставим вплотную к препятствиям: до и после нужен свободный разбег
        const near = (x) => S.obs.some((o) => x > o.x - 170 * U && x < o.x + o.w + 220 * U);
        if (S.nextObs <= 0.35 && S.cups.some((c) => c.x > W - 200 * U)) S.nextObs = 0.35;
        if (S.nextCup <= 0 && near(W + 10)) S.nextCup = 0.15;
        else if (S.nextCup <= 0) { S.cups.push({ x: W + 10, y: ground - (Math.random() < 0.5 ? 26 : 92) * U }); S.nextCup = 2 + Math.random() * 2.5; }
        S.obs.forEach((o) => { o.x -= v * dt; }); S.cups.forEach((c) => { c.x -= v * dt; });
        S.obs = S.obs.filter((o) => o.x + o.w > -10); S.cups = S.cups.filter((c) => c.x > -20 && !c.got);
        S.clouds.forEach((c) => { c.x -= v * 0.15 * dt; if (c.x < -60 * U) c.x = W + 40 * U; });
        // столкновения: прощающие рамки
        const gx = 70 * U; const gy = ground - S.y * U;
        const gb = { l: gx - 16 * U, r: gx + 24 * U, t: gy - 40 * U, b: gy - 4 * U };
        for (const o of S.obs) {
          if (gb.r > o.x + 4 * U && gb.l < o.x + o.w - 4 * U && gb.b > ground - o.h + 3 * U) { S.run = false; S.over = true; S.overAt = now; break; }
        }
        for (const c of S.cups) { if (Math.abs(c.x - gx) < 26 * U && Math.abs(c.y - (gy - 40 * U)) < 44 * U) { c.got = true; S.coffee += 1; S.dist += 25; } }
        if (S.over) {
          const score = Math.floor(S.dist);
          if (score > best) { best = score; try { localStorage.setItem('dz-runner-best', String(best)); } catch (e) { /* без памяти */ } showBest(); }
          syncPause(); msg.hidden = false; msg.querySelector('b').textContent = 'Правки догнали'; msg.querySelector('span').textContent = `${score} очков, кофе: ${S.coffee}`; startBtn.textContent = 'Ещё раз';
        }
      }
      sScore.textContent = String(Math.floor(S.dist)).padStart(5, '0'); sCoffee.textContent = `кофе ${S.coffee}`;
      // кадр
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(31,36,39,.06)';
      S.clouds.forEach((c) => { rr(c.x, c.y, 54 * U, 14 * U, 7 * U); ctx.fill(); });
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, ground + 1); ctx.lineTo(W, ground + 1); ctx.stroke();
      ctx.fillStyle = C.line; for (let i = 0; i < 18; i += 1) { const x = ((i * 97 - S.dist * 10 * U) % (W + 40) + W + 40) % (W + 40) - 20; ctx.fillRect(x, ground + 10 * U + (i % 3) * 6 * U, 10 * U, 1.5); }
      S.cups.forEach((c) => cup(c.x, c.y)); S.obs.forEach(obstacle);
      goose(70 * U, ground - S.y * U, S.run ? S.t : 0, S.y > 1, S.over);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    const onKey = (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.code === 'KeyP') { e.preventDefault(); if (S.paused) resume(); else pause(); return; }
      if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    el.querySelector('.gr__stage').addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; e.preventDefault(); jump(); });
    startBtn.addEventListener('click', () => { if (S.paused) resume(); else reset(); });
    pauseBtn.addEventListener('click', () => { if (S.paused) resume(); else pause(); });
    const onHide = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onHide); addEventListener('blur', pause);
    document.addEventListener('keydown', onKey, true);
    const close = () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('visibilitychange', onHide); removeEventListener('blur', pause); removeEventListener('resize', size); el.classList.remove('is-open'); setTimeout(() => el.remove(), 250); win = null; };
    el.querySelector('[data-gr-close]').addEventListener('click', close);
    el.addEventListener('click', (e) => { if (e.target === el) close(); });
    return { close };
  };

  window.dzRunner = {
    open() {
      if (win) return;
      const el = build(); requestAnimationFrame(() => el.classList.add('is-open'));
      win = game(el); el.querySelector('[data-gr-start]').focus({ preventScroll: true });
    },
  };
})();
