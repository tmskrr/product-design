// Оживление фото-гуся на главной (варианты ?gv=blue и др., класс .dz-photo ставит design-goose.js).
// Поверх кадра: живой экран монитора (макет собирается сам, бегает курсор), ноты из наушников,
// пар над кружкой. Тык по монитору открывает «Проекты», по наушникам — «Музыку».
// Координаты точек заданы в пикселях исходного кадра и пересчитываются под то, как фон лёг на экран.
(() => {
  const home = document.querySelector('.dz-scene.dz-photo');
  if (!home || home.classList.contains('dz-photo--pair')) return;   // новые кадры-пары оживляет design-goose.js
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SCENES = {
    blue: { w: 1672, h: 941, screen: [[1041, 197], [1318, 199], [1342, 424], [1062, 433]], phones: [1468, 220], mug: [1063, 472] },
  };
  const key = [...home.classList].find((c) => c.startsWith('dz-photo--'))?.slice(10);
  const S = SCENES[key];
  if (!S) return;

  // ---------- слои ----------
  const screen = document.createElement('a');
  screen.className = 'gp-screen'; screen.href = '/product-design/projects/'; screen.setAttribute('aria-label', 'Открыть проекты');
  screen.innerHTML = `
    <div class="gp-ui">
      <div class="gp-ui__bar"><i></i><i></i><i></i><span></span></div>
      <div class="gp-ui__side"><b></b><b></b><b></b><b></b><b></b></div>
      <div class="gp-ui__canvas">
        <div class="gp-f gp-f--1"><i></i><i></i><i></i></div>
        <div class="gp-f gp-f--2"><i></i><i></i></div>
        <div class="gp-f gp-f--3"><i></i><em></em></div>
      </div>
      <span class="gp-cursor"></span>
    </div>`;
  const phones = document.createElement('a');
  phones.className = 'gp-phones'; phones.href = '/product-design/music/'; phones.setAttribute('aria-label', 'Открыть музыку');
  const notes = document.createElement('div'); notes.className = 'gp-notes'; notes.setAttribute('aria-hidden', 'true');
  const steam = document.createElement('div'); steam.className = 'gp-steam'; steam.setAttribute('aria-hidden', 'true');
  steam.innerHTML = '<svg viewBox="0 0 30 50" preserveAspectRatio="none"><path d="M12 48 C 6 38, 18 30, 12 18 S 10 6, 15 1"/><path d="M19 48 C 24 38, 13 31, 19 20 S 21 8, 17 3"/></svg>';
  home.append(steam, notes, screen, phones);
  // клики открывают разделы как папки на столе
  const openSection = (name) => (e) => { e.preventDefault(); home.querySelector(`.desktop-folder[data-open-window="${name}"]`)?.click(); };
  screen.addEventListener('click', openSection('projects'));
  phones.addEventListener('click', openSection('music'));

  // ---------- где лёг фон: тот же расчёт, что у background-size/position ----------
  const map = () => {
    const r = home.getBoundingClientRect();
    const cs = getComputedStyle(home);
    const [px, py] = cs.backgroundPosition.split(' ').map((v) => parseFloat(v) / 100);
    const size = cs.backgroundSize;
    let k;
    if (size === 'cover') k = Math.max(r.width / S.w, r.height / S.h);
    else { const hh = parseFloat(size.split(' ')[1]); k = (r.height * hh / 100) / S.h; }
    const ox = (r.width - S.w * k) * px; const oy = (r.height - S.h * k) * py;
    return (x, y) => [ox + x * k, oy + y * k, k];
  };

  // матрица перспективы: прямоугольник w×h → четырёхугольник экрана
  const matrix3d = (w, h, q) => {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2; const dx2 = x3 - x2; const dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2; const dy2 = y3 - y2; const dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den; const hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1; const b = x3 - x0 + hh * x3; const c = x0;
    const d = y1 - y0 + g * y1; const e = y3 - y0 + hh * y3; const f = y0;
    // масштаб из w×h в единичный квадрат
    const A = a / w; const B = b / h; const D = d / w; const E = e / h; const G = g / w; const H = hh / h;
    return `matrix3d(${A},${D},0,${G},${B},${E},0,${H},0,0,1,0,${c},${f},0,1)`;
  };

  const place = () => {
    const P = map();
    const W = 320; const H = 240;
    const q = S.screen.map(([x, y]) => P(x, y));
    screen.style.width = `${W}px`; screen.style.height = `${H}px`;
    screen.style.transform = matrix3d(W, H, q);
    const [hx, hy, k] = P(...S.phones);
    Object.assign(phones.style, { left: `${hx - 70 * k}px`, top: `${hy - 70 * k}px`, width: `${140 * k}px`, height: `${140 * k}px` });
    Object.assign(notes.style, { left: `${hx}px`, top: `${hy}px` });
    const [mx, my] = P(...S.mug);
    Object.assign(steam.style, { left: `${mx - 14 * k}px`, top: `${my - 60 * k}px`, width: `${28 * k}px`, height: `${56 * k}px` });
    home.style.setProperty('--gp-k', k);
  };
  place();
  addEventListener('resize', place);
  setTimeout(place, 500);

  // ---------- ноты из наушников ----------
  if (!reduce.matches) {
    const glyphs = ['♪', '♫', '♪', '♬'];
    setInterval(() => {
      if (document.hidden) return;
      const n = document.createElement('span');
      n.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      n.style.setProperty('--dx', `${(Math.random() * 40 + 20).toFixed(0)}px`);
      n.style.setProperty('--rot', `${(Math.random() * 30 - 15).toFixed(0)}deg`);
      notes.append(n);
      setTimeout(() => n.remove(), 3200);
    }, 1400);
  }
})();
