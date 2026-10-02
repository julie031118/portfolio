import { releaseWebGL } from './render-shell.js';
const GRID_SIZE = 128;
const mobileQuery = window.matchMedia('(max-width: 768px), (hover: none)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let instance = null;

function cssColor(token) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeTextCanvas(width, height, data) {
  const scale = Math.min(2, 2048 / Math.max(width, 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  context.scale(scale, scale);
  /* transparent ground: the vellum photo shows through around the letters */
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = cssColor('--ink');
  const titleSize = clamp(width * .145, 64, 230);
  context.font = `400 ${titleSize}px Gelasio, Georgia, serif`;
  context.fillText(data.title, width / 2, height / 2 - titleSize * .18);
  context.font = '11px "Nanum Gothic Coding", "Courier New", monospace';
  context.letterSpacing = '.1em';
  context.fillText(data.disciplines, width / 2, height / 2 + titleSize * .62);
  return canvas;
}

function createFluid(THREE) {
  /* A small velocity field, fully re-simulated every frame (128² cells ≈ 1 ms). The old version
     only advanced 16 rows per frame and damped each row by ~80 % on every visit, so a stroke had
     faded to nothing by the time its rows reached the texture — the glass looked static. */
  const size = GRID_SIZE;
  let velocityX = new Float32Array(size * size);
  let velocityY = new Float32Array(size * size);
  let scratchX = new Float32Array(size * size);
  let scratchY = new Float32Array(size * size);
  const pixels = new Uint8Array(size * size * 4);
  for (let index = 0; index < size * size; index += 1) {
    const offset = index * 4;
    pixels[offset] = 128;
    pixels[offset + 1] = 128;
    pixels[offset + 2] = 0;
    pixels[offset + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  function inject(u, v, dx, dy, radius = 12, gain = 1.6) {
    if (!velocityX) return;
    const centerX = clamp(Math.round(u * (size - 1)), 0, size - 1);
    const centerY = clamp(Math.round(v * (size - 1)), 0, size - 1);
    const minX = Math.max(1, centerX - radius);
    const maxX = Math.min(size - 2, centerX + radius);
    const minY = Math.max(1, centerY - radius);
    const maxY = Math.min(size - 2, centerY + radius);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance > radius) continue;
        const weight = Math.pow(1 - distance / radius, 2);
        const index = y * size + x;
        velocityX[index] = clamp(velocityX[index] + dx * gain * weight, -64, 64);
        velocityY[index] = clamp(velocityY[index] - dy * gain * weight, -64, 64);
      }
    }
  }

  function step(delta) {
    if (!velocityX) return 0;
    const dt = Math.min(Math.max(delta, .004), .05);
    const decay = Math.exp(-1.0 * dt);    /* ~37 % left after one second — a stroke lingers, then settles */
    const blend = Math.min(.5, 9 * dt);   /* viscosity: neighbours pull on each other */
    let peak = 0;
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const index = y * size + x;
        /* semi-Lagrangian advection: look upstream along the local velocity */
        const backX = clamp(x - velocityX[index] * dt * 1.2, 0, size - 1);
        const backY = clamp(y - velocityY[index] * dt * 1.2, 0, size - 1);
        const x0 = Math.floor(backX);
        const y0 = Math.floor(backY);
        const x1 = Math.min(size - 1, x0 + 1);
        const y1 = Math.min(size - 1, y0 + 1);
        const fx = backX - x0;
        const fy = backY - y0;
        const i00 = y0 * size + x0;
        const i10 = y0 * size + x1;
        const i01 = y1 * size + x0;
        const i11 = y1 * size + x1;
        const advectedX = (velocityX[i00] * (1 - fx) + velocityX[i10] * fx) * (1 - fy) + (velocityX[i01] * (1 - fx) + velocityX[i11] * fx) * fy;
        const advectedY = (velocityY[i00] * (1 - fx) + velocityY[i10] * fx) * (1 - fy) + (velocityY[i01] * (1 - fx) + velocityY[i11] * fx) * fy;
        const averageX = (velocityX[index - 1] + velocityX[index + 1] + velocityX[index - size] + velocityX[index + size]) * .25;
        const averageY = (velocityY[index - 1] + velocityY[index + 1] + velocityY[index - size] + velocityY[index + size]) * .25;
        const nextX = (advectedX * (1 - blend) + averageX * blend) * decay;
        const nextY = (advectedY * (1 - blend) + averageY * blend) * decay;
        scratchX[index] = nextX;
        scratchY[index] = nextY;
        const magnitude = Math.abs(nextX) + Math.abs(nextY);
        if (magnitude > peak) peak = magnitude;
        const offset = index * 4;
        pixels[offset] = clamp(Math.round(128 + nextX * 1.98), 0, 255);
        pixels[offset + 1] = clamp(Math.round(128 + nextY * 1.98), 0, 255);
      }
    }
    [velocityX, scratchX] = [scratchX, velocityX];
    [velocityY, scratchY] = [scratchY, velocityY];
    texture.needsUpdate = true;
    return peak;
  }

  function dispose() {
    texture.dispose();
    velocityX = null;
    velocityY = null;
    scratchX = null;
    scratchY = null;
  }

  return { texture, inject, step, dispose };
}

async function createRenderer(section, data) {
  if (mobileQuery.matches || reducedQuery.matches) return null;
  const THREE = await import('../vendor/three.module.min.js');
  await document.fonts.ready;
  if (!section.isConnected || mobileQuery.matches || reducedQuery.matches) return null;

  const wrap = section.querySelector('.name-canvas-wrap');
  const canvas = document.createElement('canvas');
  canvas.className = 'name-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.replaceChildren(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: false, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  window.__webglLog?.push({ section: 'NAME', action: 'create', time: performance.now() });
  const gl = renderer.getContext();
  const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const rendererName = rendererInfo ? gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL) : '';
  if (!window.__FORCE_GL && /swiftshader|llvmpipe|software/i.test(rendererName)) {
    renderer.dispose();
    renderer.forceContextLoss();
    window.__webglLog?.push({ section: 'NAME', action: 'dispose', time: performance.now(), reason: 'software-fallback' });
    wrap.replaceChildren();
    section.classList.add('name-static', 'is-software-fallback');
    section.dataset.gl = 'software fallback';
    releaseWebGL(instance); /* give the context back (the Work ring was disposed to make room) */
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const fluid = createFluid(THREE);
  const uniforms = {
    uText: { value: null },
    uFluid: { value: fluid.texture },
    uTexel: { value: new THREE.Vector2(1 / GRID_SIZE, 1 / GRID_SIZE) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPaper: { value: new THREE.Color(cssColor('--paper')) },
    uInk2: { value: new THREE.Color('#7C808A') }, /* the old --ink-2: the glass shading keeps its tone after the grey text was darkened (2026-10-02) */
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uText;
      uniform sampler2D uFluid;
      uniform vec2 uTexel;
      uniform vec2 uResolution;
      uniform vec3 uPaper;
      uniform vec3 uInk2;
      varying vec2 vUv;
      vec2 flowAt(vec2 uv){ return (texture2D(uFluid, uv).rg - .50196) * 2.0; }
      void main(){
        vec2 flow = flowAt(vUv);
        float height = length(flow);
        float heightX = length(flowAt(vUv + vec2(uTexel.x, 0.0)));
        float heightY = length(flowAt(vUv + vec2(0.0, uTexel.y)));
        vec2 gradient = vec2(height - heightX, height - heightY) * 8.0;
        float activity = smoothstep(.015, .72, height);
        vec2 direction = flow * .7 + gradient;
        float directionLength = max(length(direction), .0001);
        direction /= max(1.0, directionLength);
        float amplitude = mix(0.0, 34.0, activity);
        vec2 offset = direction * amplitude / uResolution;
        vec4 base = texture2D(uText, clamp(vUv + offset, vec2(0.0), vec2(1.0)));
        vec3 normal = normalize(vec3(-gradient * 2.2, 1.0));
        float specular = pow(max(dot(normal, normalize(vec3(-.35, .45, 1.0))), 0.0), 18.0) * .16 * activity;
        float shade = clamp(dot(normal.xy, vec2(.55, -.45)), -.5, .5) * .08 * activity;
        vec3 color = mix(base.rgb, uPaper, specular);
        color = mix(color, uInk2, max(shade, 0.0));
        /* glass highlights/shade also show on the empty paper, faintly */
        float hlA = clamp(specular * 1.8, 0.0, 0.7);
        float shA = clamp(max(shade, 0.0) * 1.4, 0.0, 0.45);
        vec3 glass = mix(uInk2, uPaper, hlA / max(hlA + shA, 0.0001));
        float glassA = max(hlA, shA);
        gl_FragColor = vec4(mix(glass, color, base.a), max(base.a, glassA));
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let textTexture = null;
  let frame = 0;
  let disposed = false;
  let lastTime = performance.now();
  let lastFluidTime = 0;
  let activeUntil = 0;
  let needsRender = true;
  let activity = 0;
  let lastPointerX = null;
  let lastPointerY = null;

  function resize() {
    if (disposed) return;
    const rect = section.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width, height);
    textTexture?.dispose();
    textTexture = new THREE.CanvasTexture(makeTextCanvas(width, height, data));
    textTexture.colorSpace = THREE.SRGBColorSpace;
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;
    uniforms.uText.value = textTexture;
    needsRender = true;
  }

  function pointerMove(event) {
    const rect = section.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    if (lastPointerX !== null) fluid.inject((x - rect.left) / rect.width, 1 - (y - rect.top) / rect.height, clamp(x - lastPointerX, -24, 24), clamp(y - lastPointerY, -24, 24), 11, 1.4);
    activeUntil = performance.now() + 1500;
    needsRender = true;
    lastPointerX = x;
    lastPointerY = y;
  }

  function pointerLeave() {
    lastPointerX = null;
    lastPointerY = null;
  }

  /* idle drift: when nobody is stirring, a slow current keeps the glass alive (so it never reads as a static image) */
  let idleAt = 0;
  let idlePhase = Math.random() * Math.PI * 2;
  function idleStir(now) {
    if (now < activeUntil || now - idleAt < 90) return;
    idleAt = now;
    idlePhase += .035;
    const u = .5 + Math.cos(idlePhase) * .34;
    const v = .5 + Math.sin(idlePhase * 1.37) * .22;
    fluid.inject(u, v, Math.cos(idlePhase + 1.2) * 3.6, Math.sin(idlePhase * .8) * 2.6, 22, 1.3);
    needsRender = true;
  }

  /* entrance: the first time the name scrolls into view a hand sweeps across it, so even someone who
     never moves the pointer sees the glass move */
  let splashAt = 0;
  let splashed = false;
  function splash(now) {
    if (!splashed) { splashed = true; splashAt = now; }
    const t = (now - splashAt) / 1900;
    if (t > 1) return false;
    const u = .08 + t * .84;
    const v = .5 + Math.sin(t * Math.PI * 2.2) * .16;
    fluid.inject(u, v, 14, Math.cos(t * Math.PI * 2.2) * 6, 26, 1.5);
    needsRender = true;
    return true;
  }

  function render(now) {
    if (disposed) return;
    const rect = section.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    const splashing = visible && !reducedQuery.matches && rect.top < window.innerHeight * .72 && (!splashed || now - splashAt < 1900) && splash(now);
    if (visible && !reducedQuery.matches && !splashing) idleStir(now);
    if (visible && (needsRender || now < activeUntil || activity > .4)) {
      const delta = Math.min((now - (lastFluidTime || lastTime)) / 1000, .05);
      lastFluidTime = now;
      activity = fluid.step(delta);
      renderer.render(scene, camera);
      needsRender = false;
    }
    lastTime = now;
    frame = requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(section);
  section.addEventListener('pointermove', pointerMove, { passive: true });
  section.addEventListener('pointerleave', pointerLeave, { passive: true });
  resize();
  section.classList.add('is-webgl');
  section.dataset.gl = `glass on · ${rendererName || 'gpu'}`;
  frame = requestAnimationFrame(render);

  return {
    getActivity() {
      return activity;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      section.removeEventListener('pointermove', pointerMove);
      section.removeEventListener('pointerleave', pointerLeave);
      fluid.dispose();
      textTexture?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      window.__webglLog?.push({ section: 'NAME', action: 'dispose', time: performance.now() });
      wrap.replaceChildren();
      section.classList.remove('is-webgl');
      section.dataset.gl = 'off';
      releaseWebGL(instance);
    },
  };
}

export function renderName(lang) {
  if (instance) {
    instance.setLanguage(lang);
    return instance;
  }
  const section = document.querySelector('#name');
  section.classList.add('name-section');
  section.innerHTML = `
    <div class="name-canvas-wrap"></div>
    <div class="name-copy">
      <h2 class="name-title"></h2>
      <p class="name-disciplines"></p>
    </div>
    <div class="name-glass-layer" aria-hidden="true"></div>
    <p class="name-caption"></p>`;

  const data = SITE.name;
  const title = section.querySelector('.name-title');
  const disciplines = section.querySelector('.name-disciplines');
  const caption = section.querySelector('.name-caption');
  let activeRenderer = null;
  let initializing = false;

  function setLanguage() {
    title.textContent = data.title;
    disciplines.textContent = data.disciplines;
    caption.textContent = data.caption;
  }

  instance = {
    setLanguage,
    getActivity() {
      return activeRenderer?.getActivity() || 0;
    },
    dispose() {
      /* clear the reference first: the renderer's dispose fires portfolio:webgl-free synchronously */
      const renderer = activeRenderer;
      activeRenderer = null;
      renderer?.dispose();
    },
  };
  window.__nameStage = instance;
  setLanguage(lang);

  if (mobileQuery.matches || reducedQuery.matches) {
    section.classList.add('name-static');
    return instance;
  }

  let visible = false;
  async function ensureGlass() {
    if (activeRenderer || initializing || !visible) return;
    initializing = true;
    const created = await createRenderer(section, data);
    initializing = false;
    if (!created) return;
    if (!visible) { created.dispose(); return; }
    activeRenderer = created;
    window.__activeWebGLController = instance;
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) ensureGlass();
    else { const renderer = activeRenderer; activeRenderer = null; renderer?.dispose(); }
  }, { rootMargin: '-10% 0px -10% 0px', threshold: 0 });
  observer.observe(section);
  instance.observer = observer;
  /* the Work ring or the photo lens may take the context while NAME is on screen — retake it once freed */
  window.addEventListener('portfolio:webgl-free', () => { if (visible && !activeRenderer) ensureGlass(); });
  return instance;
}
