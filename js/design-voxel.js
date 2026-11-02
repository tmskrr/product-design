// Воксельный гусь за компьютером, в духе Minecraft: всё собрано из кубиков в изометрии.
// Включается вариантом ?gv=voxel. Свои кубики рисуем сами на canvas, без библиотек.
// В покое гусь иногда печатает, на мониторе растут строки. Наведёшь — поворачивает голову: «Чем помочь?».
// Тык — отворачивается к экрану и печатает быстро: «Пока работаю». При «уменьшении движения» всё стоит.
(() => {
  const GV = (new URLSearchParams(window.__dzq || location.search).get('gv') || '').replace(/[^a-z]/g, '');
  if (GV !== 'voxel') return;
  const home = document.querySelector('.dz-scene');
  if (!home) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const PAL = {
    goose: '#f5f6f7', gooseSh: '#e3e6e9', wing: '#d4d9dd', beak: '#f39a3a', leg: '#ee8a2c', eye: '#1f2427',
    desk: '#e2d6c4', deskLeg: '#cdbfa9', mon: '#cfd4d8', stand: '#b9bfc4', screen: '#dcecff', code: '#5aa7f5', codeHot: '#0d99ff',
    key: '#bfc5ca', stool: '#c9ced2',
  };
  // свет: верх светлее, грани темнее
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255; return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`; };

  // ---------- модель: кубики (x вперёд-вправо, y вперёд-влево, z вверх). Гусь смотрит в сторону −x, на монитор ----------
  const box = (out, x0, x1, y0, y1, z0, z1, c, tag) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) out.push({ x, y, z, c, tag }); };
  const STATIC = [];
  box(STATIC, 0, 9, 0, 9, 6, 6, PAL.desk);                 // столешница
  for (const [x, y] of [[0, 0], [0, 9], [9, 0], [9, 9]]) box(STATIC, x, x, y, y, 0, 5, PAL.deskLeg);
  box(STATIC, 1, 1, 4, 5, 7, 7, PAL.stand);                // подставка монитора
  box(STATIC, 1, 1, 1, 8, 8, 13, PAL.mon, 'mon');          // монитор, экран смотрит в +x
  box(STATIC, 4, 5, 2, 7, 7, 7, PAL.key);                  // клавиатура
  box(STATIC, 11, 14, 2, 6, 4, 4, PAL.stool);              // стул
  box(STATIC, 12, 12, 4, 4, 0, 3, PAL.stool);
  // гусь: тело на стуле
  const BODY = [];
  box(BODY, 10, 15, 2, 6, 5, 8, PAL.goose);
  box(BODY, 11, 14, 2, 6, 9, 9, PAL.goose);
  box(BODY, 16, 16, 3, 5, 7, 9, PAL.goose);                // хвост
  box(BODY, 17, 17, 4, 4, 9, 10, PAL.goose);
  box(BODY, 9, 10, 3, 5, 9, 13, PAL.goose);                // шея
  box(BODY, 9, 9, 3, 5, 6, 8, PAL.gooseSh);                // грудь
  box(BODY, 9, 9, 3, 3, 3, 4, PAL.leg); box(BODY, 9, 9, 5, 5, 3, 4, PAL.leg);   // лапы свисают со стула
  box(BODY, 8, 8, 3, 3, 3, 3, PAL.leg); box(BODY, 8, 8, 5, 5, 3, 3, PAL.leg);
  const WING = []; box(WING, 10, 14, 7, 7, 6, 8, PAL.wing); box(WING, 8, 9, 7, 7, 7, 7, PAL.wing);
  // голова: смотрит в монитор (−x) или на нас (+y)
  const HEAD_A = []; box(HEAD_A, 8, 10, 3, 5, 14, 16, PAL.goose); box(HEAD_A, 6, 7, 3, 5, 14, 15, PAL.beak);
  HEAD_A.push({ x: 9, y: 5, z: 15, c: PAL.goose, eye: 'y' });
  const HEAD_B = []; box(HEAD_B, 8, 10, 3, 5, 14, 16, PAL.goose); box(HEAD_B, 8, 10, 6, 7, 14, 15, PAL.beak);
  HEAD_B.push({ x: 10, y: 4, z: 15, c: PAL.goose, eye: 'x' });

  // ---------- холст и размеры ----------
  const cv = document.createElement('canvas'); cv.className = 'vx'; cv.setAttribute('aria-hidden', 'true');
  const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'mg-hit'; hit.setAttribute('aria-label', 'Гусь за компьютером. Тыкните — начнёт работать');
  const say = document.createElement('span'); say.className = 'mg-say'; say.setAttribute('aria-hidden', 'true');
  hit.append(say); home.append(cv, hit);
  const ctx = cv.getContext('2d');
  // проекция: камера со стороны +x +y +z, видны верх, грань +x и грань +y
  const proj = (x, y, z) => [(x - y) * 0.866, (x + y) * 0.5 - z];
  // рамка сцены в единицах проекции
  let minX = 1e9; let maxX = -1e9; let minY = 1e9; let maxY = -1e9;
  for (const v of [...STATIC, ...BODY, ...WING, ...HEAD_A, ...HEAD_B]) for (const [dx, dy, dz] of [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 1, 1], [1, 0, 1], [0, 1, 1]]) { const [px, py] = proj(v.x + dx, v.y + dy, v.z + dz); minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); }
  minX -= 0.6; maxX += 0.6; minY -= 1; maxY += 0.6;   // запас под покачивание и тень
  let Z = null;
  const layout = () => {
    const r = home.getBoundingClientRect();
    const phone = innerWidth < 701;
    const folders = home.querySelector('.desktop-folders')?.getBoundingClientRect();
    const intro = home.querySelector('.workspace-intro')?.getBoundingClientRect();
    const dock = document.querySelector('.workspace-dock')?.getBoundingClientRect();
    let zx; let zy; let zw; let zh;
    if (phone) { zy = (folders ? folders.bottom : intro.bottom) - r.top + 16; zx = 12; zw = r.width - 24; zh = (dock ? dock.top - r.top : r.height) - 10 - zy; }
    else { zx = Math.max(folders ? folders.right : 0, intro ? intro.right : 0) - r.left + 40; zw = r.width - zx - 24; zy = 70; zh = (dock ? dock.top - r.top : r.height) - 14 - zy; }
    const sw = maxX - minX; const sh = maxY - minY;
    const s = Math.min(zw / sw, zh / sh, phone ? 16 : 22);
    const show = s >= 6;
    cv.hidden = hit.hidden = !show;
    if (!show) { Z = null; return; }
    const w = sw * s; const h = sh * s;
    const x = zx + (zw - w) / 2; const y = zy + (zh - h);
    const dpr = Math.min(2, devicePixelRatio || 1);
    Object.assign(cv.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    Object.assign(hit.style, { left: `${x + w * 0.35}px`, top: `${y}px`, width: `${w * 0.65}px`, height: `${h}px` });
    Z = { s, dpr, w, h };
  };

  // ---------- состояние ----------
  const st = { type: 0, typeWant: 0, burst: 0, rush: 0, look: 0, over: false, lines: [[3], [1], [4]], nextLine: 0, beat: 0 };
  const now = () => performance.now();
  const showSay = (text) => { say.textContent = text; say.classList.remove('is-on'); void say.offsetWidth; say.classList.add('is-on'); };

  const drawCube = (v, ox, oy, oz) => {
    const x = v.x + ox; const y = v.y + oy; const z = v.z + oz; const s = Z.s;
    const P = (a, b, c) => { const [px, py] = proj(a, b, c); return [(px - minX) * s, (py - minY) * s]; };
    const face = (pts, fill) => { ctx.fillStyle = fill; ctx.strokeStyle = fill; ctx.lineWidth = 0.6; ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fill(); ctx.stroke(); };
    if (!v.hide?.z) face([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], shade(v.c, 1));
    if (!v.hide?.x) face([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], v.fx || shade(v.c, 0.86));
    if (!v.hide?.y) face([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], v.fy || shade(v.c, 0.74));
    // глаз — квадрат поменьше на грани
    if (v.eye === 'y') { ctx.fillStyle = PAL.eye; const a = P(x + 0.25, y + 1, z + 0.25); const b = P(x + 0.75, y + 1, z + 0.25); const c = P(x + 0.75, y + 1, z + 0.75); const d = P(x + 0.25, y + 1, z + 0.75); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.fill(); }
    if (v.eye === 'x') { ctx.fillStyle = PAL.eye; const a = P(x + 1, y + 0.25, z + 0.25); const b = P(x + 1, y + 0.75, z + 0.25); const c = P(x + 1, y + 0.75, z + 0.75); const d = P(x + 1, y + 0.25, z + 0.75); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.fill(); }
  };

  let last = now();
  const frame = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!Z) { requestAnimationFrame(frame); return; }
    const still = reduce.matches;
    if (!still) {
      if (t > st.burst) { st.burst = t + 2500 + Math.random() * 3500; st.typeWant = st.typeWant > 0 ? 0 : 0.4; }
      const typing = t < st.rush ? 1 : (st.over ? 0 : st.typeWant);
      st.type += (typing - st.type) * Math.min(1, dt * 6);
      if (st.type > 0.25 && t > st.nextLine) {
        st.nextLine = t + (st.type > 0.6 ? 120 : 480);
        const cur = st.lines[st.lines.length - 1];
        if (cur[0] < 6) cur[0] += 1; else { st.lines.push([1]); if (st.lines.length > 4) st.lines.shift(); }
      }
    }
    st.look += ((st.over && t > st.rush ? 1 : 0) - st.look) * Math.min(1, dt * 8);

    // собираем кадр
    const list = [];
    const add = (arr, ox = 0, oy = 0, oz = 0) => { for (const v of arr) list.push({ v, ox, oy, oz }); };
    // экран: грань +x монитора, строки кода
    const scr = STATIC.filter((v) => v.tag === 'mon').map((v) => {
      const inside = v.y >= 2 && v.y <= 7 && v.z >= 9 && v.z <= 12;
      if (!inside) return v;
      const row = 12 - v.z; const col = v.y - 2; const line = st.lines[row];
      const lit = line && col < line[0];
      const hot = lit && row === st.lines.length - 1 && col === line[0] - 1 && st.type > 0.3;
      return { ...v, fx: hot ? PAL.codeHot : lit ? PAL.code : PAL.screen };
    });
    add(STATIC.filter((v) => v.tag !== 'mon')); add(scr);
    const bob = still ? 0 : Math.sin(t / 1300) * 0.06 + (st.type > 0.5 ? Math.sin(t / 70) * 0.05 : 0);
    add(BODY, 0, 0, bob);
    const tap = st.type * (0.5 + 0.5 * Math.sin(t / (st.type > 0.6 ? 55 : 170)));
    add(WING, -tap * 0.35, 0, bob + tap * 0.35);
    add(st.look > 0.5 ? HEAD_B : HEAD_A, 0, 0, bob + (st.type > 0.6 ? Math.sin(t / 90) * 0.06 : 0));
    // скрытые грани: соседний кубик того же «тела» закрывает
    const key = (x, y, z) => `${x},${y},${z}`;
    const occ = new Set(list.map(({ v, ox, oy, oz }) => (ox || oy || oz ? '' : key(v.x, v.y, v.z))));
    for (const it of list) {
      const { v } = it;
      if (it.ox || it.oy || it.oz) { it.hide = null; continue; }
      it.hide = { z: occ.has(key(v.x, v.y, v.z + 1)), x: occ.has(key(v.x + 1, v.y, v.z)), y: occ.has(key(v.x, v.y + 1, v.z)) };
    }
    list.sort((a, b) => (a.v.x + a.ox + a.v.y + a.oy + a.v.z + a.oz) - (b.v.x + b.ox + b.v.y + b.oy + b.v.z + b.oz) || (a.v.z - b.v.z));
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(Z.dpr, 0, 0, Z.dpr, 0, 0);
    // мягкая тень на холсте под столом и стулом
    const [sx, sy] = proj(9, 6, 0); const g = ctx.createRadialGradient((sx - minX) * Z.s, (sy - minY) * Z.s, 0, (sx - minX) * Z.s, (sy - minY) * Z.s, Z.w * 0.5);
    g.addColorStop(0, 'rgba(31,36,39,.10)'); g.addColorStop(1, 'rgba(31,36,39,0)');
    ctx.save(); ctx.translate((sx - minX) * Z.s, (sy - minY) * Z.s); ctx.scale(1, 0.5); ctx.translate(-(sx - minX) * Z.s, -(sy - minY) * Z.s); ctx.fillStyle = g; ctx.fillRect(0, 0, Z.w, Z.h * 2); ctx.restore();
    for (const it of list) drawCube({ ...it.v, hide: it.hide }, it.ox, it.oy, it.oz);
    requestAnimationFrame(frame);
  };
  layout(); requestAnimationFrame(frame);

  hit.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; st.over = true; if (now() > st.rush) showSay('Чем помочь?'); });
  hit.addEventListener('pointerleave', () => { st.over = false; });
  hit.addEventListener('click', () => { st.rush = now() + 2600; st.look = 0; showSay('Пока работаю'); });
  addEventListener('resize', layout);
  setTimeout(layout, 600);
})();
