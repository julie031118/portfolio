/* A round glass lens that follows the pointer over the whole page, after Codrops' "Progressively Enhanced WebGL
   Lens Refraction" (2023): whatever sits under it (text, photos, the ring, a project page) is magnified in the
   middle, bent near the rim and split a little into red / green / blue there.
   The page here is plain HTML, so instead of re-drawing everything in WebGL the lens refracts the live page
   itself: a backdrop-filter runs an SVG displacement map (one per colour channel) over what is behind the circle.
   Progressive enhancement, like the original: Chrome and Edge get the refraction; a browser that cannot run an
   SVG filter as a backdrop (Safari, Firefox) gets the same glass bead without the bend; phones and
   reduced motion get nothing. It never takes a click (pointer-events: none). (2026-10-02) */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* a glass ball rather than a flat magnifier (2026-10-03: the first version read as 2D next to the original):
   the middle is strongly magnified, and towards the rim the ball looks further and further OUT, squeezing the
   page around it into a thin bent band, the way a sphere does; the colours fan apart in that band */
const LENS = {
  zoom: .56,     /* the middle shows the page at 1 / .56 ≈ 1.8× */
  rimReach: 1.26, /* at the rim it shows the page 26 % beyond its own edge */
  curve: 2.2,    /* how the look-out grows from the middle to the rim */
  split: [.9, 1.05, 1.2], /* red, green, blue: how far each colour is bent, relative to the map */
  margin: 1.42,  /* the filtered square is this much wider than the ball, so the rim can look outside it */
  ease: .2,      /* how closely it trails the pointer */
};

/* the displacement map: for each pixel, where to look on the page (R = x, G = y, 0.5 = stay put) */
function makeMap(size, ball) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  const centre = size / 2;
  const radius = ball / 2;
  let maxShift = 0;
  const shifts = new Float32Array(size * size * 2);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + .5 - centre; const dy = y + .5 - centre;
      const n = Math.hypot(dx, dy) / radius;
      let sx = 0; let sy = 0;
      if (n < 1) {
        const reach = LENS.zoom + (LENS.rimReach - LENS.zoom) * Math.pow(n, LENS.curve);
        sx = dx * (reach - 1); sy = dy * (reach - 1);
      }
      const index = (y * size + x) * 2;
      shifts[index] = sx; shifts[index + 1] = sy;
      maxShift = Math.max(maxShift, Math.abs(sx), Math.abs(sy));
    }
  }
  const scale = Math.max(1, maxShift * 2.02);
  for (let index = 0; index < size * size; index += 1) {
    const offset = index * 4;
    image.data[offset] = Math.round((.5 + shifts[index * 2] / scale) * 255);
    image.data[offset + 1] = Math.round((.5 + shifts[index * 2 + 1] / scale) * 255);
    image.data[offset + 2] = 128;
    image.data[offset + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return { url: canvas.toDataURL('image/png'), scale };
}

/* the rim, as a grey mask multiplied onto the bent page inside the filter: the edge darkens in the page's own
   colour (an overlay on top tinted it a cold grey and looked pasted on), ending in a soft dark hairline */
function makeRim(size, ball) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  const centre = size / 2;
  const radius = ball / 2;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x + .5 - centre, y + .5 - centre);
      const n = distance / radius;
      let value = 1;
      if (n < 1) value = 1 - .2 * smooth(.62, .98, n) - .18 * smooth(radius - 2.2, radius - .3, distance) / 1;
      else value = 1 - .3 * (1 - smooth(radius, radius + 1.4, distance)); /* the hairline fades out over a pixel and a half */
      const v = Math.round(Math.max(0, Math.min(1, value)) * 255);
      const offset = (y * size + x) * 4;
      image.data[offset] = v; image.data[offset + 1] = v; image.data[offset + 2] = v; image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function isChromium() {
  const brands = navigator.userAgentData?.brands;
  if (brands) return brands.some((entry) => /Chromium/i.test(entry.brand));
  return /Chrome\/|Edg\//.test(navigator.userAgent);
}

export function initCursorLens() {
  if (!finePointer.matches || reducedQuery.matches || document.querySelector('.cursor-lens')) return;
  const ball = Math.round(Math.min(220, Math.max(150, window.innerWidth * .13)));
  const size = Math.round(ball * LENS.margin / 2) * 2; /* the filtered square around the ball */
  const lens = document.createElement('div');
  lens.className = 'cursor-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.style.width = `${size}px`; lens.style.height = `${size}px`;
  lens.style.setProperty('--ball', `${ball}px`);
  /* glass (the bent page) · rim (darkens the bent page itself at the edge, so it keeps the page's own colour) · shine */
  lens.innerHTML = '<div class="cursor-lens-glass"></div><div class="cursor-lens-rim"></div><div class="cursor-lens-ball"></div>';

  if (isChromium()) {
    const { url, scale } = makeMap(size, ball);
    /* each colour is displaced by its own amount, then kept on its own channel and the three are added back */
    const channel = (name, index) => {
      const rows = [0, 1, 2].map((row) => [0, 1, 2, 3, 4].map((col) => (col === row && row === index ? 1 : 0)).join(' '));
      return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(scale * LENS.split[index]).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="d${name}"/>
        <feColorMatrix in="d${name}" type="matrix" values="${rows.join('  ')}  0 0 0 1 0" result="${name}"/>`;
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'cursor-lens-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<filter id="cursor-lens-refract" x="0" y="0" width="${size}" height="${size}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${url}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="none" result="map"/>
        ${channel('r', 0)}${channel('g', 1)}${channel('b', 2)}
        <feBlend in="r" in2="g" mode="screen" result="rg"/>
        <feBlend in="rg" in2="b" mode="screen" result="bent"/>
        <feImage href="${makeRim(size, ball)}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="none" result="rim"/>
        <feBlend in="bent" in2="rim" mode="multiply"/>
      </filter>`;
    document.body.append(svg);
    lens.classList.add('is-refracting');
  }
  document.body.append(lens);

  const target = { x: -999, y: -999 };
  const at = { x: -999, y: -999 };
  let shown = false;
  let frame = 0;
  const place = () => { lens.style.transform = `translate3d(${(at.x - size / 2).toFixed(1)}px, ${(at.y - size / 2).toFixed(1)}px, 0)`; };
  const tick = () => {
    at.x += (target.x - at.x) * LENS.ease;
    at.y += (target.y - at.y) * LENS.ease;
    place();
    frame = Math.abs(target.x - at.x) + Math.abs(target.y - at.y) > .2 ? requestAnimationFrame(tick) : 0;
  };
  const move = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    target.x = event.clientX; target.y = event.clientY;
    if (!shown) { at.x = target.x; at.y = target.y; place(); shown = true; lens.classList.add('is-on'); }
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const hide = () => { shown = false; lens.classList.remove('is-on'); };
  window.addEventListener('pointermove', move, { passive: true });
  /* leaving the window, or going into an embedded player (YouTube, Drive) that keeps the pointer to itself */
  document.addEventListener('mouseout', (event) => { if (!event.relatedTarget || event.relatedTarget.tagName === 'IFRAME') hide(); });
  window.addEventListener('blur', hide);
  finePointer.addEventListener?.('change', () => { if (!finePointer.matches) hide(); });
}
