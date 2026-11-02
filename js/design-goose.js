// Живой холст рабочего стола и гусь из его же точек.
// Сетка точек на столе — это и есть материал: возле курсора точки мягко набухают и темнеют, как лупа над растром,
// а справа от текста и папок в той же сетке сидит за компьютером гусь. Иногда неспешно печатает, моргает.
// Наведёшь — поворачивается: «Чем помочь?». Тыкнешь — отворачивается к экрану и активно печатает: «Пока работаю»,
// по экрану бегут строки, от монитора по сетке расходится волна. При «уменьшении движения» всё стоит, волны нет.
(() => {
  const home = document.querySelector('.dz-scene');
  if (!home) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // варианты для сравнения: ?gv=outline (монитор контуром, по умолчанию), ?gv=laptop (ноутбук на столе), ?gv=lap (ноутбук на коленях, без стола)
  const GV = (new URLSearchParams(window.__dzq || location.search).get('gv') || 'video').replace(/[^a-z]/g, '');
  if (GV === 'voxel' || GV === 'chubby' || GV === 'video') return;   // эти варианты рисуют design-voxel.js и design-chubby.js
  // фото-варианты: гусь в наушниках, сгенерированный кадр как у коровы на редактуре.
  // Темы — тот же кадр в другом цвете фона, переключаются кружками на столе и запоминаются.
  const PHOTOS = { studio: 'goose-photo-studio.webp', meadow: 'goose-photo-meadow.webp' };
  const THEMES = { blue: '#bbd4ee', butter: '#f1e7a9', lilac: '#e2b9f2', pink: '#f0b4ca', blueberry: '#8fa8d4', lemon: '#e8e383' };
  if (PHOTOS[GV]) { home.classList.add('dz-photo', `dz-photo--${GV}`); home.style.setProperty('--dz-photo', `url(/product-design/assets/images/portfolio/${PHOTOS[GV]})`); return; }
  if (THEMES[GV] || GV === 'photo') {
    // кадры парами: гусь смотрит в экран (screen) и тот же кадр, где он повернулся к нам (look)
    const T2 = { blue: '#c1dbf9', butter: '#fbedb9', lilac: '#e4c3f3', lemon: '#eee794', blueberry: '#8ea6d0' };
    const src = (n, k) => `/product-design/assets/images/portfolio/goose-${n}-${k}.webp`;
    let theme = T2[GV] ? GV : 'blue';
    try { const saved = localStorage.getItem('dz-theme'); if (GV === 'photo' && T2[saved]) theme = saved; } catch (e) { /* без памяти */ }
    home.classList.add('dz-photo', 'dz-photo--pair');
    const look = document.createElement('div'); look.className = 'dz-look'; look.setAttribute('aria-hidden', 'true');
    const type = document.createElement('div'); type.className = 'dz-look dz-type'; type.setAttribute('aria-hidden', 'true');
    const head = document.createElement('button'); head.type = 'button'; head.className = 'dz-head'; head.setAttribute('aria-label', 'Гусь');
    const bubble = document.createElement('span'); bubble.className = 'mg-say'; bubble.setAttribute('aria-hidden', 'true'); head.append(bubble);
    home.prepend(type, look); home.append(head);
    const sw = document.createElement('div'); sw.className = 'dz-themes'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Цвет фона');
    const NAMES = { blue: 'голубой', butter: 'сливочный', lilac: 'сиреневый', lemon: 'лимонный', blueberry: 'черничный' };
    sw.innerHTML = Object.entries(T2).map(([n, c]) => `<button type="button" data-theme="${n}" style="--c:${c}" aria-label="Фон: ${NAMES[n]}" aria-pressed="false"></button>`).join('');
    home.append(sw);
    const apply = (name) => {
      theme = name;
      home.style.setProperty('--dz-photo', `url(${src(name, 'screen')})`);
      look.style.backgroundImage = `url(${src(name, 'look')})`;
      type.style.backgroundImage = `url(${src(name, 'type')})`;
      home.style.backgroundColor = T2[name]; home.style.setProperty('--dz-bg', T2[name]);
      sw.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.theme === name)));
      try { localStorage.setItem('dz-theme', name); } catch (e) { /* без памяти */ }
    };
    sw.addEventListener('click', (e) => { const x = e.target.closest('[data-theme]'); if (x) apply(x.dataset.theme); });
    apply(theme);
    setTimeout(() => Object.keys(T2).forEach((n) => ['screen', 'look', 'type'].forEach((k) => { const i = new Image(); i.src = src(n, k); })), 1500);
    // поворот головы: на наведение, на тык и иногда сам — мельком глянуть на посетителя
    const reduceM = matchMedia('(prefers-reduced-motion: reduce)');
    const say = (t) => { bubble.textContent = t; bubble.classList.remove('is-on'); void bubble.offsetWidth; bubble.classList.add('is-on'); };
    let hover = false; let peek = 0;
    const turn = (on) => look.classList.toggle('is-on', on);
    head.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; hover = true; turn(true); say('Чем помочь?'); });
    head.addEventListener('pointerleave', () => { hover = false; turn(false); });
    const typing = (on) => type.classList.toggle('is-on', on);
    head.addEventListener('click', () => { turn(false); typing(true); say('Пока работаю'); clearTimeout(peek); peek = setTimeout(() => { typing(false); turn(hover); }, 2600); });
    // сам по себе: то печатает, то мельком оглядывается
    if (!reduceM.matches) setInterval(() => {
      if (hover || document.hidden || type.classList.contains('is-on')) return;
      if (Math.random() < 0.55) { typing(true); setTimeout(() => typing(false), 2200 + Math.random() * 1800); }
      else { turn(true); setTimeout(() => { if (!hover) turn(false); }, 1600); }
    }, 6000);
    // голова в кадре: x 1290–1530, y 140–340 из 1670×941
    const placeHead = () => {
      const r = home.getBoundingClientRect(); const cs = getComputedStyle(home);
      const [px, py] = cs.backgroundPosition.split(' ').map((v) => parseFloat(v) / 100);
      const size = cs.backgroundSize; let k;
      if (size === 'cover') k = Math.max(r.width / 1670, r.height / 941); else k = (r.height * parseFloat(size.split(' ')[1]) / 100) / 941;
      const ox = (r.width - 1670 * k) * px; const oy = (r.height - 941 * k) * py;
      Object.assign(head.style, { left: `${ox + 1290 * k}px`, top: `${oy + 140 * k}px`, width: `${240 * k}px`, height: `${200 * k}px` });
    };
    placeHead(); addEventListener('resize', placeHead); setTimeout(placeHead, 500);
    return;
  }
  const COL = { body: [225, 228, 230], shade: [170, 176, 180], wing: [140, 147, 152], beak: [242, 140, 40], leg: [236, 128, 36], eye: [20, 22, 24] };

  const cv = document.createElement('canvas'); cv.className = 'mg'; cv.setAttribute('aria-hidden', 'true');
  const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'mg-hit'; hit.setAttribute('aria-label', 'Гусь за компьютером. Тыкните — начнёт работать');
  const say = document.createElement('span'); say.className = 'mg-say'; say.setAttribute('aria-hidden', 'true'); say.textContent = 'Га!';
  hit.append(say); home.prepend(cv); home.append(hit);
  const ctx = cv.getContext('2d');
  const mask = document.createElement('canvas'); const mctx = mask.getContext('2d', { willReadFrequently: true });

  // ---------- размеры: холст на весь стол, гусь в своей зоне ----------
  let Z = null;
  const layout = () => {
    const r = home.getBoundingClientRect();
    const phone = innerWidth < 701;
    const folders = home.querySelector('.desktop-folders')?.getBoundingClientRect();
    const intro = home.querySelector('.workspace-intro')?.getBoundingClientRect();
    const dock = document.querySelector('.workspace-dock')?.getBoundingClientRect();
    let zx; let zy; let zw; let zh;
    if (phone) {
      zy = (folders ? folders.bottom : intro.bottom) - r.top + 14; zx = 0; zw = r.width;
      zh = (dock ? dock.top - r.top : r.height) - 6 - zy;
    } else {
      zx = Math.max(folders ? folders.right : 0, intro ? intro.right : 0) - r.left + 40; zw = r.width - zx;
      zy = 60; zh = (dock ? dock.top - r.top : r.height) - 8 - zy;
    }
    const L = phone ? Math.min(zw * 0.54, zh * 0.86) : Math.min(zw * 0.54, zh * 0.78, 380);
    const T = Math.round(Math.min(12, Math.max(7, L / 30)));   // шаг сетки: гусь всегда примерно в 30 точек длиной, фон в CSS с тем же шагом   // сцена шириной ~1.7 L
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    cv.style.width = `${r.width}px`; cv.style.height = `${r.height}px`;
    home.style.setProperty('--mg-t', `${T}px`);
    const goose = zw >= 200 && zh >= 140;
    hit.hidden = !goose;
    Z = { W: r.width, H: r.height, T, dpr, zx, zy, zw, zh, L, goose, ground: zy + zh - (phone ? 8 : 20) };
  };

  // ---------- сцена гладкими фигурами: гусь сидит за компьютером (единица — размер L, пол на y=0) ----------
  // монитор справа, гусь слева смотрит в экран. type — насколько активно печатает (0..1), look — повернулся к нам
  const drawScene = (g, s) => {
    const { t, type, look, honk, eyeR, lines, sparks } = s;
    const C = (c) => `rgb(${c})`;
    const SOFT = [205, 210, 214]; const LINE = [150, 158, 165]; const ACC = [90, 170, 255];
    const lap = GV === 'lap';
    // искры набора: синие точки поднимаются над клавиатурой и тают (для ноутбуков)
    const drawSparks = () => { for (const p of sparks) { const age = (t - p.t) / 900; if (age > 1) continue; g.fillStyle = `rgba(${ACC},${1 - age})`; g.beginPath(); g.arc(p.x, p.y - age * 0.16, 0.028, 0, Math.PI * 2); g.fill(); } };
    if (GV === 'outline') {
      g.fillStyle = C(SOFT); g.fillRect(0.22, -0.5, 0.95, 0.03); g.fillRect(0.3, -0.47, 0.025, 0.47); g.fillRect(1.08, -0.47, 0.025, 0.47);
      g.fillRect(0.88, -0.6, 0.035, 0.1); g.fillRect(0.82, -0.53, 0.16, 0.025);
      g.strokeStyle = C(LINE); g.lineWidth = 0.03; g.strokeRect(0.68, -1.0, 0.44, 0.4);   // монитор только контуром
      lines.forEach(([w, ind], i) => { g.fillStyle = C(i === lines.length - 1 ? ACC : SOFT); g.fillRect(0.73 + ind * 0.04, -0.94 + i * 0.065, w * 0.9, 0.03); });
      g.fillStyle = C(SOFT); g.fillRect(0.42, -0.535, 0.22, 0.03);
      g.fillRect(-0.18, -0.26, 0.34, 0.03); g.fillRect(-0.03, -0.23, 0.025, 0.23); g.fillRect(-0.12, -0.02, 0.21, 0.02);
    } else if (GV === 'laptop') {
      g.fillStyle = C(SOFT); g.fillRect(0.22, -0.5, 0.95, 0.045); g.fillRect(0.3, -0.46, 0.04, 0.46); g.fillRect(1.06, -0.46, 0.04, 0.46);
      g.fillStyle = C(LINE); g.fillRect(0.44, -0.55, 0.38, 0.05);   // корпус ноутбука
      g.save(); g.translate(0.82, -0.53); g.rotate(-1.9); g.fillRect(0, -0.025, 0.36, 0.05); g.restore();   // крышка, видна сбоку
      drawSparks();
      g.fillStyle = C(SOFT); g.fillRect(-0.18, -0.26, 0.34, 0.03); g.fillRect(-0.03, -0.23, 0.025, 0.23); g.fillRect(-0.12, -0.02, 0.21, 0.02);
    }
    if (lap) g.translate(0, 0.2);   // сидит на земле, а не на стуле
    // гусь: тело на стуле
    const bob = Math.sin(t / 1300) * 0.006 + (type > 0.5 ? Math.sin(t / 60) * 0.006 : 0);
    g.save(); g.translate(0, -0.25 + bob); g.scale(1.22, 1.22); g.translate(0, 0.25);   // гусь крупнее стола
    g.fillStyle = C(COL.body);
    g.beginPath(); g.moveTo(-0.24, -0.38); g.quadraticCurveTo(-0.42, -0.5, -0.44, -0.46); g.quadraticCurveTo(-0.38, -0.36, -0.28, -0.29); g.closePath(); g.fill();   // хвост
    g.beginPath(); g.ellipse(0.02, -0.38, 0.27, 0.15, -0.1, 0, Math.PI * 2); g.fill();
    g.fillStyle = C(COL.shade); g.beginPath(); g.ellipse(0.04, -0.3, 0.2, 0.05, -0.08, 0, Math.PI); g.fill();
    // лапы: свисают со стула или поджаты, если сидит на земле
    g.strokeStyle = C(COL.leg); g.lineCap = 'round'; g.lineWidth = 0.03;
    if (lap) { g.beginPath(); g.moveTo(0.1, -0.24); g.lineTo(0.2, -0.22); g.stroke(); }
    else { g.beginPath(); g.moveTo(0.02, -0.25); g.lineTo(0.06, -0.12); g.lineTo(0.11, -0.12); g.stroke(); }
    // ноутбук на коленях: корпус на животе, крышка смотрит на гуся
    if (lap) {
      g.fillStyle = C(LINE); g.fillRect(0.1, -0.36, 0.38, 0.05);
      g.save(); g.translate(0.48, -0.34); g.rotate(-1.95); g.fillRect(0, -0.025, 0.34, 0.05); g.restore();
      drawSparks();
    }
    // крыло тянется к клавиатуре и стучит
    const tap = type * (0.5 + 0.5 * Math.sin(t / (type > 0.5 ? 45 : 160)));
    g.save(); g.translate(0.1, -0.42); g.rotate(0.28 - tap * 0.12);
    g.fillStyle = C(COL.wing); g.beginPath(); g.ellipse(0.17, 0.02, 0.22, 0.06, 0.12, 0, Math.PI * 2); g.fill();
    g.restore();
    // шея и голова: к экрану или к нам
    g.save(); g.translate(0.2, -0.46);
    const lean = look * -0.55 + (type > 0.5 ? 0.12 : 0.05) + Math.sin(t / 1700) * 0.02;
    g.rotate(lean);
    g.strokeStyle = C(COL.body); g.lineWidth = 0.11; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0.07, -0.15, 0.04, -0.3); g.stroke();
    g.translate(0.06, -0.33);
    const fx = 1 - 2 * look;   // голова поворачивается к нам
    g.scale(Math.abs(fx) < 0.15 ? 0.15 * Math.sign(fx || 1) : fx, 1);
    g.fillStyle = C(COL.body); g.beginPath(); g.ellipse(0, 0, 0.095, 0.072, 0.12, 0, Math.PI * 2); g.fill();
    g.fillStyle = C(COL.beak);
    if (honk) { g.beginPath(); g.moveTo(0.07, -0.03); g.lineTo(0.22, -0.08); g.lineTo(0.09, 0.01); g.closePath(); g.fill(); g.beginPath(); g.moveTo(0.07, 0.02); g.lineTo(0.2, 0.06); g.lineTo(0.08, 0.04); g.closePath(); g.fill(); }
    else { g.beginPath(); g.moveTo(0.07, -0.03); g.lineTo(0.22, 0.01); g.lineTo(0.07, 0.04); g.closePath(); g.fill(); }
    g.fillStyle = C(COL.eye); g.beginPath(); g.arc(0.025, -0.02, eyeR, 0, Math.PI * 2); g.fill();
    g.restore();
    g.restore();
  };

  // ---------- состояние ----------
  const PHRASE_HOVER = 'Чем помочь?'; const PHRASE_WORK = 'Пока работаю';
  const st = { x: 0, type: 0, typeWant: 0, look: 0, burst: 0, rush: 0, honk: 0, lines: [], nextLine: 0, said: 0, sparks: [] };
  const cur = { x: -9999, y: -9999, on: false, k: 0, over: false };
  const waves = [];
  const now = () => performance.now();
  layout(); st.x = Z.zx + Z.zw * 0.36;
  const showSay = (text) => { say.textContent = text; say.classList.remove('is-on'); void say.offsetWidth; say.classList.add('is-on'); };

  let last = now();
  const frame = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!Z) { requestAnimationFrame(frame); return; }
    const { T, dpr, L } = Z;
    const still = reduce.matches;
    if (Z.goose) {
      st.x = Z.zx + (Z.zw - L * 1.74) / 2 + L * 0.56;   // сцена от -0.56L до 1.18L, по центру зоны
      // печатает сам: короткие спокойные заходы; после тыка — быстро и долго
      if (t > st.burst) { st.burst = t + 2500 + Math.random() * 4000; st.typeWant = st.typeWant > 0 ? 0 : 0.35; }
      const typing = t < st.rush ? 1 : (cur.over ? 0 : st.typeWant);
      st.type += (typing - st.type) * Math.min(1, dt * 5);
      // курсор над гусем: поворачивается к нам
      const lookWant = cur.over && t > st.rush ? 1 : 0;
      st.look += (lookWant - st.look) * Math.min(1, dt * 4);
      if (still) { st.type = 0; }
      // строки на экране растут, пока печатает, экран потом «листается»
      if (!still && st.type > 0.2 && t > st.nextLine) {
        st.nextLine = t + (st.type > 0.6 ? 90 : 420);
        if (st.lines.length >= 5) st.lines.shift();
        st.lines.push([0.08 + Math.random() * 0.26, Math.floor(Math.random() * 3)]);
        // искры над клавиатурой (координаты сцены; для ноутбука на коленях — над животом)
        st.sparks.push(GV === 'lap' ? { x: 0.16 + Math.random() * 0.26, y: -0.44, t } : { x: 0.48 + Math.random() * 0.3, y: -0.6, t });
        if (st.sparks.length > 14) st.sparks.shift();
      }
    }
    cur.k += ((cur.on ? 1 : 0) - cur.k) * Math.min(1, dt * 6);

    // ---------- маска гуся в масштабе сетки ----------
    const cols = Math.ceil(Z.W / T); const rows = Math.ceil(Z.H / T);
    let gx0 = 0; let gy0 = 0; let gw = 0; let gh = 0; let px = null;
    if (Z.goose) {
      gx0 = Math.max(0, Math.floor((st.x - L * 0.62) / T)); gy0 = Math.max(0, Math.floor((Z.ground - L * 1.08) / T));
      gw = Math.min(cols - gx0, Math.ceil((L * 1.86) / T)); gh = Math.min(rows - gy0, Math.ceil((L * 1.1) / T) + 2);
      if (mask.width !== gw || mask.height !== gh) { mask.width = gw; mask.height = gh; }
      mctx.clearRect(0, 0, gw, gh); mctx.save();
      mctx.translate(st.x / T - gx0 - 0.5, Z.ground / T - gy0 - 0.5);
      const sc = L / T; mctx.scale(sc, sc);
      drawScene(mctx, { t, type: st.type, look: st.look, honk: t < st.honk, eyeR: Math.max(0.02, (T * 0.55) / L), lines: st.lines, sparks: st.sparks });
      mctx.restore();
      // моргание: глаз пропадает на пару кадров
      px = mctx.getImageData(0, 0, gw, gh).data;
    }
    const blink = (t % 4200) < 120;

    // ---------- рисуем только точки, которые отличаются от фона ----------
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R0 = 1;   // базовая точка фона (как в CSS)
    const maxR = T * 0.38;
    const dot = (cx, cy, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); };
    // волны «Га!»
    for (let i = waves.length - 1; i >= 0; i--) { if (t - waves[i].t > 1800) waves.splice(i, 1); }
    const waveAt = (x, y) => {
      let v = 0;
      for (const w of waves) {
        const age = (t - w.t) / 1000; const R = age * 520; const d = Math.hypot(x - w.x, y - w.y);
        const band = Math.exp(-((d - R) ** 2) / (2 * 26 * 26));
        v += band * Math.max(0, 1 - age / 1.8);
      }
      return Math.min(1, v);
    };
    // область, где что-то происходит
    const boxes = [];
    if (waves.length) boxes.push([0, 0, cols, rows]);
    else {
      if (cur.k > 0.02) boxes.push([Math.floor((cur.x - 160) / T), Math.floor((cur.y - 160) / T), Math.ceil(320 / T) + 1, Math.ceil(320 / T) + 1]);
      if (Z.goose) boxes.push([gx0, gy0, gw, gh]);
    }
    const seen = new Set();
    for (const [bx, by, bw, bh] of boxes) {
      for (let yy = Math.max(0, by); yy < Math.min(rows, by + bh); yy++) {
        for (let xx = Math.max(0, bx); xx < Math.min(cols, bx + bw); xx++) {
          const key = yy * cols + xx; if (seen.has(key)) continue; seen.add(key);
          const cx = xx * T + T / 2; const cy = yy * T + T / 2;
          let a = 0; let warm = false; let dark = false; let blue = false; let tone = 0;
          if (px && xx >= gx0 && yy >= gy0 && xx < gx0 + gw && yy < gy0 + gh) {
            const i = ((yy - gy0) * gw + (xx - gx0)) * 4; a = px[i + 3] / 255;
            if (a > 0.04) { const r = px[i] / a; const b = px[i + 2] / a; warm = r > 200 && b < 120; dark = r < 60 && b < 60; blue = b > 200 && r < 140; tone = (255 - (r + px[i + 1] / a + b) / 3) / 255; if (dark && blink) { dark = false; tone = 0.12; } }
          }
          const c = cur.k * Math.exp(-((cx - cur.x) ** 2 + (cy - cur.y) ** 2) / (2 * 70 * 70));
          const w = still ? 0 : waveAt(cx, cy);
          if (a > 0.04) {
            const r = Math.max(R0, maxR * Math.sqrt(a)) * (1 + w * 0.35 + c * 0.15);
            const col = blue ? `rgba(13,153,255,${0.95 * a})` : warm ? `rgba(232,120,40,${0.9 * a})` : dark ? `rgba(31,36,39,${a})` : `rgba(31,36,39,${(0.16 + tone * 0.5) * a + w * 0.15})`;
            dot(cx, cy, r, col);
          } else if (c > 0.03 || w > 0.03) {
            const k = Math.min(1, c + w);
            dot(cx, cy, R0 + k * T * 0.2, `rgba(31,36,39,${0.12 + k * 0.22})`);
          }
        }
      }
    }
    // кнопка поверх гуся
    if (Z.goose) { hit.style.left = `${st.x - L * 0.48}px`; hit.style.top = `${Z.ground - L * 1.06}px`; hit.style.width = `${L * 1.66}px`; hit.style.height = `${L * 1.06}px`; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // наведение — поворачивается: «Чем помочь?»; тык — отворачивается к экрану и активно печатает: «Пока работаю»
  hit.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; cur.over = true; if (now() > st.rush) showSay(PHRASE_HOVER); });
  hit.addEventListener('pointerleave', () => { cur.over = false; });
  hit.addEventListener('click', () => {
    const t = now();
    st.rush = t + 2600; st.look = Math.min(st.look, 0.6);
    showSay(PHRASE_WORK);
    if (!reduce.matches) waves.push({ x: st.x + Z.L * 0.9, y: Z.ground - Z.L * 0.8, t });   // волна идёт от экрана
  });
  home.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = home.getBoundingClientRect(); cur.x = e.clientX - r.left; cur.y = e.clientY - r.top; cur.on = true;
  });
  home.addEventListener('pointerleave', () => { cur.on = false; });
  addEventListener('resize', layout);
  setTimeout(layout, 600);
})();
