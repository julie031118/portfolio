/* A round glass ball under the pointer, after Codrops' "Progressively Enhanced WebGL Lens Refraction" (2023),
   on a few chosen parts only (2026-10-03): the intro paragraph and the photographs of a project page.
   It works the same in Chrome and Safari: instead of filtering what lies behind the ball (backdrop-filter with
   an SVG filter runs in Chrome only), an SVG filter is put on the hovered element itself, and only a small square
   around the pointer is worked on: inside the ball the element is magnified in the middle and bent near the rim,
   with its colours fanning apart there, a darker rim and a highlight; everywhere else it is drawn as it is.
   Safari caches filter results by id, so every move writes a fresh filter with a new id and drops the old one. Phones and reduced motion get nothing; the page-wide version of 2026-10-02 is gone. */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* text: the intro paragraph (its glyphs on a clear ground, so the colours are given as tinted ghosts);
   photo: an opaque picture, whose own red, green and blue are bent by different amounts */
const TARGETS = [
  { selector: '.intro-lines.is-final', kind: 'text' },
  { selector: '.detail-hero.has-image img, .detail-gallery-item.has-image img', kind: 'photo' },
];

const LENS = {
  zoom: .56,      /* the middle shows the element at 1 / .56 ≈ 1.8× */
  rimReach: 1.26, /* at the rim it shows 26 % beyond its own edge */
  curve: 2.2,
  split: [.9, 1.05, 1.2], /* red, green, blue (photo) · pink ghost, glyph, cyan ghost (text) */
  ease: .22,
};
const PAD = 24; /* the filter reaches a little past the element, so nothing at its edge is clipped */

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function canvasOf(size, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  paint(image.data);
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

/* everything the filter draws is baked once per ball size: the bend map, the disc, the rims, the shine */
function makeImages(ball) {
  const size = ball;
  const r = ball / 2;
  const shifts = new Float32Array(size * size * 2);
  let maxShift = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + .5 - r; const dy = y + .5 - r;
      const n = Math.hypot(dx, dy) / r;
      let sx = 0; let sy = 0;
      if (n < 1) {
        const reach = LENS.zoom + (LENS.rimReach - LENS.zoom) * Math.pow(n, LENS.curve);
        sx = dx * (reach - 1); sy = dy * (reach - 1);
      }
      const i = (y * size + x) * 2;
      shifts[i] = sx; shifts[i + 1] = sy;
      maxShift = Math.max(maxShift, Math.abs(sx), Math.abs(sy));
    }
  }
  const scale = Math.max(1, maxShift * 2.02);
  const each = (fn) => (data) => {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const d = Math.hypot(x + .5 - r, y + .5 - r);
        fn(data, (y * size + x) * 4, d, d / r, x, y);
      }
    }
  };
  const map = canvasOf(size, each((data, o, d, n, x, y) => {
    const i = (y * size + x) * 2;
    data[o] = Math.round((.5 + shifts[i] / scale) * 255);
    data[o + 1] = Math.round((.5 + shifts[i + 1] / scale) * 255);
    data[o + 2] = 128; data[o + 3] = 255;
  }));
  /* the ball's outline, softened over a pixel */
  const disc = canvasOf(size, each((data, o, d) => {
    data[o] = 255; data[o + 1] = 255; data[o + 2] = 255;
    data[o + 3] = Math.round((1 - smooth(r - 1, r, d)) * 255);
  }));
  /* rim for a photo: a grey to multiply with, so the edge darkens in the picture's own colour */
  const rim = canvasOf(size, each((data, o, d, n) => {
    const v = 1 - .2 * smooth(.62, .98, n) - .18 * smooth(r - 2.2, r - .3, d);
    const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
    data[o] = c; data[o + 1] = c; data[o + 2] = c; data[o + 3] = 255;
  }));
  /* rim for text: the same shading as a see-through ring (there is no picture under the glyphs to darken) */
  const ring = canvasOf(size, each((data, o, d, n) => {
    const a = .13 * smooth(.62, .98, n) + .2 * smooth(r - 2.2, r - .3, d);
    data[o] = 70; data[o + 1] = 70; data[o + 2] = 80;
    data[o + 3] = Math.round(Math.min(1, a) * 255 * (1 - smooth(r - .4, r, d)));
  }));
  /* the shine: a soft glare up and to the left, a fainter one low on the right */
  const glare = (x, y, cx, cy, rx, ry, rot) => {
    const c = Math.cos(rot); const s = Math.sin(rot);
    const px = (x - cx) * c + (y - cy) * s; const py = -(x - cx) * s + (y - cy) * c;
    return Math.max(0, 1 - Math.hypot(px / rx, py / ry));
  };
  const shine = canvasOf(size, each((data, o, d, n, x, y) => {
    const u = x / size; const v = y / size;
    const a = .5 * Math.pow(glare(u, v, .34, .24, .2, .12, -.32), 1.6) + .16 * Math.pow(glare(u, v, .62, .86, .17, .07, 0), 1.6);
    data[o] = 255; data[o + 1] = 255; data[o + 2] = 255;
    data[o + 3] = n < 1 ? Math.round(Math.min(1, a) * 255) : 0;
  }));
  return { map, disc, rim, ring, shine, scale };
}

/* one filter, for an element of w × h with the ball's square at (x, y) */
function filterMarkup(kind, images, ball, w, h, x, y) {
  const box = `x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ball}" height="${ball}"`;
  const all = `x="${-PAD}" y="${-PAD}" width="${w + PAD * 2}" height="${h + PAD * 2}"`;
  const img = (href, result) => `<feImage href="${href}" ${box} preserveAspectRatio="none" result="${result}"/>`;
  const bend = (scale, result) => `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(images.scale * scale).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" ${box} result="${result}"/>`;
  const matrix = (values, input, result) => `<feColorMatrix in="${input}" type="matrix" values="${values}" ${box} result="${result}"/>`;
  let glass = '';
  if (kind === 'photo') {
    const only = (index) => [0, 1, 2].map((row) => [0, 1, 2, 3, 4].map((col) => (col === row && row === index ? 1 : 0)).join(' ')).join('  ') + '  0 0 0 1 0';
    glass = `${bend(LENS.split[0], 'd0')}${matrix(only(0), 'd0', 'c0')}
      ${bend(LENS.split[1], 'd1')}${matrix(only(1), 'd1', 'c1')}
      ${bend(LENS.split[2], 'd2')}${matrix(only(2), 'd2', 'c2')}
      <feBlend in="c0" in2="c1" mode="screen" ${box} result="c01"/>
      <feBlend in="c01" in2="c2" mode="screen" ${box} result="bent"/>
      ${img(images.rim, 'rim')}
      <feBlend in="bent" in2="rim" mode="multiply" ${box} result="shaded"/>`;
  } else {
    /* glyphs: a pink ghost bent least, a cyan ghost bent most, the real glyph between them on top */
    glass = `${bend(LENS.split[0], 'd0')}${matrix('0 0 0 0 .93  0 0 0 0 .38  0 0 0 0 .66  0 0 0 .85 0', 'd0', 'pink')}
      ${bend(LENS.split[2], 'd2')}${matrix('0 0 0 0 .18  0 0 0 0 .74  0 0 0 0 .92  0 0 0 .85 0', 'd2', 'cyan')}
      ${bend(LENS.split[1], 'glyph')}
      <feMerge ${box} result="bent"><feMergeNode in="cyan"/><feMergeNode in="pink"/><feMergeNode in="glyph"/></feMerge>
      ${img(images.ring, 'ring')}
      <feComposite in="ring" in2="bent" operator="over" ${box} result="shaded"/>`;
  }
  return `${img(images.map, 'map')}${img(images.disc, 'disc')}
    ${glass}
    ${img(images.shine, 'shine')}
    <feComposite in="shine" in2="shaded" operator="over" ${box} result="lit"/>
    <feComposite in="lit" in2="disc" operator="in" ${box} result="ball"/>
    <feComposite in="SourceGraphic" in2="disc" operator="out" ${all} result="rest"/>
    <feComposite in="ball" in2="rest" operator="over" ${all}/>`;
}

export function initCursorLens() {
  if (!finePointer.matches || reducedQuery.matches || document.querySelector('.cursor-lens-defs')) return;
  const ball = Math.round(Math.min(200, Math.max(140, window.innerWidth * .12)));
  const images = makeImages(ball);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'cursor-lens-defs');
  svg.setAttribute('aria-hidden', 'true');
  document.body.append(svg);
  let serial = 0;
  let current = null; /* the <filter> in use */

  let active = null; /* { el, kind, previous } */
  const pointer = { x: 0, y: 0 };
  const at = { x: 0, y: 0 };
  let frame = 0;
  let last = '';

  const release = () => {
    if (!active) return;
    active.el.style.filter = active.previous;
    active = null; last = '';
    current?.remove(); current = null;
  };
  const draw = () => {
    frame = 0;
    if (!active || !active.el.isConnected) { release(); return; }
    at.x += (pointer.x - at.x) * LENS.ease;
    at.y += (pointer.y - at.y) * LENS.ease;
    const rect = active.el.getBoundingClientRect();
    const w = Math.round(rect.width); const h = Math.round(rect.height);
    const x = at.x - rect.left - ball / 2; const y = at.y - rect.top - ball / 2;
    const key = `${w}|${h}|${x.toFixed(1)}|${y.toFixed(1)}`;
    if (key !== last) {
      last = key;
      const next = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      serial += 1;
      next.id = `cursor-lens-${serial}`;
      [['filterUnits', 'userSpaceOnUse'], ['primitiveUnits', 'userSpaceOnUse'], ['color-interpolation-filters', 'sRGB'],
        ['x', -PAD], ['y', -PAD], ['width', w + PAD * 2], ['height', h + PAD * 2]].forEach(([name, value]) => next.setAttribute(name, String(value)));
      next.innerHTML = filterMarkup(active.kind, images, ball, w, h, x, y);
      svg.append(next);
      active.el.style.filter = `url(#${next.id})`;
      const old = current; current = next;
      if (old) requestAnimationFrame(() => old.remove());
    }
    /* keeps following while it eases in, and while the page scrolls under a still pointer */
    frame = requestAnimationFrame(draw);
  };

  const pick = (node) => {
    for (const target of TARGETS) {
      const el = node?.closest?.(target.selector);
      if (el) return { el, kind: target.kind };
    }
    return null;
  };
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    pointer.x = event.clientX; pointer.y = event.clientY;
    const hit = pick(event.target);
    if (!hit) { release(); return; }
    if (!active || active.el !== hit.el) {
      release();
      active = { el: hit.el, kind: hit.kind, previous: hit.el.style.filter || '' };
      at.x = pointer.x; at.y = pointer.y; /* a new element: the ball starts right under the pointer */
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  document.addEventListener('mouseout', (event) => { if (!event.relatedTarget) release(); });
  window.addEventListener('blur', release);
}
