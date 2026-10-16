/* Hand-drawn notes over the intro paragraph — clean vector strokes traced from 연서's Procreate sketch,
   plus the small handwritten sub-notes she drew around them (set in a handwriting face).
   Three groups, each shown while its keyword is hovered, or pinned with a click:
     insight  — the two "사람들의 …" lines blank out and "( INSIGHT )" takes their place;
                research / interview / targeting / marketing / trend scatter above, one on an elbow line
     visual   — a box around 비주얼 언어, a bracket with FASHION / CONTENT;
                a T-shirt full of words above FASHION, a screen full of words under CONTENT
     design   — a box around 설계, a line to USING AI, a list hanging under it, "also this portfolio!" above
   Every piece is placed from the live text rects, so it follows language and viewport. The side notes
   always go OUTWARD — away from the centre of the paragraph — so the English word order (design … visual
   language) mirrors the Korean layout instead of colliding with the sentence.
   Sizes are the sketch's own proportions at the reference layout (1440 wide, 27px type). */

const REF_FONT = 27;
const PAD = 28;   /* frame side padding */
const TOP = 62;   /* nav bottom, in frame px */
/* drawing boxes in reference px (the sketch's proportions) */
const SIZE = {
  parenL: { w: 51, h: 79 }, parenR: { w: 31, h: 91.5 }, insight: { w: 205.5, h: 51.5 },
  boxVisual: { w: 195.5, h: 73.5 }, boxDesign: { w: 108.5, h: 66 },
  line: { w: 200, h: 20 },        /* box ↔ label link, stretched to the gap */
  fcWords: { w: 206, h: 148.5 },  /* bracket + FASHION / CONTENT */
  aiWord: { w: 220, h: 44 },      /* USING AI */
  shirt: { w: 330, h: 300 },
  arrow: { w: 20, h: 60 },
  screen: { w: 390, h: 190 },
  aiList: { w: 260, h: 330 },      /* tick 0–34, words from y 66 every 34, the ⋮ under them */
  aiTag: { w: 320, h: 40 },
  scatter: { w: 800, h: 410 },    /* origin (300, 330) sits on the right end of INSIGHT */
  tail: { w: 100, h: 100 },
};
const FC_LINE = 234.5, AI_LINE = 168; /* full link lengths from the sketch */
/* clickable words inside the label drawings, relative to the drawing's top-left (reference px) */
const HOT = {
  left: { fashion: { x: 9, y: 9.5, w: 154, h: 30 }, contents: { x: 7, y: 111.5, w: 160, h: 32 } },
  right: { fashion: { x: 37, y: 9.5, w: 154, h: 30 }, contents: { x: 17, y: 111.5, w: 160, h: 32 } },
  usingai: { x: 3, y: 5, w: 212, h: 34 },
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

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
/* a handwritten sub-note: `i` staggers its reveal, `tilt` leans the whole word a little */
function note(str, x, y, size, i = 0, tilt = 0, cls = '') {
  const t = tilt ? ` transform="rotate(${tilt} ${x} ${y})"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}" style="--i:${i}"${t}${cls ? ` class="${cls}"` : ''}>${esc(str)}</text>`;
}
/* a sub-note stroke that draws itself in */
const stroke = (d, cls = '') => `<path pathLength="1" d="${d}"${cls ? ` class="${cls}"` : ''}/>`;

/* where the words go, per drawing — one slot per word 연서 wrote (extra words fall into rows) */
const SLOTS = {
  /* 6 words; everything below the armholes (y > 122) starts right of x 92 so it stays inside the body */
  shirt: [[70, 62, -3], [150, 97, 2], [98, 136, -1], [160, 174, 3], [100, 214, -2], [124, 256, 1]],
  screen: [[28, 44, -1], [232, 42, 2], [92, 100, -2], [268, 98, 1], [42, 156, 1], [168, 156, -2]],
  aiList: [[62, 66], [66, 100], [60, 134], [64, 168], [62, 202], [66, 236], [62, 270]],
  /* research · interview · targeting · marketing · trend · audience — the elbow stops short of marketing */
  scatter: [[19, 76, -2], [412, 33, 1], [678, 101, 2], [572, 232, 1], [696, 331, -1], [560, 404, -1]],
};
function slotted(words, slots, size, fallback) {
  return words.map((w, i) => {
    const s = slots[i] || fallback(i);
    return note(w, s[0], s[1], size, i, s[2] || 0);
  }).join('');
}

/* the drawings, in their reference boxes */
const DRAW = {
  parenL: () => '<path d="M42 3 C10 20 10 60 42 76"/>',
  parenR: () => '<path d="M6 3 C28 24 28 68 6 88"/>',
  insight: () => word('INSIGHT', 11.3, 10.75, 30, 5.5, 3),
  boxVisual: () => '<path d="M6 8.5 C60 7.6 130 7 190 6.8 L189.4 67 C130 67.6 60 67.4 5.4 68.2 Z"/><path class="hand-thin" d="M10.5 12.5 L185.6 11.6 L185 63 L10 63.8 Z"/>',
  boxDesign: () => '<path d="M6 8.2 L103 6.8 L102.4 59.4 L5.4 60.2 Z"/><path class="hand-thin" d="M10.5 12.4 L98.6 11.4 L98 55.4 L10 56 Z"/>',
  line: () => '<path d="M0 10 C60 11.5 120 8.5 200 10"/>',
  /* FASHION / CONTENT with the bracket on the side that faces the sentence */
  fcWords: (side) => side === 'right'
    ? [word('FASHION', 40, 11.5, 26, 4, 11), word('CONTENT', 20, 114.5, 26, 4, 17),
      '<path d="M32 24.5 L1 24.2 C.2 60 .6 96 1 127.6 L15 127.5"/>'].join('')
    : [word('FASHION', 12, 11.5, 26, 4, 11), word('CONTENT', 9, 114.5, 26, 4, 17),
      '<path d="M174 24.5 L205 24.2 C205.8 60 205.4 96 205 127.6 L171 127.5"/>'].join(''),
  aiWord: () => word('USING AI', 6, 8, 28, 5, 23),
  /* a T-shirt, words scattered inside */
  shirt: (words) => [
    stroke('M118 12 C132 30 198 30 212 12'),
    stroke('M118 12 C96 18 76 24 60 30 C46 54 32 80 18 105 C36 111 54 116 72 122 C74 178 77 234 80 290 C137 291 194 290 250 290 C252 234 255 178 258 122 C276 116 294 111 312 105 C298 80 284 54 270 30 C250 24 232 18 212 12'),
    slotted(words, SLOTS.shirt, 15, (i) => [70, 62 + i * 34, 0]),
  ].join(''),
  /* a plain line from CONTENT down to the screen (it reaches the frame's top edge) */
  arrow: () => stroke('M10 0 C10.4 22 10.2 44 10 66'),
  /* a screen (a frame with rounded-ish corners), words inside */
  screen: (words) => [
    stroke('M6 6 C130 4.8 260 5.4 384 6 C385 66 384.4 126 384 184 C260 185.2 130 184.6 6 184 C5 126 5.6 66 6 6 Z'),
    slotted(words, SLOTS.screen, 15, (i) => [30 + (i % 2) * 200, 44 + Math.floor(i / 2) * 56, 0]),
  ].join(''),
  /* the list hanging from USING AI, ending in a "…" */
  aiList: (words) => [
    stroke('M121 0 C120 12 119.6 24 119 34'),
    slotted(words, SLOTS.aiList, 20, (i) => [62, 66 + i * 34, 0]),
    ['<g class="hand-dots" style="--i:' + words.length + '">',
      ...[0, 1, 2].map((n) => `<circle cx="${68 + n * .6}" cy="${Math.min(66 + words.length * 34 - 12, 300) + n * 9}" r="1.3"/>`), '</g>'].join(''),
  ].join(''),
  aiTag: (str) => note(str, 4, 28, 20, 0, -1.5, 'hand-faint'),
  /* the cloud above INSIGHT — the elbow line runs to the 4th word (marketing) */
  scatter: (words) => [
    stroke(elbow(85), 'hand-elbow'),
    slotted(words, SLOTS.scatter, 24, (i) => [560, 240 + (i - 4) * 40, 0]),
  ].join(''),
  tail: (dir) => stroke(dir === 'left' ? 'M100 0 L0 100' : dir === 'down' ? 'M50 0 L50 100' : 'M0 0 L100 100'),
};

/* INSIGHT → right → up → right to the 4th word; `rise` is how far right of INSIGHT the line turns up */
function elbow(rise) {
  const x = 300 + rise;
  return `M300 330 C${300 + rise * .33} 331 ${300 + rise * .66} 329 ${x} 330 C${x + .6} 292 ${x + .4} 254 ${x} 216 C${x + (534 - x) * .33} 215 ${x + (534 - x) * .66} 217 534 216`;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* Phones and tablets (2026-10-17, 연서: "no cursor there, so let it move by itself, slowly"): there is no hover, so the
   three notes open by themselves one after another (INSIGHT, then FASHION / CONTENT, then USING AI), and a tap on an
   underlined word opens its note. A phone is too narrow for the notes at the sides of the sentence, so there they are
   drawn above and below it instead, in the same pen: the INSIGHT words in a cloud above, the labels below with their
   words hanging under them like the USING AI list. A narrow desktop window (601 to 760px, with a mouse) still has none. */
const touchQuery = window.matchMedia('(hover: none)');
const noNotesQuery = window.matchMedia('(max-width: 760px) and (hover: hover)');
const AUTO_ORDER = ['insight', 'visual', 'design'];
const AUTO_SHOW = { insight: 3800, visual: 4600, design: 4600 }; /* ms each note stays open */
const AUTO_GAP = 650;    /* between two notes */
const AUTO_REST = 1500;  /* after the third, before it starts again */
const AUTO_HOLD = 7000;  /* a tapped note stays this long before the round goes on */
const SVG_NS = 'http://www.w3.org/2000/svg';

export function createHandNotes({ frame, linesRoot }) {
  const layer = document.createElement('div');
  layer.className = 'hand-layer';
  layer.setAttribute('aria-hidden', 'false');
  frame.append(layer);
  const NOTES = window.SITE?.intro?.notes || {};
  const notesOff = () => noNotesQuery.matches;
  const isAuto = () => touchQuery.matches;
  /* the phone arrangement: by width, so a tablet held sideways keeps the desktop one */
  const isPhoneLayout = () => frame.getBoundingClientRect().width < 700;

  const make = (tag, className, attrs = {}) => { const el = document.createElement(tag); el.className = className; Object.assign(el, attrs); return el; };
  const draw = (name, className, ...args) => {
    const size = SIZE[name];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `hand-img hand-svg ${className}`);
    svg.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = DRAW[name](...args);
    return svg;
  };
  /* the labels keep a note open under the pointer, blink softly while it is open, and a click on one opens
     that filter of the archive (2026-10-02: before that nothing on the paper navigated anywhere) */
  const hot = (label, className) => { const a = make('span', `hand-hot ${className}`); a.setAttribute('aria-hidden', 'true'); a.dataset.label = label; return a; };

  const groups = {
    insight: make('div', 'hand-group hand-group--insight'),
    visual: make('div', 'hand-group hand-group--visual'),
    design: make('div', 'hand-group hand-group--design'),
  };
  const parts = {
    parenL: draw('parenL', 'hand-paren-l'), parenR: draw('parenR', 'hand-paren-r'), insight: draw('insight', 'hand-insight'),
    insightHot: hot('INSIGHT', 'hand-hot--insight'),
    scatter: draw('scatter', 'hand-sub hand-scatter', NOTES.insight || []),
    boxVisual: draw('boxVisual', 'hand-box'), fcLine: draw('line', 'hand-line'), fcWords: draw('fcWords', 'hand-fc', 'left'),
    fashionHot: hot('FASHION', 'hand-hot--fashion'), contentsHot: hot('CONTENT', 'hand-hot--contents'),
    shirt: draw('shirt', 'hand-sub hand-shirt', NOTES.fashion || []), shirtTail: draw('tail', 'hand-sub hand-tail', 'down'),
    arrow: draw('arrow', 'hand-sub hand-arrow'), screen: draw('screen', 'hand-sub hand-screen', NOTES.contents || []),
    boxDesign: draw('boxDesign', 'hand-box'), aiLine: draw('line', 'hand-line'), aiWord: draw('aiWord', 'hand-ai'),
    aiHot: hot('AI WORKS', 'hand-hot--usingai'),
    aiTag: draw('aiTag', 'hand-sub hand-tag', NOTES.aiTag || ''), aiList: draw('aiList', 'hand-sub hand-list', NOTES.ai || []),
  };
  groups.insight.append(parts.parenL, parts.parenR, parts.insight, parts.scatter, parts.insightHot);
  /* the line from the shirt down to FASHION is left out (연서, 2026-10-10); shirtTail is still built and placed, just never shown */
  groups.visual.append(parts.boxVisual, parts.fcLine, parts.fcWords, parts.shirt, parts.arrow, parts.screen, parts.fashionHot, parts.contentsHot);
  groups.design.append(parts.boxDesign, parts.aiLine, parts.aiWord, parts.aiTag, parts.aiList, parts.aiHot);
  /* the side drawings are desktop only; on a phone their place is taken by the sheets below */
  [parts.scatter, parts.fcLine, parts.fcWords, parts.shirt, parts.shirtTail, parts.arrow, parts.screen, parts.aiLine, parts.aiWord, parts.aiTag, parts.aiList]
    .forEach((el) => el.classList.add('hand-desk'));
  /* phone sheets: one drawing the size of the frame per group, in frame pixels, redrawn by layoutPhone() */
  const sheet = (className) => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', `hand-img hand-svg hand-phone ${className}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  };
  const phone = {
    insightSub: sheet('hand-sub'),
    visualSub: sheet('hand-sub'), visualLabel: sheet('hand-fc'),
    designSub: sheet('hand-sub'), designLabel: sheet('hand-ai'),
  };
  groups.insight.prepend(phone.insightSub);
  groups.visual.prepend(phone.visualSub, phone.visualLabel);
  groups.design.prepend(phone.designSub, phone.designLabel);
  Object.values(groups).forEach((group) => layer.append(group));
  let fcSide = 'left';
  let tailDir = 'down';

  let active = null;
  let pinned = null;
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
  /* a line drawn from (x1,y1) down to (x2,y2) */
  function tail(el, x1, y1, x2, y2) {
    const dir = Math.abs(x2 - x1) < 2 ? 'down' : x2 < x1 ? 'left' : 'right';
    if (dir !== tailDir) { tailDir = dir; el.innerHTML = DRAW.tail(dir); }
    place(el, Math.min(x1, x2), y1, Math.max(2, Math.abs(x2 - x1)), Math.max(2, y2 - y1));
  }

  /* ---- phone arrangement ---- */
  const text = (str, x, y, size, i = 0, tilt = 0, anchor = 'start', cls = '') =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" text-anchor="${anchor}" style="--i:${i}"${tilt ? ` transform="rotate(${tilt} ${x.toFixed(1)} ${y.toFixed(1)})"` : ''}${cls ? ` class="${cls}"` : ''}>${esc(str)}</text>`;
  const line = (pts) => stroke(`M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`);
  const dots = (x, y, i) => `<g class="hand-dots" style="--i:${i}">${[0, 1, 2].map((n) => `<circle cx="${(x + n * .5).toFixed(1)}" cy="${(y + n * 8).toFixed(1)}" r="1.3"/>`).join('')}</g>`;
  /* the width of a block-letter word drawn by word() */
  const wordWidth = (str, height, gap) => [...str].reduce((sum, ch) => sum + (ch === ' ' ? height / GLYPH_H * 6 : height / GLYPH_H * GLYPH_W + gap), 0) - gap;
  /* the text boxes of the sentence's rows (a row element is full width, its text is centred in it) */
  function rowTexts() {
    return [...linesRoot.querySelectorAll('.intro-line.is-visible')].map((row) => {
      const range = document.createRange(); range.selectNodeContents(row);
      const boxes = [...range.getClientRects()].filter((q) => q.width > 0);
      if (!boxes.length) return null;
      const f = frame.getBoundingClientRect();
      return { row, left: Math.min(...boxes.map((q) => q.left)) - f.left, right: Math.max(...boxes.map((q) => q.right)) - f.left, top: Math.min(...boxes.map((q) => q.top)) - f.top, bottom: Math.max(...boxes.map((q) => q.bottom)) - f.top };
    }).filter(Boolean);
  }

  function layoutPhone() {
    const F = frame.getBoundingClientRect();
    const W = F.width; const H = F.height;
    const SIDE = 18;
    const navBottom = (document.querySelector('#nav')?.getBoundingClientRect().bottom || 54) - F.top;
    const topLimit = Math.max(0, navBottom) + 14;
    const bottomLimit = Math.min(H, window.innerHeight - F.top) - 16;
    const rows = rowTexts();
    if (!rows.length) return;
    const P = { top: Math.min(...rows.map((r) => r.top)), bottom: Math.max(...rows.map((r) => r.bottom)) };
    Object.values(phone).forEach((svg) => { svg.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`); place(svg, 0, 0, W, H); });
    const words = (key) => [...linesRoot.querySelectorAll(`.intro-keyword[data-keyword="${key}"]`)];
    const union = (els) => els.map(rectOf).reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 });
    /* the rows under a keyword's row: a line going down at the side must clear their text */
    const below = (R) => rows.filter((r) => r.top > R.top + 2);
    const sideX = (R, box, toRight) => {
      const under = below(R);
      return toRight
        ? clamp(Math.max(box.x + box.w + 14, ...under.map((r) => r.right + 10)), 0, W - 8)
        : clamp(Math.min(box.x - 14, ...under.map((r) => r.left - 10)), 8, W);
    };

    /* INSIGHT: the two lines give way to ( INSIGHT ), its words float in the empty space above the sentence */
    const ins = words('insight');
    if (ins.length) {
      const R = union(ins);
      const hh = R.bottom - R.top; const ww = R.right - R.left;
      const ph = hh * 1.02; const pw = ph * (SIZE.parenL.w / SIZE.parenL.h);
      place(parts.parenL, R.left - pw * .82, R.top - hh * .01, pw, ph);
      const prw = ph * (SIZE.parenR.w / SIZE.parenR.h);
      place(parts.parenR, R.right - prw * 1.05, R.top - hh * .01, prw, ph);
      const iw = Math.min(ww * .72, 150); const ih = iw * (SIZE.insight.h / SIZE.insight.w);
      const ix = R.left + (ww - iw) / 2; const iy = R.top + (hh - ih) / 2;
      place(parts.insight, ix, iy, iw, ih);
      place(parts.insightHot, ix, iy, iw, ih);
      /* the cloud stops above the paragraph's small en / ko switch */
      const langEl = frame.querySelector('.intro-lang button');
      const langTop = langEl ? rectOf(langEl).top : P.top;
      const cloud = { x: SIDE, y: topLimit, w: W - SIDE * 2, h: Math.max(60, Math.min(P.top, langTop) - 12 - topLimit) };
      const size = cloud.h < 110 ? 15 : 17;
      /* research · interview · targeting · marketing · trend · audience: fractions of the cloud, baseline y */
      const SPOTS = [[.02, .30, -2], [.40, .14, 1], [.70, .42, 2], [.10, .76, 1], [.44, .62, -1], [.68, .95, -1]];
      const list = NOTES.insight || [];
      const cloudText = list.map((w, i) => {
        const s = SPOTS[i] || [.1 + (i % 3) * .3, .3 + Math.floor(i / 3) * .4, 0];
        const x = clamp(cloud.x + s[0] * cloud.w, cloud.x, cloud.x + cloud.w - w.length * size * .45);
        return text(w, x, cloud.y + s[1] * cloud.h, size, i, s[2]);
      }).join('');
      /* the pen leaves INSIGHT to the right, turns up between the word and the bracket, into the cloud */
      const x0 = ix + iw + 3; const y0 = iy + ih * .55;
      const xr = (x0 + (R.right - prw * 1.05)) / 2;
      const yTop = cloud.y + cloud.h * (SPOTS[5]?.[1] || .95) + 7; /* stops just under the last word */
      phone.insightSub.innerHTML = line([[x0, y0], [xr, y0], [xr, yTop]]) + cloudText;
    }

    /* visual language: a box, a line down the side, then FASHION and CONTENT side by side under the sentence,
       each with its words hanging under it */
    const vis = words('visual');
    if (vis.length) {
      const R = rectOf(vis[0]);
      const box = { w: R.width + 14, h: R.height + 10 };
      box.x = R.left + R.width / 2 - box.w / 2; box.y = R.top + R.height / 2 - box.h / 2;
      place(parts.boxVisual, box.x, box.y, box.w, box.h);
      const toRight = R.left + R.width / 2 >= W / 2;
      const xm = sideX(R, box, toRight);
      const ym = box.y + box.h / 2;
      const capH = 17; const gap = 3;
      const yBar = P.bottom + 14;
      const yLabel = P.bottom + 32;
      const colW = (W - SIDE * 2) / 2;
      const cols = [
        { label: 'FASHION', cx: SIDE + colW / 2, words: NOTES.fashion || [], hot: parts.fashionHot },
        { label: 'CONTENT', cx: SIDE + colW * 1.5, words: NOTES.contents || [], hot: parts.contentsHot },
      ];
      const n = Math.max(...cols.map((c) => c.words.length), 1);
      const first = yLabel + capH + 22;
      const step = clamp((bottomLimit - first) / Math.max(1, n - 1), 13, 18);
      const size = Math.min(14, step - 3);
      let labels = ''; let subs = '';
      const far = toRight ? cols[0].cx : cols[1].cx;
      subs += line([[toRight ? box.x + box.w : box.x, ym], [xm, ym], [xm, yBar], [far, yBar]]);
      cols.forEach((col, c) => {
        const lw = wordWidth(col.label, capH, gap);
        const lx = col.cx - lw / 2;
        labels += word(col.label, lx, yLabel, capH, gap, c ? 17 : 11);
        place(col.hot, lx - 6, yLabel - 6, lw + 12, capH + 12);
        subs += line([[col.cx, yBar], [col.cx, yLabel - 6]]);
        col.words.forEach((w, i) => { subs += text(w, col.cx, first + i * step, size, i, 0, 'middle'); });
      });
      phone.visualLabel.innerHTML = labels;
      phone.visualSub.innerHTML = subs;
    }

    /* design: a box, a line down the side, USING AI under the sentence with its list (in two columns if the
       screen is short) */
    const des = words('design');
    if (des.length) {
      const R = rectOf(des[0]);
      const box = { w: R.width + 14, h: R.height + 10 };
      box.x = R.left + R.width / 2 - box.w / 2; box.y = R.top + R.height / 2 - box.h / 2;
      place(parts.boxDesign, box.x, box.y, box.w, box.h);
      const toRight = R.left + R.width / 2 >= W / 2;
      const xm = sideX(R, box, toRight);
      const ym = box.y + box.h / 2;
      const capH = 19; const gap = 4;
      const yLabel = P.bottom + 30;
      const lw = wordWidth('USING AI', capH, gap);
      const lx = clamp(toRight ? xm - lw + 2 : xm - 2, SIDE, W - SIDE - lw);
      let subs = line([[toRight ? box.x + box.w : box.x, ym], [xm, ym], [xm, yLabel - 7]]);
      const tagSize = 13; const tag = NOTES.aiTag || '';
      const tagW = tag.length * tagSize * .45;
      if (tag) {
        const tx = toRight ? lx - 10 - tagW : lx + lw + 10;
        if (tx >= SIDE - 2 && tx + tagW <= W - SIDE + 2) subs += text(tag, tx, yLabel + capH * .8, tagSize, 0, -1.5, 'start', 'hand-faint');
        else subs += text(tag, clamp(lx, SIDE, W - SIDE - tagW), yLabel - 10, tagSize, 0, -1.5, 'start', 'hand-faint');
      }
      const tickX = lx + lw / 2;
      subs += line([[tickX, yLabel + capH + 4], [tickX, yLabel + capH + 16]]);
      const list = NOTES.ai || [];
      const first = yLabel + capH + 36;
      const step = 18;
      const oneColumn = first + (list.length - 1) * step + 26 <= bottomLimit;
      const per = oneColumn ? list.length : Math.ceil(list.length / 2);
      const colX = [lx + 6, lx + 6 + Math.min(130, (W - SIDE - lx) / 2)];
      list.forEach((w, i) => {
        const c = Math.floor(i / per);
        subs += text(w, colX[c], first + (i % per) * step, 14, i);
      });
      const last = oneColumn ? list.length - 1 : per - 1;
      subs += dots(colX[oneColumn ? 0 : 1] + 4, first + (oneColumn ? last : (list.length - per - 1)) * step + 10, list.length);
      phone.designLabel.innerHTML = word('USING AI', lx, yLabel, capH, gap, 23);
      phone.designSub.innerHTML = subs;
      place(parts.aiHot, lx - 6, yLabel - 6, lw + 12, capH + 12);
    }
  }

  /* lays every piece out from the current keyword rects */
  function layout() {
    const phoneLayout = isPhoneLayout();
    layer.classList.toggle('is-phone', phoneLayout);
    layer.classList.toggle('is-auto', isAuto());
    if (phoneLayout) { layoutPhone(); return; }
    const k = scale();
    const F = frame.getBoundingClientRect();
    const mid = F.width / 2;
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
      /* the cloud: its origin on the right end of INSIGHT, shrunk if the nav is in the way */
      const ox = ix + iw + 4 * k, oy = iy + ih / 2;
      const fit = clamp((oy - TOP - 8) / (330 * k), .5, 1) * clamp((F.width - PAD - ox) / (500 * k), .5, 1);
      place(parts.scatter, ox - 300 * k * fit, oy - 330 * k * fit, SIZE.scatter.w * k * fit, SIZE.scatter.h * k * fit);
      /* turn up halfway between the word and the right parenthesis, so the riser never runs through it */
      const parenLeft = R.right - prw * 1.05;
      const rise = clamp((parenLeft - ox) * .5 / (k * fit), 16, 200);
      parts.scatter.querySelector('.hand-elbow')?.setAttribute('d', elbow(rise));
    }

    const vis = words('visual');
    if (vis.length) {
      const R = rectOf(vis[0]);
      const side = R.left + R.width / 2 < mid ? 'left' : 'right';
      const bw = Math.max(R.width + 16 * k, SIZE.boxVisual.w * k * .92); const bh = Math.max(R.height + 8 * k, SIZE.boxVisual.h * k * .8);
      const bx = R.left + R.width / 2 - bw / 2; const by = R.top + R.height / 2 - bh / 2;
      place(parts.boxVisual, bx, by, bw, bh);
      if (side !== fcSide) { fcSide = side; parts.fcWords.innerHTML = DRAW.fcWords(side); }
      const ww = SIZE.fcWords.w * k, wh = SIZE.fcWords.h * k;
      const wy = by + bh / 2 - wh * .53;
      let wx, lx, len;
      if (side === 'left') {
        len = clamp(bx - PAD - ww, 40 * k, FC_LINE * k);
        wx = bx + 6 * k - len - ww; lx = wx + ww;
      } else {
        len = clamp(F.width - PAD - (bx + bw) - ww, 40 * k, FC_LINE * k);
        lx = bx + bw - 6 * k; wx = lx + len;
      }
      place(parts.fcWords, wx, wy, ww, wh);
      place(parts.fcLine, lx, wy + 78.7 * k - 10 * k, len, 20 * k);
      const h = HOT[side];
      const fx = wx + h.fashion.x * k, fy = wy + h.fashion.y * k, fw = h.fashion.w * k;
      const cx = wx + h.contents.x * k, cy = wy + h.contents.y * k, cw = h.contents.w * k, ch = h.contents.h * k;
      place(parts.fashionHot, fx, fy, fw, h.fashion.h * k);
      place(parts.contentsHot, cx, cy, cw, ch);
      /* the T-shirt above FASHION — shrunk when the nav is close, kept inside the frame */
      const sfit = clamp((fy - TOP - 30 * k) / (330 * k), .5, 1);
      const sw = SIZE.shirt.w * k * sfit, sh = SIZE.shirt.h * k * sfit;
      const sx = clamp(fx + fw / 2 - sw / 2, PAD, F.width - PAD - sw); const sy = fy - 30 * k * sfit - sh;
      place(parts.shirt, sx, sy, sw, sh);
      tail(parts.shirtTail, sx + sw / 2 + 4 * k, sy + sh - 2 * k, fx + fw / 2, fy - 3 * k);
      /* the screen under CONTENT, an arrow pointing at it */
      const room = F.height - 12 - (cy + ch + 4 * k);
      const cfit = clamp(room / (260 * k), .5, 1);
      const ah = 60 * k * cfit;
      place(parts.arrow, cx + cw / 2 - 10 * k * cfit, cy + ch + 4 * k, 20 * k * cfit, ah);
      const scw = SIZE.screen.w * k * cfit, sch = SIZE.screen.h * k * cfit;
      place(parts.screen, clamp(cx - 30 * k, PAD, F.width - PAD - scw), cy + ch + 4 * k + ah, scw, sch);
    }

    const des = words('design');
    if (des.length) {
      const R = rectOf(des[0]);
      const side = R.left + R.width / 2 < mid ? 'left' : 'right';
      const bw = Math.max(R.width + 16 * k, SIZE.boxDesign.w * k * .85); const bh = Math.max(R.height + 8 * k, SIZE.boxDesign.h * k * .8);
      const bx = R.left + R.width / 2 - bw / 2; const by = R.top + R.height / 2 - bh / 2;
      place(parts.boxDesign, bx, by, bw, bh);
      const aw = SIZE.aiWord.w * k, ah = SIZE.aiWord.h * k;
      const ay = by + bh / 2 - ah / 2;
      let ax, lx, len;
      if (side === 'right') {
        len = clamp(F.width - PAD - (bx + bw) - aw, 40 * k, AI_LINE * k);
        lx = bx + bw - 2 * k; ax = lx + len;
      } else {
        len = clamp(bx - PAD - aw, 40 * k, AI_LINE * k);
        ax = bx + 2 * k - len - aw; lx = ax + aw;
      }
      place(parts.aiWord, ax, ay, aw, ah);
      place(parts.aiLine, lx, by + bh / 2 - 10 * k, len, 20 * k);
      place(parts.aiHot, ax + HOT.usingai.x * k, ay + HOT.usingai.y * k, HOT.usingai.w * k, HOT.usingai.h * k);
      /* "also this portfolio!" above, the list below */
      const tw = SIZE.aiTag.w * k, th = SIZE.aiTag.h * k;
      place(parts.aiTag, clamp(ax + 12 * k, PAD, F.width - PAD - tw), ay - th - 2 * k, tw, th);
      const lfit = clamp((F.height - 12 - (ay + ah)) / (330 * k), .5, 1);
      const lw = SIZE.aiList.w * k * lfit, lh = SIZE.aiList.h * k * lfit;
      place(parts.aiList, clamp(ax + 40 * k, PAD, F.width - PAD - lw), ay + ah - 4 * k, lw, lh);
    }
  }

  /* the first time the paragraph settles, every note shows at once, faint and rippling, then fades away,
     so nobody leaves without knowing the words open something */
  let previewTimer = 0;
  let previewing = false;
  function endPreview() {
    clearTimeout(previewTimer);
    if (!previewing) return;
    previewing = false;
    Object.entries(groups).forEach(([key, group]) => { group.classList.remove('is-ghost'); if (key !== active) group.classList.remove('is-on'); });
  }
  function preview(tries = 6) {
    if (notesOff() || isAuto() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* a note is open under the pointer right now: wait for it to close, then play */
    if (active || pinned) { if (tries > 0) previewTimer = window.setTimeout(() => preview(tries - 1), 900); return; }
    layout();
    previewing = true;
    Object.values(groups).forEach((group) => group.classList.add('is-on', 'is-ghost'));
    /* the last note to fade decides the end; the timer is only a safety net */
    groups.design.addEventListener('animationend', endPreview, { once: true });
    previewTimer = window.setTimeout(endPreview, 2200); /* the 1.7s ghost plus its .1s stagger */
  }

  function show(key) {
    endPreview();
    clearTimeout(hideTimer);
    if (!groups[key]) return;
    if (active && active !== key) groups[active].classList.remove('is-on');
    active = key;
    layout();
    groups[key].classList.add('is-on');
    frame.classList.toggle('is-hand-insight', key === 'insight');
    /* with no pointer to light it, the word whose note is open glows (phones) */
    if (isAuto()) linesRoot.querySelectorAll('.intro-keyword').forEach((w) => w.classList.toggle('is-lit', w.dataset.keyword === key && key !== 'insight'));
  }
  function hideNow() {
    if (active) groups[active].classList.remove('is-on');
    active = null;
    frame.classList.remove('is-hand-insight');
    linesRoot.querySelectorAll('.intro-keyword.is-lit').forEach((w) => w.classList.remove('is-lit'));
  }

  /* phones: the notes open by themselves, one after another, while the sentence is on screen */
  const auto = { on: false, timer: 0, index: 0, holdUntil: 0, visible: true };
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function autoStep() {
    clearTimeout(auto.timer);
    if (!auto.on) return;
    if (!auto.visible || document.hidden) { auto.timer = window.setTimeout(autoStep, 700); return; }
    const now = performance.now();
    if (now < auto.holdUntil) { auto.timer = window.setTimeout(autoStep, auto.holdUntil - now + 20); return; }
    if (active) {
      pinned = null; hideNow();
      auto.timer = window.setTimeout(autoStep, auto.index % AUTO_ORDER.length === 0 ? AUTO_REST : AUTO_GAP);
      return;
    }
    const key = AUTO_ORDER[auto.index % AUTO_ORDER.length];
    auto.index += 1;
    show(key);
    auto.timer = window.setTimeout(autoStep, AUTO_SHOW[key] || 4000);
  }
  function autoplay(on) {
    clearTimeout(auto.timer);
    auto.on = !!on && isAuto() && !notesOff() && !reducedQuery.matches;
    if (!auto.on) return;
    auto.index = 0; auto.holdUntil = 0;
    auto.timer = window.setTimeout(autoStep, 900); /* the sentence fades in first */
  }
  /* a tapped word: its note stays a while, then the round goes on from the next one */
  function tapKeyword(key) {
    if (pinned === key && active === key) { pinned = null; hideNow(); auto.holdUntil = performance.now() + 900; auto.index = AUTO_ORDER.indexOf(key) + 1; if (auto.on) autoStep(); return; }
    pinned = key; show(key);
    auto.holdUntil = performance.now() + AUTO_HOLD;
    auto.index = AUTO_ORDER.indexOf(key) + 1;
    if (auto.on) autoStep();
  }
  /* the round stops while the intro is off screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { auto.visible = entry.isIntersecting && entry.intersectionRatio > .35; }, { threshold: [0, .35, .6] }).observe(frame);
  }
  /* the pointer left a word: fall back to the pinned note if there is one, otherwise fade */
  function hide() {
    clearTimeout(hideTimer);
    if (pinned) { if (active !== pinned) show(pinned); return; }
    /* long enough to travel from the word to its label (USING AI sits a line's length away) */
    hideTimer = window.setTimeout(hideNow, 650);
  }
  function pin(key) {
    if (pinned === key) { pinned = null; hideNow(); return; }
    pinned = key; show(key);
  }
  function unpin() { if (!pinned) return; pinned = null; hideNow(); }
  /* go to the archive with one filter on (archive.js follows the hash and scrolls there) */
  function openFilter(label) {
    if (!label) return;
    clearTimeout(hideTimer); pinned = null; hideNow();
    window.location.hash = `#archive/${encodeURIComponent(label)}`;
  }
  /* a word with a single label goes straight there; visual language has two (FASHION, CONTENT), so it pins */
  const SINGLE = { insight: 'INSIGHT', design: 'AI WORKS' };
  function toggle(key) { pin(key); }

  /* keep the note open while the pointer is on one of its labels (they are links); the group box itself is inert */
  Object.entries(groups).forEach(([key, group]) => {
    group.querySelectorAll('.hand-hot').forEach((link) => {
      link.addEventListener('pointerenter', () => { clearTimeout(hideTimer); if (active !== key) show(key); });
      link.addEventListener('pointerleave', hide);
      link.addEventListener('click', (event) => { event.stopPropagation(); openFilter(link.dataset.label); });
    });
  });
  /* a click anywhere else on the paper lets a pinned note go */
  frame.addEventListener('click', (event) => {
    if (event.target.closest?.('.intro-keyword, .hand-hot, .intro-lang')) return;
    if (isAuto()) { if (pinned) { pinned = null; auto.holdUntil = 0; if (auto.on) autoStep(); } return; }
    unpin();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') unpin(); });

  function bind(word, keyword) {
    const key = keyword.key;
    if (!groups[key]) return;
    if (notesOff()) return; /* a narrow desktop window has no room for the drawings: the words stay plain text */
    /* touch: a tap opens the note (a tap on INSIGHT or USING AI itself then opens the archive) */
    if (isAuto()) { word.addEventListener('click', () => tapKeyword(key)); return; }
    word.addEventListener('pointerenter', () => show(key));
    word.addEventListener('focus', () => show(key));
    word.addEventListener('pointerleave', hide);
    word.addEventListener('blur', () => { if (!pinned) hide(); });
    word.addEventListener('click', () => { if (SINGLE[key]) openFilter(SINGLE[key]); else pin(key); });
  }

  function reset() { clearTimeout(hideTimer); endPreview(); autoplay(false); pinned = null; hideNow(); }

  return { layer, bind, show, hide: hideNow, toggle, layout, reset, preview, autoplay, get active() { return active; }, get pinned() { return pinned; } };
}
