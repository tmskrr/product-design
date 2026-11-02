window.abInit = (root) => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = [];
  const type = (el) => {
    if (!el) return;
    const text = el.dataset.text || el.textContent; el.dataset.text = text;
    if (reduce) { el.textContent = text; return; }
    let i = 0; el.textContent = ''; el.classList.add('is-typing');
    const step = () => { i += 1; el.textContent = text.slice(0, i); if (i < text.length) timers.push(setTimeout(step, 38)); else timers.push(setTimeout(() => el.classList.remove('is-typing'), 900)); };
    timers.push(setTimeout(step, 380));
  };
  root.querySelectorAll('[data-sheets]').forEach((box) => {
    const panels = [...box.querySelectorAll('[data-sheet]')];
    const buttons = [...box.querySelectorAll('[data-sheet-tab]')];
    let current = panels.find((p) => !p.hidden);
    const show = (id, focus) => {
      const next = panels.find((p) => p.id === id);
      if (!next || next === current) return;
      const prev = current; current = next;
      buttons.forEach((b) => { const on = b.getAttribute('aria-controls') === id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      next.hidden = false;
      if (prev) {
        if (reduce) prev.hidden = true;
        else { prev.classList.add('is-leaving'); setTimeout(() => { prev.classList.remove('is-leaving'); prev.hidden = true; }, 500); }
      }
      type(next.querySelector('[data-type]'));
      if (focus) { const b = next.querySelector(`[aria-controls="${id}"][data-sheet-tab]`) || buttons.find((x) => x.getAttribute('aria-controls') === id); b && b.focus(); }
    };
    buttons.forEach((b) => {
      b.addEventListener('click', () => show(b.getAttribute('aria-controls')));
      b.addEventListener('keydown', (e) => {
        const ids = panels.map((p) => p.id); const i = ids.indexOf(current.id);
        const j = { ArrowRight: (i + 1) % ids.length, ArrowLeft: (i - 1 + ids.length) % ids.length, Home: 0, End: ids.length - 1 }[e.key];
        if (j !== undefined) { e.preventDefault(); show(ids[j], true); }
      });
    });
    type(current && current.querySelector('[data-type]'));
  });
  // B: оглавление подсвечивает раздел листа, который сейчас на экране
  root.querySelectorAll('[data-toc]').forEach((toc) => {
    const links = [...toc.querySelectorAll('a')];
    const parts = links.map((a) => root.querySelector(a.getAttribute('href')));
    const scroller = document.querySelector('[data-win-scroll]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) links.forEach((a, k) => a.toggleAttribute('aria-current', parts[k] === en.target)); });
    }, { root: scroller || null, rootMargin: '-35% 0px -55% 0px' });
    parts.forEach((p) => p && io.observe(p));
    root.querySelectorAll('.ab--b [data-type]').forEach(type);
  });

  // C: одна машинка. Лист уходит в машинку и выходит новый, каретка чуть сдвигается
  const offs = [];
  root.querySelectorAll('[data-machine]').forEach((box) => {
    const fitEl = box.querySelector('[data-fit]');
    const scene = box.querySelector('[data-scene]');
    const sheet = box.querySelector('[data-sheet]');
    const car = box.querySelector('[data-carriage]');
    const d = scene.dataset;
    const W = +d.w, split = +d.split, bodyH = +d.bodyh, Lw = +d.lw, Lh = +d.lh, rod = +d.rod, T0 = +d.top;
    const Hd = JSON.parse(d.hd);
    const paper = box.querySelector('[data-paper]');
    const body = box.querySelector('.abm-body');
    const scroller = box.closest('[data-win-scroll]');
    const labels = [...box.querySelectorAll('[data-sheet-tpl]')].map((t) => t.content.querySelector('[aria-current]').textContent.replace(/^\d+\s*/, ''));
    const mul = (A, B) => A.map((r) => [0, 1, 2].map((c) => r[0] * B[0][c] + r[1] * B[1][c] + r[2] * B[2][c]));
    const css = (M) => `matrix3d(${[M[0][0], M[1][0], 0, M[2][0], M[0][1], M[1][1], 0, M[2][1], 0, 0, 1, 0, M[0][2], M[1][2], 0, M[2][2]].map((v) => +v.toPrecision(7)).join(',')})`;
    const pt = (M, x, y) => { const w = M[2][0] * x + M[2][1] * y + M[2][2]; return [(M[0][0] * x + M[0][1] * y + M[0][2]) / w, (M[1][0] * x + M[1][1] * y + M[1][2]) / w]; };
    // На узком экране машинка целиком, а лист уже и выше: свой локальный размер листа на том же четырёхугольнике
    const MOB_W = 222, MOB_H = 545;
    let mode = ''; let rodY = 0;
    const fit = () => {
      const bw = fitEl.clientWidth;
      if (!bw) return;
      const narrow = bw < 600;
      if ((narrow ? 'n' : 'w') !== mode) {
        mode = narrow ? 'n' : 'w';
        box.classList.toggle('is-narrow', narrow);
        let M = Hd, pw = Lw, ph = Lh, below = Lh - rod + 4, T = T0;
        if (narrow) {
          const s = Lw / MOB_W;
          M = mul(Hd, [[s, 0, 0], [0, s, Lh - MOB_H * s], [0, 0, 1]]);
          pw = MOB_W; ph = MOB_H; below = (Lh - rod) / s + 8;
          T = Math.ceil(-Math.min(pt(M, 0, 0)[1], pt(M, MOB_W, 0)[1])) + 8;
        }
        paper.style.width = `${pw}px`; paper.style.height = `${ph}px`; paper.style.transform = css(M);
        sheet.style.setProperty('--below-rod', `${below.toFixed(1)}px`);
        rodY = narrow ? MOB_H - (Lh - rod) / (Lw / MOB_W) : rod;
        car.style.top = `${T}px`; body.style.top = `${T + split}px`;
        scene.dataset.h = T + split + bodyH; scene.style.height = `${T + split + bodyH}px`;
      }
      const H = +scene.dataset.h;
      let k;
      if (narrow) k = Math.min(1, (bw - 4) / W);
      else {
        const vh = scroller ? scroller.clientHeight : window.innerHeight;
        const top = scroller ? fitEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop : fitEl.getBoundingClientRect().top + window.scrollY;
        k = Math.max(0.7, Math.min(1.1, bw / W, (vh - top - 14) / H));
      }
      const tx = (bw - W * k) / 2;
      fitEl.style.height = `${Math.round(H * k + 10)}px`;
      scene.style.transform = `translate(${tx.toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(fitEl); if (scroller) ro.observe(scroller);
    offs.push(() => ro.disconnect());
    let current = 0; let busy = false; let queued = null; let run = 0;
    const step = box.querySelector('[data-step]');
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    const setY = (y, ms) => { sheet.style.transition = ms ? `transform ${ms}ms cubic-bezier(.3,.7,.3,1)` : 'none'; sheet.style.transform = `translateY(${y}px)`; };
    const setX = (pct, ms) => { step.style.transition = ms ? `transform ${ms}ms cubic-bezier(.25,.8,.3,1)` : 'none'; step.style.transform = `translateX(${pct}%)`; };
    // точка печати: строка, которую видно сразу над прижимной планкой
    const typingY = () => rodY - 5;
    const feedFor = (bottom) => Math.max(0, typingY() - bottom);
    const parts = () => ({ h: sheet.querySelector('[data-typeit]'), rest: sheet.querySelector('[data-rest]') });
    const finishNow = () => {
      run += 1;
      const { h, rest } = parts();
      if (h && h.dataset.full) { h.textContent = h.dataset.full; h.classList.remove('is-typing'); }
      if (rest) rest.style.clipPath = '';
      setY(0, 0); setX(0, 0);
    };
    // печать: заголовок по буквам с шагом каретки, перевод строки, остальное построчно с подачей бумаги
    const print = async () => {
      const id = ++run; const alive = () => id === run;
      const { h, rest } = parts();
      if (!h || reduce) return;
      const full = h.dataset.full || h.textContent; h.dataset.full = full;
      const restH = rest ? rest.scrollHeight : 0;
      h.textContent = '\u200b'; h.classList.add('is-typing');
      if (rest) rest.style.clipPath = 'inset(0 0 100% 0)';
      const lineBottom = () => h.offsetTop + h.offsetHeight;
      let lastH = h.offsetHeight;
      setY(feedFor(lineBottom()), 0);
      await wait(260); if (!alive()) return;
      const chars = [...full]; let col = 0;
      for (let n = 1; n <= chars.length; n += 1) {
        h.textContent = chars.slice(0, n).join('');
        if (h.offsetHeight > lastH) {
          // новая строка: возврат каретки и подача бумаги
          lastH = h.offsetHeight; col = 0;
          setX(0, 160); setY(feedFor(lineBottom()), 140);
          await wait(170); if (!alive()) return;
        } else {
          col += 1; setX(-Math.min(col * 0.07, 3.2), 40);
        }
        await wait(chars[n - 1] === ' ' ? 24 : 17); if (!alive()) return;
      }
      h.classList.remove('is-typing');
      setX(0, 200);
      if (rest && restH) {
        const LH = 21; const top = rest.offsetTop;
        await wait(160); if (!alive()) return;
        for (let y = LH; y < restH + LH; y += LH) {
          const shown = Math.min(y, restH);
          rest.style.clipPath = `inset(0 0 ${restH - shown}px 0)`;
          setY(feedFor(top + shown), 90);
          await wait(70); if (!alive()) return;
        }
        rest.style.clipPath = '';
      }
      await wait(120); if (!alive()) return;
      setY(0, 360);
    };
    // заправка листа: выезжает из машинки до первой строки заголовка
    const insert = async (moveCarriage) => {
      const { h, rest } = parts();
      if (!h.dataset.full) h.dataset.full = h.textContent;
      h.textContent = '\u200b'; if (rest) rest.style.clipPath = 'inset(0 0 100% 0)';
      const y0 = feedFor(h.offsetTop + h.offsetHeight);
      const from = sheet.clientHeight * 1.06;
      setY(y0, 0);
      const inn = sheet.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${y0}px)` }], { duration: 420, easing: 'cubic-bezier(.22,.7,.3,1)' });
      if (moveCarriage) car.animate([{ transform: 'translateX(-.8%)' }, { transform: 'translateX(0)' }], { duration: 420, easing: 'cubic-bezier(.3,.6,.3,1)', fill: 'forwards' });
      await inn.finished.catch(() => {});
    };
    const fill = (i, focus) => {
      sheet.innerHTML = box.querySelector(`[data-sheet-tpl="${i}"]`).innerHTML;
      sheet.setAttribute('aria-label', labels[i]);
      if (focus) { const b = sheet.querySelector('[aria-current]'); b && b.focus({ preventScroll: true }); }
    };
    const go = async (i, focus) => {
      if (i === current) return;
      if (busy) { queued = [i, focus]; return; }
      busy = true; current = i;
      finishNow();
      if (reduce || !sheet.animate) { fill(i, focus); busy = false; return; }
      sheet.style.pointerEvents = 'none';
      const out = sheet.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(106%)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.85,.4)' });
      car.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-.8%)' }], { duration: 300, easing: 'ease-in-out', fill: 'forwards' });
      await out.finished.catch(() => {});
      setY(sheet.clientHeight * 1.06, 0);
      fill(i, focus);
      await insert(true);
      sheet.style.pointerEvents = '';
      busy = false;
      if (queued) { const [q, f] = queued; queued = null; go(q, f); return; }
      print();
    };
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]');
      if (b && sheet.contains(b)) go(+b.dataset.go, document.activeElement === b);
    });
    box.addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-go]');
      if (!b) return;
      const n = labels.length; const j = +b.dataset.go;
      const t = { ArrowRight: (j + 1) % n, ArrowLeft: (j - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (t !== undefined) { e.preventDefault(); sheet.querySelector(`[data-go="${t}"]`).focus(); }
    });
    if (!reduce && sheet.animate) { sheet.style.visibility = 'hidden'; timers.push(setTimeout(async () => { sheet.style.visibility = ''; await insert(false); print(); }, 350)); }
  });
  // C (v3): фронтальная машинка. Заголовок печатается по буквам (клавиши, каретка), текст пропечатывается построчно с подачей бумаги
  root.querySelectorAll('[data-machine2]').forEach((box) => {
    const fitEl = box.querySelector('[data-fit]');
    const scene = box.querySelector('[data-scene]');
    const sheet = box.querySelector('[data-sheet]');
    const car = box.querySelector('[data-carriage]');
    const paper = box.querySelector('[data-paper]');
    const shade = box.querySelector('.abt-shade');
    const measure = box.querySelector('[data-measure]');
    const keyLayer = box.querySelector('[data-keylayer]');
    const navBtns = [...box.querySelectorAll('.abt-nav [data-go]')];
    const tpls = [...box.querySelectorAll('[data-sheet-tpl]')];
    const d = scene.dataset;
    const W = +d.w, H0 = +d.h, rodT = +d.rodt, rodB = +d.rodb, pbot = +d.pbot;
    const KEYS = JSON.parse(d.keys); const [ksw, ksh] = d.ks.split(',').map(Number);
    const scroller = box.closest('[data-win-scroll]');
    const SPR = '/product-design/assets/images/portfolio/tw3-keys.webp';
    let mode = ''; let H = H0;
    // высота листа под самый длинный текст: верх бумаги поднимается над прижимной планкой ровно настолько, сколько нужно
    const layout = () => {
      measure.style.width = `${paper.offsetWidth}px`;
      let need = 0;
      tpls.forEach((t) => {
        measure.innerHTML = t.innerHTML; measure.querySelector('.abt-line').remove();
        need = Math.max(need, measure.offsetHeight);
      });
      measure.textContent = '';
      const ptop = rodT - need - 24; const T = Math.ceil(-ptop + 18);
      paper.style.top = `${ptop}px`; paper.style.height = `${pbot - ptop}px`;
      shade.style.setProperty('--rod', `${rodB - ptop}px`);
      box.querySelectorAll('[data-at]').forEach((el) => { el.style.top = `${T}px`; });
      H = H0 + T; scene.style.height = `${H}px`;
    };
    const fit = () => {
      const bw = fitEl.clientWidth; if (!bw) return;
      const narrow = box.clientWidth < 760;
      if ((narrow ? 'n' : 'w') !== mode) { mode = narrow ? 'n' : 'w'; box.classList.toggle('is-narrow', narrow); layout(); }
      let k = bw / W;
      if (!narrow) {
        const vh = scroller ? scroller.clientHeight : window.innerHeight;
        const top = scroller ? fitEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop : fitEl.getBoundingClientRect().top + window.scrollY;
        k = Math.min(k, (vh - top - 18) / H);
      }
      k = Math.max(0.26, Math.min(1, k));
      fitEl.style.height = `${Math.round(H * k)}px`;
      scene.style.transform = `translate(${((bw - W * k) / 2).toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(box); if (scroller) ro.observe(scroller);
    offs.push(() => ro.disconnect());

    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    const setY = (y, ms) => { sheet.style.transition = ms ? `transform ${ms}ms cubic-bezier(.3,.7,.3,1)` : 'none'; sheet.style.transform = `translateY(${y}px)`; };
    const setX = (px, ms) => { car.style.transition = ms ? `transform ${ms}ms cubic-bezier(.25,.8,.3,1)` : 'none'; car.style.transform = `translateX(${px}px)`; };
    const line = () => sheet.querySelector('.abt-line');
    const typingY = () => { const l = line(); return l.offsetTop + l.offsetHeight; };
    const feedFor = (bottom) => Math.max(0, typingY() - bottom);
    const press = (ch) => {
      let i = KEYS.length - 1;
      if (ch !== ' ') { let h = 0; for (const c of ch.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 997; i = h % (KEYS.length - 1); }
      const [x, y, w, hh, sx, sy] = KEYS[i];
      const el = document.createElement('div'); el.className = 'abt-k';
      el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${hh}px`;
      const pos = `${-sx}px ${-sy}px`; const size = `${ksw}px ${ksh}px`;
      el.innerHTML = `<i class="hole" style="-webkit-mask-image:url(${SPR});mask-image:url(${SPR});-webkit-mask-position:${pos};mask-position:${pos};-webkit-mask-size:${size};mask-size:${size}"></i><i class="cap" style="background-image:url(${SPR});background-position:${pos};background-size:${size}"></i>`;
      keyLayer.appendChild(el);
      timers.push(setTimeout(() => el.remove(), ch === ' ' ? 110 : 85));
    };
    let current = 0; let busy = false; let queued = null; let run = 0; let printing = false;
    const done = new Set();
    const typed = () => [...sheet.querySelectorAll('[data-typeit]')];
    const rest = () => sheet.querySelector('[data-rest]');
    const blank = () => {
      typed().forEach((el) => { if (!el.dataset.full) el.dataset.full = el.textContent; el.textContent = '​'; });
      const r = rest(); if (r) r.style.clipPath = 'inset(0 0 100% 0)';
    };
    const finishNow = () => {
      run += 1; printing = false;
      typed().forEach((el) => { if (el.dataset.full) el.textContent = el.dataset.full; el.classList.remove('is-typing'); });
      const r = rest(); if (r) r.style.clipPath = '';
      keyLayer.textContent = ''; setY(0, 0); setX(0, 0);
      done.add(current);
    };
    const typeEl = async (el, alive) => {
      const full = el.dataset.full || el.textContent; el.dataset.full = full;
      el.textContent = '​'; el.classList.add('is-typing');
      const bottom = () => el.offsetTop + el.offsetHeight;
      setX(0, 180); let shift = 0; setY(feedFor(bottom()), 160);
      await wait(200); if (!alive()) return false;
      let lastH = el.offsetHeight; const chars = [...full];
      for (let n = 1; n <= chars.length; n += 1) {
        el.textContent = chars.slice(0, n).join('');
        if (el.offsetHeight > lastH) {
          // конец строки: возврат каретки и подача листа
          lastH = el.offsetHeight; setX(0, 180); shift = 0; setY(feedFor(bottom()), 160);
          await wait(190); if (!alive()) return false;
        }
        press(chars[n - 1]);
        shift = Math.min(shift + 0.5, 18); setX(-shift, 50);
        await wait(chars[n - 1] === ' ' ? 32 : 24 + Math.random() * 16); if (!alive()) return false;
      }
      el.classList.remove('is-typing');
      return true;
    };
    const print = async () => {
      const id = ++run; const alive = () => id === run;
      if (reduce || done.has(current)) { finishNow(); return; }
      printing = true;
      const [head, tail] = typed();
      if (!(await typeEl(head, alive))) return;
      const r = rest();
      if (r) {
        const h = r.scrollHeight; const top = r.offsetTop; const LH = mode === 'n' ? 58 : 40;
        setX(0, 200);
        for (let y = LH; y < h + LH; y += LH) {
          const shown = Math.min(y, h);
          r.style.clipPath = `inset(0 0 ${h - shown}px 0)`;
          setY(feedFor(top + shown), 90);
          await wait(80); if (!alive()) return;
        }
        r.style.clipPath = '';
      }
      if (!(await typeEl(tail, alive))) return;
      setX(0, 220); setY(0, 220);
      printing = false; done.add(current);
    };
    const insert = async () => {
      blank();
      const first = typed()[0];
      const y0 = feedFor(first.offsetTop + first.offsetHeight);
      setY(y0, 0);
      const inn = sheet.animate([{ transform: `translateY(${paper.clientHeight}px)` }, { transform: `translateY(${y0}px)` }], { duration: 460, easing: 'cubic-bezier(.22,.7,.3,1)' });
      shade.classList.remove('is-off');
      await inn.finished.catch(() => {});
    };
    const fill = (i) => { sheet.innerHTML = tpls[i].innerHTML; };
    const mark = (i) => navBtns.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
    const go = async (i) => {
      if (i === current) return;
      if (busy) { queued = i; return; }
      busy = true; finishNow(); current = i; mark(i);
      if (reduce || !sheet.animate) { fill(i); busy = false; return; }
      // лист уходит в машинку, каретка чуть отъезжает, новый лист заправляется
      shade.classList.add('is-off');
      const out = sheet.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${paper.clientHeight}px)` }], { duration: 380, easing: 'cubic-bezier(.5,0,.85,.4)' });
      setX(-10, 380);
      await out.finished.catch(() => {});
      fill(i);
      setX(0, 420);
      if (done.has(i)) { setY(paper.clientHeight, 0); const inn = sheet.animate([{ transform: `translateY(${paper.clientHeight}px)` }, { transform: 'translateY(0)' }], { duration: 460, easing: 'cubic-bezier(.22,.7,.3,1)' }); setY(0, 0); shade.classList.remove('is-off'); await inn.finished.catch(() => {}); }
      else await insert();
      busy = false;
      if (queued !== null) { const q = queued; queued = null; go(q); return; }
      print();
    };
    navBtns.forEach((b, i) => b.addEventListener('click', () => go(i)));
    box.querySelector('.abt-nav').addEventListener('keydown', (e) => {
      const j = navBtns.indexOf(document.activeElement); if (j < 0) return;
      const t = { ArrowDown: j + 1, ArrowRight: j + 1, ArrowUp: j - 1, ArrowLeft: j - 1 }[e.key];
      if (t !== undefined) { e.preventDefault(); const n = (t + navBtns.length) % navBtns.length; navBtns[n].focus(); go(n); }
    });
    // клик по листу во время печати — сразу допечатать
    paper.addEventListener('click', () => { if (printing) finishNow(); });
    // ?sheet=3 открывает нужный лист
    const q = +(new URLSearchParams(location.search).get('sheet') || 0) - 1;
    if (q > 0 && q < tpls.length) { current = q; fill(q); mark(q); }
    if (!reduce && sheet.animate) {
      sheet.style.visibility = 'hidden';
      timers.push(setTimeout(async () => { sheet.style.visibility = ''; await insert(); print(); }, 380));
    } else finishNow();
  });
  return () => { timers.forEach(clearTimeout); offs.forEach((f) => f()); };
};
