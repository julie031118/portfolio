import { GROUND } from '../ground.js';

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
let instance = null;

function rgbaInk(alpha) {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--ink-2').trim();
  const canvas = document.createElement('canvas').getContext('2d');
  canvas.fillStyle = value;
  const normalized = canvas.fillStyle;
  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1);
    const expanded = hex.length === 3 ? hex.split('').map((x) => x + x).join('') : hex;
    const number = Number.parseInt(expanded, 16);
    return `rgba(${number >> 16},${(number >> 8) & 255},${number & 255},${alpha})`;
  }
  return `rgba(124,128,138,${alpha})`;
}

export function renderContact() {
  instance?.destroy();
  const section = document.querySelector('#contact');
  section.className = 'site-section contact-section';
  section.innerHTML = `
    <div class="contact-reveal-media" aria-hidden="true"><img alt="" src="${GROUND.contact}" decoding="async"></div>
    <canvas class="contact-grid-canvas" aria-hidden="true"></canvas>
    <div class="contact-content">
      <div class="section-heading contact-heading"><span>${SITE.sections.contact.title}</span><span class="section-heading__index">${SITE.contactUi.caption}</span></div>
      <div class="contact-center">
        <h2>${SITE.contactUi.title}</h2>
        <div class="contact-links">
          <a href="mailto:${SITE.profile.email}">${SITE.profile.email}</a>
          <a href="${SITE.profile.linkedin}" target="_blank" rel="noopener noreferrer">${SITE.contactUi.linkedin}</a>
        </div>
      </div>
      <footer class="site-footer"><span>${SITE.contactUi.footerLeft}</span></footer>
    </div>`;

  const reveal = section.querySelector('.contact-reveal-media img');
  const canvas = section.querySelector('.contact-grid-canvas');
  const context = canvas.getContext('2d');
  let width = 1;
  let height = 1;
  let ratio = 1;
  let frame = 0;
  let destroyed = false;
  let interacting = false;
  let lastInteraction = 0;
  let lastDraw = 0;
  let visible = false;
  const pointer = { x: .5, y: .5 };
  const target = { x: .5, y: .5 };
  let quickX = null;
  let quickY = null;
  /* the cursor, tracked on the whole page: scrolling moves the section under a still cursor and fires no
     pointermove, so the reveal is placed from the cursor's last screen position every frame (2026-10-02) */
  const client = { x: 0, y: 0, known: false };
  let inside = false;
  let presence = touchQuery.matches ? 1 : 0; /* how open the reveal is: 0 until the cursor is over the section */
  const dotColor = 'rgba(124,128,138,.4)'; /* the old --ink-2 at .4: the grid keeps its look after the grey text was darkened (2026-10-02) */

  function resize() {
    const rect = section.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function setTarget(clientX, clientY) {
    const rect = section.getBoundingClientRect();
    target.x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    target.y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    interacting = true;
    lastInteraction = performance.now();
    quickX?.(target.x);
    quickY?.(target.y);
  }

  function draw(now) {
    if (destroyed) return;
    if (!visible || now - lastDraw < 33) { frame = requestAnimationFrame(draw); return; }
    lastDraw = now;
    const idle = now - lastInteraction > 1100;
    if (!touchQuery.matches) {
      const rect = section.getBoundingClientRect();
      const nowInside = client.known && client.x >= rect.left && client.x <= rect.right && client.y >= rect.top && client.y <= rect.bottom;
      if (nowInside) {
        const tx = (client.x - rect.left) / rect.width, ty = (client.y - rect.top) / rect.height;
        /* entering: the reveal opens right under the cursor instead of travelling in from the centre */
        if (!inside) { pointer.x = tx; pointer.y = ty; if (quickX) { gsap.set(pointer, { x: tx, y: ty }); } }
        if (tx !== target.x || ty !== target.y) { target.x = tx; target.y = ty; quickX?.(tx); quickY?.(ty); }
      }
      inside = nowInside;
      presence += ((inside ? 1 : 0) - presence) * .2;
      if (presence < .01) presence = 0;
    }
    if (touchQuery.matches && idle && !reducedQuery.matches) {
      const phase = (now % 8000) / 8000 * Math.PI * 2;
      target.x = .5 + Math.sin(phase) * .25 + Math.sin(phase * 2.13) * .06;
      target.y = .5 + Math.cos(phase * .83) * .2 + Math.sin(phase * 1.71) * .05;
      pointer.x += (target.x - pointer.x) * .022;
      pointer.y += (target.y - pointer.y) * .022;
    } else if (!quickX) {
      pointer.x += (target.x - pointer.x) * .16;
      pointer.y += (target.y - pointer.y) * .16;
    }
    if (reducedQuery.matches) { pointer.x = .5; pointer.y = .5; }
    const px = pointer.x * width;
    const py = pointer.y * height;
    const cell = 22;
    const revealRadius = Math.min(width, height) * (touchQuery.matches ? .26 : .22) * presence;
    /* The section itself is the page's vellum ground. The pointer opens a grid of little windows in the paper,
       each showing the sharp photograph that lies (blurred) under the whole section. */
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, width, height);
    if (presence > 0 && reveal.complete && reveal.naturalWidth) {
      const iw = reveal.naturalWidth, ih = reveal.naturalHeight;
      const scale = Math.max(width / iw, height / ih) * 1.16; /* same over-scan as the ground photo */
      const dw = iw * scale, dh = ih * scale;
      const ox = (width - dw) / 2, oy = (height - dh) / 2;
      for (let y = cell / 2; y < height; y += cell) {
        for (let x = cell / 2; x < width; x += cell) {
          const distance = Math.hypot(x - px, y - py);
          const openness = Math.max(0, Math.min(1, 1 - (distance - revealRadius * .28) / (revealRadius * .72)));
          if (openness <= 0) continue;
          const size = Math.max(0, (cell - 2) * openness);
          const dx = x - size / 2, dy = y - size / 2;
          context.drawImage(reveal, (dx - ox) / scale, (dy - oy) / scale, size / scale, size / scale, dx, dy, size, size);
        }
      }
    }
    context.fillStyle = dotColor;
    for (let y = cell / 2; y < height; y += cell) {
      for (let x = cell / 2; x < width; x += cell) {
        if (Math.hypot(x - px, y - py) < revealRadius * .92) continue;
        context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2); context.fill();
      }
    }
    frame = requestAnimationFrame(draw);
  }

  if (window.gsap && !reducedQuery.matches) {
    quickX = gsap.quickTo(pointer, 'x', { duration: .45, ease: 'power3.out' });
    quickY = gsap.quickTo(pointer, 'y', { duration: .45, ease: 'power3.out' });
  }
  const onPointer = (event) => { if (event.pointerType === 'touch') return; client.x = event.clientX; client.y = event.clientY; client.known = true; };
  const onLeavePage = (event) => { if (!event.relatedTarget) client.known = false; };
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('mouseout', onLeavePage);
  section.addEventListener('pointerdown', (event) => { if (touchQuery.matches) setTarget(event.clientX, event.clientY); }, { passive: true });
  section.addEventListener('touchmove', (event) => { const touch = event.touches[0]; if (touch) setTarget(touch.clientX, touch.clientY); }, { passive: true });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(section);
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
  visibilityObserver.observe(section);
  resize();
  frame = requestAnimationFrame(draw);

  instance = {
    getPointer: () => ({ x: pointer.x, y: pointer.y }),
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('mouseout', onLeavePage);
    },
  };
  window.__contactStage = instance;
  return instance;
}
