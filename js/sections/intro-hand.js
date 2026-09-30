/* Hand-drawn notes over the intro paragraph — clean vector strokes traced from 연서's Procreate sketch.
   Three groups, each shown while its keyword is hovered:
     insight  — the two "사람들의 …" lines blank out and "( INSIGHT )" takes their place
     visual   — a box around 비주얼 언어, a bracket to the left with FASHION / CONTENTS
     design   — a box around 설계, a line to the right with USING AI
   Every piece is placed from the live text rects, so it follows language and viewport.
   Sizes are the sketch's own proportions at the reference layout (1440 wide, 27px type). */

const REF_FONT = 27;
/* drawing boxes in reference px (the sketch's proportions) */
const SIZE = {
  parenL: { w: 51, h: 79 }, parenR: { w: 31, h: 91.5 }, insight: { w: 205.5, h: 51.5 },
  armLeft: { w: 439.5, h: 148.5 }, boxVisual: { w: 195.5, h: 73.5 }, boxDesign: { w: 108.5, h: 66 }, armRight: { w: 392, h: 43.5 },
};
/* clickable words inside the arm drawings, relative to the drawing's top-left (reference px) */
const HOT = {
  fashion: { x: 9, y: 9.5, w: 154, h: 30 },
  contents: { x: 7, y: 111.5, w: 182, h: 32 },
  usingai: { x: 176, y: 9, w: 209, h: 30 },
};

/* single-stroke capitals in a 10 × 14 box — the block letters of the sketch */
const GLYPH = {
  A: 'M0 14 L5 0 L10 14 M2.2 9.2 L7.8 9.2',
  C: 'M9.6 3.4 C8.4 0.4 0.6 -0.6 0.6 7 C0.6 14.6 8.4 13.6 9.6 10.6',
  E: 'M9 0 L0 0 L0 14 L9 14 M0 7 L7 7',
  F: 'M9 0 L0 0 L0 14 M0 7 L6.8 7',
  G: 'M9.6 3.4 C8.4 0.4 0.6 -0.6 0.6 7 C0.6 14.6 8.6 13.8 9.6 10.4 L9.6 7.4 L5.4 7.4',
  H: 'M0 0 L0 14 M10 0 L10 14 M0 7 L10 7',
  I: 'M1 0 L9 0 M5 0 L5 14 M1 14 L9 14',
  N: 'M0 14 L0 0 L10 14 L10 0',
  O: 'M5 0 C-1.6 0 -1.6 14 5 14 C11.6 14 11.6 0 5 0',
  S: 'M9.4 3 C8.2 -0.6 0.8 -0.4 0.8 3.6 C0.8 7.4 9.2 6.6 9.2 10.6 C9.2 14.6 1.4 14.4 0.6 10.8',
  T: 'M0 0 L10 0 M5 0 L5 14',
  U: 'M0 0 L0 9.4 C0 15.4 10 15.4 10 9.4 L10 0',
};
const GLYPH_W = 10, GLYPH_H = 14;

/* deterministic "hand" — each letter leans and sits a touch differently, like the sketch */
function wobble(seed) { const x = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453; return (x - Math.floor(x)) - .5; }

/* a word as one <g> of glyphs: cap height `height`, left edge x, top y, `gap` between letters */
function word(text, x, y, height, gap, seed = 1) {
  const unit = height / GLYPH_H;
  let cursor = x;
  let out = '';
  [...text].forEach((ch, index) => {
    if (ch === ' ') { cursor += unit * 6; return; }
    const d = GLYPH[ch];
    if (!d) return;
    const lean = wobble(seed + index) * 5;             /* ±2.5° */
    const drop = wobble(seed * 7 + index) * unit * .9;  /* ±0.45 units */
    out += `<g transform="translate(${cursor.toFixed(2)} ${(y + drop).toFixed(2)}) rotate(${lean.toFixed(2)} ${(GLYPH_W * unit / 2).toFixed(2)} ${(height / 2).toFixed(2)}) scale(${unit.toFixed(4)})"><path d="${d}"/></g>`;
    cursor += GLYPH_W * unit + gap;
  });
  return out;
}

/* the drawings, in their reference boxes */
const DRAW = {
  parenL: () => '<path d="M42 3 C10 20 10 60 42 76"/>',
  parenR: () => '<path d="M6 3 C28 24 28 68 6 88"/>',
  insight: () => word('INSIGHT', 11.3, 10.75, 30, 5.5, 3),
  boxVisual: () => '<path d="M6 8.5 C60 7.6 130 7 190 6.8 L189.4 67 C130 67.6 60 67.4 5.4 68.2 Z"/><path class="hand-thin" d="M10.5 12.5 L185.6 11.6 L185 63 L10 63.8 Z"/>',
  boxDesign: () => '<path d="M6 8.2 L103 6.8 L102.4 59.4 L5.4 60.2 Z"/><path class="hand-thin" d="M10.5 12.4 L98.6 11.4 L98 55.4 L10 56 Z"/>',
  armLeft: () => [
    word('FASHION', 12, 11.5, 26, 4, 11),
    word('CONTENTS', 9, 114.5, 26, 4, 17),
    /* bracket: tick from FASHION, down, tick back to CONTENTS */
    '<path d="M174 24.5 L205 24.2 C205.8 60 205.4 96 205 127.6 L191 127.5"/>',
    /* the line to the box */
    '<path d="M205 78.7 C290 77.4 370 80.2 439.5 78.7"/>',
  ].join(''),
  armRight: () => [
    '<path d="M0 21.75 C60 23 120 20.6 168 21.75"/>',
    word('USING AI', 180, 7.75, 28, 5, 23),
  ].join(''),
};

function href(label) { return `#archive/${encodeURIComponent(label)}`; }

export function createHandNotes({ frame, linesRoot, isCompact }) {
  const layer = document.createElement('div');
  layer.className = 'hand-layer';
  layer.setAttribute('aria-hidden', 'false');
  frame.append(layer);

  const make = (tag, className, attrs = {}) => { const el = document.createElement(tag); el.className = className; Object.assign(el, attrs); return el; };
  const draw = (name, className) => {
    const size = SIZE[name];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `hand-img hand-svg ${className}`);
    svg.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = DRAW[name]();
    return svg;
  };
  const hot = (label, className) => { const a = make('a', `hand-hot ${className}`, { href: href(label) }); a.setAttribute('aria-label', label); return a; };

  const groups = {
    insight: make('div', 'hand-group hand-group--insight'),
    visual: make('div', 'hand-group hand-group--visual'),
    design: make('div', 'hand-group hand-group--design'),
  };
  const parts = {
    parenL: draw('parenL', 'hand-paren-l'), parenR: draw('parenR', 'hand-paren-r'), insight: draw('insight', 'hand-insight'),
    insightHot: hot('INSIGHT', 'hand-hot--insight'),
    boxVisual: draw('boxVisual', 'hand-box'), armLeft: draw('armLeft', 'hand-arm-left'),
    fashionHot: hot('FASHION', 'hand-hot--fashion'), contentsHot: hot('CONTENT', 'hand-hot--contents'),
    boxDesign: draw('boxDesign', 'hand-box'), armRight: draw('armRight', 'hand-arm-right'),
    aiHot: hot('AI WORKS', 'hand-hot--usingai'),
  };
  groups.insight.append(parts.parenL, parts.parenR, parts.insight, parts.insightHot);
  groups.visual.append(parts.boxVisual, parts.armLeft, parts.fashionHot, parts.contentsHot);
  groups.design.append(parts.boxDesign, parts.armRight, parts.aiHot);
  Object.values(groups).forEach((group) => layer.append(group));

  let active = null;
  let hideTimer = 0;

  function rectOf(el) {
    const r = el.getBoundingClientRect();
    const f = frame.getBoundingClientRect();
    return { left: r.left - f.left, top: r.top - f.top, right: r.right - f.left, bottom: r.bottom - f.top, width: r.width, height: r.height };
  }
  function place(el, x, y, w, h) {
    el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.width = `${w}px`;
    if (h != null) el.style.height = `${h}px`;
  }
  function scale() {
    const fs = parseFloat(getComputedStyle(linesRoot).fontSize) || REF_FONT;
    return fs / REF_FONT;
  }

  /* lays every piece out from the current keyword rects */
  function layout() {
    const k = scale();
    const words = (key) => [...linesRoot.querySelectorAll(`.intro-keyword[data-keyword="${key}"]`)];
    const union = (els) => els.map(rectOf).reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 });

    const ins = words('insight');
    if (ins.length) {
      const R = union(ins);
      const H = R.bottom - R.top;
      const W = R.right - R.left;
      /* parentheses: as tall as the two lines, sitting just outside the text */
      const ph = H * 1.02; const pw = ph * (SIZE.parenL.w / SIZE.parenL.h);
      place(parts.parenL, R.left - pw * .82, R.top - H * .01, pw, ph);
      const prw = ph * (SIZE.parenR.w / SIZE.parenR.h);
      place(parts.parenR, R.right - prw * 1.05, R.top - H * .01, prw, ph);
      /* the word: 40 % of the block width, centred, slightly above the middle like the sketch */
      const iw = Math.min(W * .40, SIZE.insight.w * k * 1.1); const ih = iw * (SIZE.insight.h / SIZE.insight.w);
      const ix = R.left + (W - iw) / 2; const iy = R.top + (H - ih) / 2 - H * .04;
      place(parts.insight, ix, iy, iw, ih);
      place(parts.insightHot, ix, iy, iw, ih);
    }

    const vis = words('visual');
    if (vis.length) {
      const R = rectOf(vis[0]);
      const bw = Math.max(R.width + 16 * k, SIZE.boxVisual.w * k * .92); const bh = Math.max(R.height + 8 * k, SIZE.boxVisual.h * k * .8);
      const bx = R.left + R.width / 2 - bw / 2; const by = R.top + R.height / 2 - bh / 2;
      place(parts.boxVisual, bx, by, bw, bh);
      const aw = SIZE.armLeft.w * k; const ah = SIZE.armLeft.h * k;
      const ax = bx - aw + 6 * k; const ay = by + bh / 2 - ah * .53;
      place(parts.armLeft, ax, ay, aw, ah);
      place(parts.fashionHot, ax + HOT.fashion.x * k, ay + HOT.fashion.y * k, HOT.fashion.w * k, HOT.fashion.h * k);
      place(parts.contentsHot, ax + HOT.contents.x * k, ay + HOT.contents.y * k, HOT.contents.w * k, HOT.contents.h * k);
    }

    const des = words('design');
    if (des.length) {
      const R = rectOf(des[0]);
      const bw = Math.max(R.width + 16 * k, SIZE.boxDesign.w * k * .85); const bh = Math.max(R.height + 8 * k, SIZE.boxDesign.h * k * .8);
      const bx = R.left + R.width / 2 - bw / 2; const by = R.top + R.height / 2 - bh / 2;
      place(parts.boxDesign, bx, by, bw, bh);
      const aw = SIZE.armRight.w * k; const ah = SIZE.armRight.h * k;
      const ax = bx + bw - 2 * k; const ay = by + bh / 2 - ah * .5;
      place(parts.armRight, ax, ay, aw, ah);
      place(parts.aiHot, ax + HOT.usingai.x * k, ay + HOT.usingai.y * k, HOT.usingai.w * k, HOT.usingai.h * k);
    }
  }

  function show(key) {
    clearTimeout(hideTimer);
    if (!groups[key]) return;
    if (active && active !== key) groups[active].classList.remove('is-on');
    active = key;
    layout();
    groups[key].classList.add('is-on');
    frame.classList.toggle('is-hand-insight', key === 'insight');
  }
  function hideNow() {
    if (active) groups[active].classList.remove('is-on');
    active = null;
    frame.classList.remove('is-hand-insight');
  }
  function hide() {
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hideNow, 140);
  }
  function toggle(key) { if (active === key) hideNow(); else show(key); }

  /* keep the note open while the pointer is on one of its labels (they are links); the group box itself is inert */
  Object.entries(groups).forEach(([key, group]) => {
    group.querySelectorAll('.hand-hot').forEach((link) => {
      link.addEventListener('pointerenter', () => { clearTimeout(hideTimer); if (active !== key) show(key); });
      link.addEventListener('pointerleave', hide);
    });
  });

  function bind(word, keyword) {
    const key = keyword.key;
    if (!groups[key]) return;
    if (isCompact()) {
      /* no room for the drawing on a phone — the word itself goes to its category */
      const target = { insight: 'INSIGHT', visual: 'FASHION', design: 'AI WORKS' }[key];
      word.addEventListener('click', () => { window.location.hash = href(target).slice(1); });
      return;
    }
    word.addEventListener('pointerenter', () => show(key));
    word.addEventListener('focus', () => show(key));
    word.addEventListener('pointerleave', hide);
    word.addEventListener('blur', hide);
    word.addEventListener('click', () => show(key));
  }

  function reset() { clearTimeout(hideTimer); hideNow(); }

  return { layer, bind, show, hide: hideNow, toggle, layout, reset, get active() { return active; } };
}
