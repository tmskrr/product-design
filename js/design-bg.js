// Фон за гусём, вариант ?bg=pixel: облако из точек той же сетки, что фон страницы.
// Точки растут и сжимаются по медленному шуму, облако «дышит» и плывёт. Гусь сидит в его плотной нижней части.
(() => {
  const BG = (new URLSearchParams(window.__dzq || location.search).get('bg') || 'sky').replace(/[^a-z]/g, '');
  const FC = (new URLSearchParams(window.__dzq || location.search).get('fc') || 'butter').replace(/[^a-z]/g, '');
  document.documentElement.dataset.fc = FC;   // папки: жёлтые, «Проекты» розовые; ?fc= — превью других
  const home = document.querySelector('.dz-scene.dz-video');
  if (!home) return;
  // ?bg=sky: небо-фотография, а полоса облаков из того же кадра (вырезана по яркости) лежит поверх низа гуся,
  // поэтому ножки стола и стула уходят в облака
  if (BG === 'sky') {
    home.classList.add('dz-bg-sky');
    const fg = document.createElement('div'); fg.className = 'gv-fg'; fg.setAttribute('aria-hidden', 'true');
    (home.querySelector('.gv-stage') || home).append(fg);   // облака привязаны к гусю, а не к кадру: на любом экране закрывают только ножки
    // день и ночь: кнопка в шапке, выбор запоминается, без выбора — как в системе
    const root = document.documentElement;
    const ICON = {
      moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
      sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    };
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dz-daynight';
    const status = document.querySelector('.site-nav .system-status');
    if (status) status.after(btn); else home.append(btn);   // крайняя справа, после даты
    const set = (night, save) => {
      root.classList.toggle('dz-night', night);
      root.style.setProperty('--dz-bg', night ? '#101b4a' : '#cfe1fb');
      btn.innerHTML = night ? ICON.sun : ICON.moon;
      btn.setAttribute('aria-label', night ? 'Включить день' : 'Включить ночь');
      btn.setAttribute('aria-pressed', String(night));
      if (save) { try { localStorage.setItem('dz-sky', night ? 'night' : 'day'); } catch (e) { /* без памяти */ } }
    };
    let saved = null; try { saved = localStorage.getItem('dz-sky'); } catch (e) { /* без памяти */ }
    set(saved ? saved === 'night' : matchMedia('(prefers-color-scheme: dark)').matches, false);
    btn.addEventListener('click', () => set(!root.classList.contains('dz-night'), true));
    // ночью первый тык по гусю роняет звезду: один раз за визит, дальше гусь просто работает
    let fell = false;
    const star = () => {
      const r = home.getBoundingClientRect();
      const el = document.createElement('i'); el.className = 'dz-star'; el.setAttribute('aria-hidden', 'true'); home.append(el);
      const x = r.width * (0.62 + Math.random() * 0.12); const y = r.height * (0.08 + Math.random() * 0.06);
      const dx = -Math.min(420, r.width * 0.32); const dy = Math.abs(dx) * 0.5; const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      el.animate([
        { transform: `rotate(${ang}deg) translateX(0) scaleX(.2)`, opacity: 0 },
        { transform: `rotate(${ang}deg) translateX(${Math.hypot(dx, dy) * 0.25}px) scaleX(1)`, opacity: 1, offset: 0.2 },
        { transform: `rotate(${ang}deg) translateX(${Math.hypot(dx, dy)}px) scaleX(.6)`, opacity: 0 },
      ], { duration: 1300, easing: 'cubic-bezier(.3,.1,.6,1)' }).onfinish = () => el.remove();
    };
    home.querySelector('.gv-hit')?.addEventListener('click', () => {
      if (fell || !root.classList.contains('dz-night') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      fell = true; star();
    });
    return;
  }
  if (BG !== 'pixel') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  home.classList.add('dz-bg-pixel');
  const cv = document.createElement('canvas'); cv.className = 'gv-bg'; cv.setAttribute('aria-hidden', 'true');
  home.prepend(cv);
  const ctx = cv.getContext('2d');
  const STEP = 12;

  // гладкий шум: значения в узлах решётки, сглаженная интерполяция, две октавы
  const P = new Uint8Array(512); { const a = [...Array(256).keys()]; for (let i = 255; i > 0; i -= 1) { const j = (i * 7919 + 13) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } for (let i = 0; i < 512; i += 1) P[i] = a[i & 255]; }
  const val = (x, y) => P[(P[x & 255] + y) & 255] / 255;
  const sm = (t) => t * t * (3 - 2 * t);
  const n2 = (x, y) => { const xi = Math.floor(x); const yi = Math.floor(y); const xf = sm(x - xi); const yf = sm(y - yi);
    const a = val(xi, yi); const b = val(xi + 1, yi); const c = val(xi, yi + 1); const d = val(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
  const noise = (x, y) => n2(x, y) * 0.65 + n2(x * 2.1 + 7.3, y * 2.1 - 3.1) * 0.35;

  let W = 0; let H = 0; let dpr = 1;
  const size = () => { const r = home.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
  size(); addEventListener('resize', size);

  // точки фона страницы стоят в центрах клеток 12×12 (radial-gradient), облако растёт из них же:
  // серая точка плавно увеличивается и окрашивается, поэтому двух сеток поверх друг друга нет
  const LILAC = { paper: [176, 150, 232], graphite: [150, 120, 220] };
  const rgb = (c) => (c.match(/\d+(\.\d+)?/g) || [244, 244, 242]).slice(0, 3).map(Number);
  const draw = (t) => {
    const r = home.getBoundingClientRect();
    const st = home.querySelector('.gv-stage')?.getBoundingClientRect();
    if (!st || !st.width) return;
    const bg = rgb(getComputedStyle(home).backgroundColor);
    const grey = bg.map((v, i) => Math.round(v * 0.88 + [31, 36, 39][i] * 0.12));   // как rgba(31,36,39,.12) поверх фона
    let theme = 'paper'; try { theme = localStorage.getItem('dz-theme') === 'graphite' ? 'graphite' : 'paper'; } catch (e) { /* без памяти */ }
    const li = LILAC[theme];
    const cx = st.left - r.left + st.width * 0.5; const cy = st.top - r.top + st.height * 0.42;
    const rx = Math.max(st.width * 1.05, 280); const ry = st.height * 0.72;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const x0 = Math.max(0, Math.floor((cx - rx * 1.4) / STEP)); const x1 = Math.ceil(Math.min(W, cx + rx * 1.4) / STEP);
    const y0 = Math.max(0, Math.floor((cy - ry * 1.5) / STEP)); const y1 = Math.ceil(H / STEP);
    const bgc = `rgb(${bg})`;
    // текст, папки, переключатель и док — запретные зоны: возле них облако плавно сходит на нет
    const keep = ['.workspace-intro', '.desktop-folders', '.dz-themes', '.workspace-dock'].map((q) => document.querySelector(q)?.getBoundingClientRect())
      .filter((b) => b && b.width).map((b) => ({ l: b.left - r.left - 14, t: b.top - r.top - 14, r: b.right - r.left + 14, b: b.bottom - r.top + 14 }));
    const away = (x, y) => { let m = 1; for (const k of keep) { const ddx = Math.max(k.l - x, 0, x - k.r); const ddy = Math.max(k.t - y, 0, y - k.b); m = Math.min(m, Math.hypot(ddx, ddy) / 46); } return m; };
    const small = W < 701;
    for (let gy = y0; gy <= y1; gy += 1) {
      for (let gx = x0; gx <= x1; gx += 1) {
        const x = gx * STEP + STEP / 2; const y = gy * STEP + STEP / 2;
        const dx = (x - cx) / rx; let dy = (y - cy) / ry; if (dy > 0) dy *= 0.45;   // книзу облако не кончается, а густеет
        const d = Math.sqrt(dx * dx + dy * dy);
        const edge = (noise(x / 190 + t * 0.16, y / 190 - t * 0.09) - 0.5) * 0.9;        // край дышит и плывёт
        let f = 1 - (d - 0.2) / (0.8 + edge); if (f <= 0) continue;
        const wave = 0.5 + 0.5 * Math.sin((x * 0.8 + y) / 85 - t * 1.1);                 // мягкая волна по точкам
        f = Math.min(1, f * 1.5) * (0.3 + 0.45 * sm(noise(x / 90 - t * 0.3, y / 90 + t * 0.18)) + 0.25 * wave);
        f *= sm(Math.min(1, away(x, y))); if (small) f *= 0.8;
        if (f < 0.02) continue;
        ctx.fillStyle = bgc; ctx.fillRect(x - 2.5, y - 2.5, 5, 5);                       // убираем серую точку под новой
        const k = Math.min(1, f * 2.2);
        ctx.fillStyle = `rgb(${grey.map((v, i) => Math.round(v + (li[i] - v) * k))})`;
        ctx.beginPath(); ctx.arc(x, y, 1.1 + f * 3.7, 0, Math.PI * 2); ctx.fill();
      }
    }
  };
  let last = 0;
  const loop = (now) => { if (!document.hidden && now - last > 40) { last = now; draw(now / 1000); } if (!reduce) requestAnimationFrame(loop); };
  requestAnimationFrame(loop); setTimeout(() => draw(0), 600);
})();
