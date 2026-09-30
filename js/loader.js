import { storageGet, storageSet } from './sections/render-shell.js';
import { unlockAudio } from './audio.js';
import { GROUND } from './ground.js';

const SESSION_KEY = 'yeonseo-loader-seen';
const mobileQuery = window.matchMedia('(max-width: 768px), (hover: none)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
/* Torn edge: an organic contour (three overlapping low-frequency waves) with fine per-point jitter,
   emitted as a smooth curve. The fibrous look comes from the SVG filters on the rim strokes. */
const TEAR_POINTS = 110;
const OPEN_RATIO = .34; /* final hole size as a share of the viewport diagonal */
const jitter = Array.from({ length: TEAR_POINTS }, (_, i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 - .5);
function tearPath(cx, cy, rx, ry) {
  const pts = [];
  for (let i = 0; i < TEAR_POINTS; i += 1) {
    const a = Math.PI * 2 * i / TEAR_POINTS;
    const wave = 1 + .12 * Math.sin(3 * a + .8) + .08 * Math.sin(5 * a + 2.1) + .05 * Math.sin(8 * a + .3) + .03 * Math.sin(13 * a + 1.7) + .02 * Math.sin(21 * a + .9);
    const notch = jitter[i] > .42 ? -.06 : 0; /* the odd deeper nick */
    const r = wave + jitter[i] * .035 + notch;
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  /* Catmull-Rom → cubic Bézier, closed */
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

function buildLoader(loader) {
  const label = mobileQuery.matches ? SITE.loader.tap : SITE.loader.drag;
  loader.innerHTML = `
    <div class="loader-scene" aria-hidden="true">
      <div class="loader-reveal-wrap"><img class="loader-reveal" alt="" src="${GROUND.intro}"></div>
    </div>
    <svg class="loader-sheet-svg" aria-hidden="true">
      <defs>
        <mask id="loader-tear-mask"><rect class="loader-mask-base"/><path class="loader-mask-hole"/></mask>
        <clipPath id="loader-hole-clip"><path class="loader-hole-clip-path"/></clipPath>
        <filter id="loader-fiber" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".055 .11" numOctaves="3" seed="7" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="loader-fiber-fine" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".35 .6" numOctaves="2" seed="3" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="loader-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <foreignObject class="loader-sheet-object" mask="url(#loader-tear-mask)"><div xmlns="http://www.w3.org/1999/xhtml" class="loader-sheet-panel"></div></foreignObject>
      <g clip-path="url(#loader-hole-clip)">
        <path class="loader-tear-shadow"/>
      </g>
      <path class="loader-tear-rim-soft"/>
      <path class="loader-tear-rim"/>
      <path class="loader-tear-rim-fine"/>
      <path class="loader-tear-edge"/>
    </svg>
    <p class="loader-caption">${label}</p>`;
}

function configureSvg(loader, cx, cy, ratio = 0) {
  const svg = loader.querySelector('.loader-sheet-svg');
  const rect = loader.getBoundingClientRect();
  const width = Math.max(rect.width, window.innerWidth);
  const height = Math.max(rect.height, window.innerHeight);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const base = loader.querySelector('.loader-mask-base');
  const object = loader.querySelector('.loader-sheet-object');
  base.setAttribute('width', width);
  base.setAttribute('height', height);
  base.setAttribute('fill', 'white');
  object.setAttribute('width', width);
  object.setAttribute('height', height);
  const radius = Math.hypot(width, height) * ratio;
  const path = tearPath(cx, cy, Math.max(radius * .72, .5), Math.max(radius * .52, .5));
  loader.querySelector('.loader-mask-hole').setAttribute('d', path);
  loader.querySelector('.loader-mask-hole').setAttribute('fill', 'black');
  ['.loader-hole-clip-path', '.loader-tear-shadow', '.loader-tear-rim-soft', '.loader-tear-rim', '.loader-tear-rim-fine', '.loader-tear-edge'].forEach((selector) => loader.querySelector(selector).setAttribute('d', path));
}

/* The torn-paper opener is retired (2026-10): the site opens straight on the intro. Flip to true to bring it back. */
const LOADER_ENABLED = false;

export function initLoader({ host, onComplete, onGesture }) {
  const loader = document.querySelector('#loader');
  if (!LOADER_ENABLED) {
    loader?.remove();
    document.body.classList.remove('is-loading');
    storageSet('sessionStorage', SESSION_KEY, '1');
    onComplete?.();
    return { tear() {} };
  }
  buildLoader(loader);
  const center = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  let origin = center();
  let start = null;
  let complete = false;
  let autoTimer = 0;

  document.body.classList.add('is-loading');
  const settle = () => {
    complete = true;
    const release = () => document.body.classList.remove('is-loading');
    if (start) window.addEventListener('pointerup', release, { once: true }); else release();
    storageSet('sessionStorage', SESSION_KEY, '1');
    /* the sheet has done its job — it fades away and the intro is text alone */
    loader.classList.add('is-done');
    const remove = () => { loader.remove(); };
    if (reducedQuery.matches) remove(); else window.setTimeout(remove, 900);
    onComplete?.();
  };

  const tear = (point = center(), instant = false, duration = .74) => {
    if (complete || loader.classList.contains('is-tearing')) return;
    clearTimeout(autoTimer);
    origin = point;
    loader.classList.add('is-tearing');
    const frames = Array.from({ length: 46 }, (_, index) => {
      const t = index / 45;
      const eased = 1 - Math.pow(1 - t, 3);
      return eased + Math.sin(Math.PI * eased) * .045;
    });
    if (instant || reducedQuery.matches) {
      configureSvg(loader, origin.x, origin.y, OPEN_RATIO);
      loader.classList.add('is-open');
      settle();
      return;
    }
    const state = { frame: 0 };
    gsap.to(state, {
      frame: frames.length - 1,
      duration,
      ease: 'power3.out',
      onUpdate: () => configureSvg(loader, origin.x, origin.y, frames[Math.round(state.frame)] * OPEN_RATIO),
      onComplete: () => {
        loader.classList.add('is-open');
        settle();
      },
    });
  };

  if (storageGet('sessionStorage', SESSION_KEY) === '1' || reducedQuery.matches) {
    configureSvg(loader, origin.x, origin.y, OPEN_RATIO);
    loader.classList.add('is-open');
    settle();
  } else {
    configureSvg(loader, origin.x, origin.y, 0);
    autoTimer = window.setTimeout(() => tear(center(), false, .45), 1500);
  }

  loader.addEventListener('pointerdown', async (event) => {
    if (complete) return;
    event.preventDefault();
    start = { x: event.clientX, y: event.clientY, pointerType: event.pointerType };
    loader.setPointerCapture?.(event.pointerId);
    await unlockAudio();
    onGesture?.();
  });
  loader.addEventListener('pointermove', (event) => {
    if (!start || complete || start.pointerType === 'touch') return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 120) tear(start);
  });
  loader.addEventListener('pointerup', (event) => {
    if (!start || complete) return;
    if (start.pointerType === 'touch' || Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 120) tear(start);
    start = null;
  });
  window.addEventListener('resize', () => { if (!loader.isConnected) return; configureSvg(loader, complete ? window.innerWidth / 2 : origin.x, complete ? window.innerHeight / 2 : origin.y, complete ? OPEN_RATIO : 0); }, { passive: true });
  window.__stage1Tear = tear;
  return { tear };
}
