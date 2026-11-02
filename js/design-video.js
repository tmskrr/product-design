// Гусь-видео на главной (вариант ?gv=video). Ролик из Kling с вырезанным фоном, ромашки взяты из исходной картинки.
// В каждом mp4 сверху цвет, снизу маска прозрачности; WebGL склеивает их, поэтому гусь стоит на любом цвете фона.
// Сценарий: гусь сидит неподвижно. Тык — оживает и печатает: «Пока работаю».
// Ещё тык — поднимает голову и оборачивается: «Шо такое?». Оба ролика начинаются и заканчиваются
// одним и тем же кадром (концы сглажены при сборке), поэтому переключение без рывков и без двоения.
(() => {
  const GV = (new URLSearchParams(window.__dzq || location.search).get('gv') || 'video').replace(/[^a-z]/g, '');
  if (GV !== 'video') return;   // видео — вариант по умолчанию
  const home = document.querySelector('.dz-scene');
  if (!home) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = '/product-design/assets/video/';
  const V = '?v=6';
  // фон как у холста: светлая бумага в точку и вариант потемнее
  const THEMES = { paper: '#f4f4f2', graphite: '#c2bfb7' };
  const NAMES = { paper: 'светлый', graphite: 'потемнее' };
  const W = 1100; const H = 1020;
  const CLIPS = {
    type: { src: 'goose-type2.mp4', say: 'Пока работаю', from: 0.4, to: 6.6 },
    turn: { src: 'goose-turn2.mp4', say: 'Шо такое?', from: 1.5, to: 3.3 },
  };
  // третий тык — «Ты пока поиграй, а я поработаю» и окно мини-игры (design-runner.js)
  const play = () => { bubble('Ты пока поиграй, а я поработаю', 1700); setTimeout(() => window.dzRunner && window.dzRunner.open(), 1100); };

  home.classList.add('dz-video');
  const stage = document.createElement('div'); stage.className = 'gv-stage';
  const poster = new Image(); poster.className = 'gv-poster'; poster.alt = ''; poster.src = `${BASE}goose-poster2.webp${V}`;
  const cv = document.createElement('canvas'); cv.className = 'gv-layer'; cv.width = W; cv.height = H;
  const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'gv-hit'; hit.setAttribute('aria-label', 'Гусь за компьютером. Тыкните');
  const say = document.createElement('span'); say.className = 'mg-say'; say.setAttribute('aria-live', 'polite');
  // ромашки — отдельный слой поверх видео, их всё время чуть покачивает ветерок (в видео их нет)
  const daisies = new Image(); daisies.className = 'gv-daisies'; daisies.alt = ''; daisies.src = `${BASE}goose-daisies.webp${V}`;
  const notes = document.createElement('div'); notes.className = 'gv-notes'; notes.setAttribute('aria-hidden', 'true');
  hit.append(say); stage.append(poster, daisies, notes, hit); home.append(stage);

  const sw = document.createElement('div'); sw.className = 'dz-themes'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Цвет фона');
  sw.innerHTML = Object.entries(THEMES).map(([n, c]) => `<button type="button" data-theme="${n}" style="--c:${c}" aria-label="Фон: ${NAMES[n]}" aria-pressed="false"></button>`).join('');
  home.append(sw);
  const apply = (name) => {
    home.style.backgroundColor = THEMES[name];
    document.documentElement.style.setProperty('--dz-bg', THEMES[name]);   // шапка в тон фону, без холодной полосы
    sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === name)));
    try { localStorage.setItem('dz-theme', name); } catch (e) { /* без памяти */ }
  };
  let theme = 'paper'; try { const s = localStorage.getItem('dz-theme'); if (THEMES[s]) theme = s; } catch (e) { /* без памяти */ }
  sw.addEventListener('click', (e) => { const b = e.target.closest('[data-theme]'); if (b) apply(b.dataset.theme); });
  apply(theme);

  const layout = () => {
    const r = home.getBoundingClientRect();
    const phone = innerWidth < 701;
    const folders = home.querySelector('.desktop-folders')?.getBoundingClientRect();
    const intro = home.querySelector('.workspace-intro')?.getBoundingClientRect();
    const dock = document.querySelector('.workspace-dock')?.getBoundingClientRect();
    const bottom = (dock ? dock.top - r.top : r.height) - (phone ? 4 : 0);
    let w; let h; let x; let y;
    if (phone) {
      const top = (folders ? folders.bottom : intro.bottom) - r.top + 8;
      h = Math.max(0, bottom - top); w = Math.min(r.width, h * W / H, (W / (window.devicePixelRatio || 1)) * 1.1); h = w * H / W; x = r.width - w;
      // на высоких экранах гусь не прилипает ко дну: лишнее место делится, больше снизу
      y = top + Math.max(0, bottom - top - h) * 0.3;
    } else {
      // гусь стоит внизу справа, размер не больше исходника, чтобы не мылилось
      const left = Math.max(folders ? folders.right : 0, intro ? intro.right : 0) - r.left + 40;
      const crisp = (W / (window.devicePixelRatio || 1)) * 1.1;
      w = Math.min(r.width - left, (r.height - 40) * W / H, crisp, 760); h = w * H / W;
      x = r.width - w - Math.max(0, (r.width - left - w) * 0.25); y = r.height - h;
      if (dock && x < dock.right - r.left && y + h > dock.top - r.top) { y = dock.top - r.top - 8 - h; }
    }
    Object.assign(stage.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    stage.hidden = w < 160;
    sw.style.top = phone ? `${y + 6}px` : '';
  };
  layout(); addEventListener('resize', layout); setTimeout(layout, 500);

  let clicks = 0;
  const bubble = (text, ms) => { say.textContent = text; say.classList.add('is-shown'); clearTimeout(bubble.t); bubble.t = setTimeout(() => say.classList.remove('is-shown'), ms); };
  // подсказка, что гусь живой: пока его ни разу не тыкнули, он сам зовёт — через секунду и ещё два раза с паузой
  let hinted = 0;
  const hint = () => { if (clicks || hinted >= 3 || document.hidden) return; hinted += 1; bubble('Тыкни', 2600); hit.classList.add('is-calling'); setTimeout(() => hit.classList.remove('is-calling'), 2600); if (hinted < 3) setTimeout(hint, 9000); };
  setTimeout(hint, 1000);
  hit.addEventListener('pointerenter', () => { if (!clicks) bubble('Тыкни', 1800); });
  // если полминуты на странице ничего не происходит, из наушников поднимаются ноты: гусь слушает музыку
  let idleT = 0; let noteT = 0;
  const note = () => {
    if (document.hidden || stage.hidden) return;
    const n = document.createElement('span'); n.textContent = ['♪', '♫', '♪', '♬'][Math.floor(Math.random() * 4)];
    n.style.setProperty('--dx', `${Math.round(Math.random() * 50 - 10)}px`); n.style.setProperty('--rot', `${Math.round(Math.random() * 30 - 15)}deg`);
    notes.append(n); setTimeout(() => n.remove(), 3400);
  };
  const awake = () => { clearInterval(noteT); noteT = 0; clearTimeout(idleT); if (!reduce) idleT = setTimeout(() => { note(); noteT = setInterval(note, 1500); }, 30000); };
  ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach((e) => addEventListener(e, awake, { passive: true }));
  awake();
  const gl = reduce ? null : cv.getContext('webgl', { premultipliedAlpha: true, alpha: true });
  // без движения или без WebGL: гусь стоит, облачко всё равно отвечает
  if (!gl) { hit.addEventListener('click', () => { clicks += 1; const n = clicks % 3; if (n === 0) play(); else bubble(n === 1 ? CLIPS.type.say : CLIPS.turn.say, 1800); }); return; }

  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 v;void main(){v=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 v;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(v.x,v.y*.5)).rgb;float m=texture2D(t,vec2(v.x,v.y*.5+.5)).r;gl_FragColor=vec4(c*m,m);}'));
  gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, gl.CLAMP_TO_EDGE));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const videos = {};
  for (const [name, c] of Object.entries(CLIPS)) {
    const v = document.createElement('video');
    Object.assign(v, { src: BASE + c.src + V, muted: true, playsInline: true, preload: 'auto' });
    v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    videos[name] = v;
  }
  let cur = null; let shown = false;
  const paint = (v) => {
    if (v.readyState < 2) return;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!shown) { shown = true; stage.insertBefore(cv, hit); poster.remove(); }
  };

  const playClip = (name) => {
    const v = videos[name];
    if (cur && cur !== v) cur.pause();
    cur = v; v.currentTime = 0;
    v.play().catch(() => bubble(CLIPS[name].say, 1800));
  };
  const loop = () => {
    if (cur && !cur.paused && !cur.ended) {
      paint(cur);
      const c = CLIPS[cur === videos.type ? 'type' : 'turn']; const t = cur.currentTime;
      if (t > c.from && t < c.to) { if (say.textContent !== c.say) say.textContent = c.say; say.classList.add('is-shown'); } else say.classList.remove('is-shown');
    } else if (cur && cur.ended) say.classList.remove('is-shown');
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  // тык: первый — печатает, второй — оборачивается, третий — зовёт играть; дальше по кругу
  hit.addEventListener('click', () => { clicks += 1; const n = clicks % 3; if (n === 0) { if (cur) cur.pause(); play(); } else playClip(n === 1 ? 'type' : 'turn'); });
})();
