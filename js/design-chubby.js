// Пухлый пиксельный гусь за стоячим столом с ноутбуком. Вариант ?gv=chubby.
// Пиксель-арт в целых пикселях (чёткий на любом экране). Гусь дышит, моргает, иногда клюёт клавиатуру —
// так он печатает: на экране растут строчки, над клавиатурой вспыхивают синие пиксели.
// Курсор слева — гусь оборачивается к нему. Наведёшь — «Чем помочь?», тыкнешь — «Пока работаю» и стучит клювом быстро.
(() => {
  const GV = (new URLSearchParams(window.__dzq || location.search).get('gv') || '').replace(/[^a-z]/g, '');
  if (GV !== 'chubby') return;
  const home = document.querySelector('.dz-scene');
  if (!home) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const GOOSE = ["..............kkkkk.........", ".............kwwwwwk........", "............kwwwwwwwk.......", "............kwwwwewwk.......", "............kwwwwwwwkk......", "............kwwwwwwwoook....", "............kwwwwwwwooOOk...", ".............kwwwwwwkkkk....", ".............kwwwwwk........", "..............kwwwwk........", "..............kwwwwk........", "..............kwwwwwk.......", ".....kk......kwwwwwwk.......", "....kwwk....kwwwwwwwwk......", "....kwwwkkkkwwwwwwwwwwk.....", "....kwwwwwwwwwwwwwwwwwwk....", ".....kwwwwwwwwwwwwwwwwwk....", ".....kwggwwwwwwwwwwwwwwwk...", "....kwgggwwwwwwwwwwwwwwwk...", "....kwgggwwwwwwwwwwwwwwwk...", "....kwwggwwwwwwwwwwwwwwwk...", ".....kwwwwwwwwwwwwwwwwwgk...", ".....kwwwwwwwwwwwwwwwwggk...", "......kwwwwwwwwwwwwwwggk....", ".......kkwwwwwwwwwwggkk.....", ".........kkkkkkkkkkkk.......", "...........yk....yk.........", "..........yyyk..yyyk........"];
  const LAPTOP = [".kkkkkkkkkkkkkk.", ".kSSSSSSSSSSSSk.", ".kSSSSSSSSSSSSk.", ".kSSSSSSSSSSSSk.", ".kSSSSSSSSSSSSk.", ".kSSSSSSSSSSSSk.", ".kkkkkkkkkkkkkk.", "kmmmmmmmmmmmmmmk", "kmnmnmnmnmnmnmmk", ".kkkkkkkkkkkkkk."];
  const PAL = { k: '#1f2427', w: '#ffffff', g: '#d6dce2', o: '#f5b03d', O: '#de8c28', e: '#1f2427', y: '#f5b03d', S: '#dcecff', m: '#cdd2d6', n: '#969ea5', c: '#5aa7f5', C: '#0d99ff', d: '#e2d6c4', D: '#cdbfa9', s: 'rgba(31,36,39,.10)' };
  const AW = 46; const AH = 32;   // холст в пикселях арта
  const GX = 1; const GY = 2;      // где стоит гусь
  const LX = 27; const LY = 0;     // ноутбук

  const cv = document.createElement('canvas'); cv.className = 'vx cg'; cv.width = AW; cv.height = AH; cv.setAttribute('aria-hidden', 'true');
  const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'mg-hit'; hit.setAttribute('aria-label', 'Гусь за ноутбуком. Тыкните — начнёт работать');
  const say = document.createElement('span'); say.className = 'mg-say'; say.setAttribute('aria-hidden', 'true');
  hit.append(say); home.append(cv, hit);
  const ctx = cv.getContext('2d');

  let Z = null;
  const layout = () => {
    const r = home.getBoundingClientRect();
    const phone = innerWidth < 701;
    const folders = home.querySelector('.desktop-folders')?.getBoundingClientRect();
    const intro = home.querySelector('.workspace-intro')?.getBoundingClientRect();
    const dock = document.querySelector('.workspace-dock')?.getBoundingClientRect();
    let zx; let zy; let zw; let zh;
    if (phone) { zy = (folders ? folders.bottom : intro.bottom) - r.top + 16; zx = 12; zw = r.width - 24; zh = (dock ? dock.top - r.top : r.height) - 10 - zy; }
    else { zx = Math.max(folders ? folders.right : 0, intro ? intro.right : 0) - r.left + 40; zw = r.width - zx - 24; zy = 80; zh = (dock ? dock.top - r.top : r.height) - 16 - zy; }
    const s = Math.floor(Math.min(zw / AW, zh / AH, phone ? 6 : 9));
    const show = s >= 3;
    cv.hidden = hit.hidden = !show;
    if (!show) { Z = null; return; }
    const w = AW * s; const h = AH * s;
    const x = Math.round(zx + (zw - w) / 2); const y = Math.round(zy + zh - h);
    Object.assign(cv.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    Object.assign(hit.style, { left: `${x}px`, top: `${y}px`, width: `${w * 0.62}px`, height: `${h}px` });
    Z = { x, y, w, h, s };
  };

  const st = { type: 0, typeWant: 0, burst: 0, rush: 0, over: false, flip: false, lines: [[2], [5], [3]], nextKey: 0, sparks: [], cx: null };
  const now = () => performance.now();
  const showSay = (text) => { say.textContent = text; say.classList.remove('is-on'); void say.offsetWidth; say.classList.add('is-on'); };

  const px = (x, y, c) => { if (!c) return; ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
  const frame = (t) => {
    if (!Z) { requestAnimationFrame(frame); return; }
    const still = reduce.matches;
    if (!still) {
      if (t > st.burst) { st.burst = t + 2200 + Math.random() * 3200; st.typeWant = st.typeWant ? 0 : 1; }
    }
    const typing = !still && (t < st.rush || (!st.over && st.typeWant));
    const fast = t < st.rush;
    // клюёт: голова вниз-вправо на пиксель, ритм зависит от скорости
    const peck = typing && Math.floor(t / (fast ? 110 : 320)) % 2 === 1;
    if (peck && t > st.nextKey) {
      st.nextKey = t + (fast ? 110 : 320);
      const cur = st.lines[st.lines.length - 1];
      if (cur[0] < 9) cur[0] += 1; else { st.lines.push([1]); if (st.lines.length > 4) st.lines.shift(); }
      st.sparks.push({ x: LX + 3 + Math.floor(Math.random() * 10), y: LY + 6, t });
      if (st.sparks.length > 8) st.sparks.shift();
    }
    const breathe = !still && Math.floor(t / 750) % 2 === 1;
    const blink = (t % 3800) < 140;
    // гусь оборачивается к курсору, если тот слева
    st.flip = !fast && st.cx !== null && st.cx < Z.x + Z.s * (GX + 10);

    ctx.clearRect(0, 0, AW, AH);
    // тень на полу
    for (let x = GX + 7; x < LX + 16; x++) px(x, AH - 1, PAL.s);
    // стол: столешница под ноутбуком и ножки
    for (let x = LX - 1; x < LX + 18; x++) { px(x, LY + 10, PAL.d); px(x, LY + 11, PAL.D); }
    for (let y = LY + 12; y < AH - 1; y++) { px(LX, y, PAL.D); px(LX + 16, y, PAL.D); }
    // ноутбук и строки на экране
    LAPTOP.forEach((row, y) => [...row].forEach((c, x) => px(LX + x, LY + y, PAL[c])));
    st.lines.forEach(([n], i) => { for (let j = 0; j < n; j++) px(LX + 3 + j + (i % 2), LY + 2 + i, i === st.lines.length - 1 && j === n - 1 && typing ? PAL.C : PAL.c); });
    // искры над клавиатурой
    for (const p of st.sparks) { const age = (t - p.t) / 500; if (age < 1) px(p.x, p.y - 1 - Math.floor(age * 3), `rgba(13,153,255,${1 - age})`); }
    // гусь
    const H = 12;   // строки головы и шеи, которые клюют
    GOOSE.forEach((row, y) => [...row].forEach((c, x0) => {
      let ch = c; if (ch === 'e' && blink) ch = 'w';
      const head = y < H; const feet = y >= GOOSE.length - 2;
      const dy = (head && peck ? 1 : 0) + (!feet && breathe ? 1 : 0);
      const dx = head && peck ? 1 : 0;
      let x = x0 + dx; if (st.flip) x = GOOSE[0].length - 1 - x0 + (head && peck ? -1 : 0);
      px(GX + x, GY + y + dy, PAL[ch]);
    }));
    requestAnimationFrame(frame);
  };
  layout(); requestAnimationFrame(frame);

  hit.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; st.over = true; if (now() > st.rush) showSay('Чем помочь?'); });
  hit.addEventListener('pointerleave', () => { st.over = false; });
  hit.addEventListener('click', () => { st.rush = now() + 2600; showSay('Пока работаю'); });
  home.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') st.cx = e.clientX - home.getBoundingClientRect().left; });
  home.addEventListener('pointerleave', () => { st.cx = null; });
  addEventListener('resize', layout);
  setTimeout(layout, 600);
})();
