import { T } from './render-shell.js';
import { openDetail } from './detail.js';
import { releaseWebGL } from './render-shell.js';

/* SELECTED WORK — ring of the 12 featured projects (vanilla Three.js).
   Motion reference: Codrops "Scroll-Driven 3D Image Tube" (MIT) — scroll adds
   rotation with inertial damping, hover slows, DOM tooltip, object slot in the middle. */

const mobileQuery = window.matchMedia('(max-width: 768px), (hover: none)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
let instance = null;

function featuredProjects() {
  return PROJECTS.filter((p) => Number.isFinite(p.featured)).sort((a, b) => a.featured - b.featured).slice(0, 12);
}
function isPlaceholderPath(source) { return !source || /\/images\/x\.jpg$|\/images\/projects\/x\//.test(source); }
function normalizeSource(source) { return source?.startsWith('/') ? source.slice(1) : source; }
function cssColor(token) { return getComputedStyle(document.documentElement).getPropertyValue(token).trim(); }
function pad(n) { return String(n).padStart(2, '0'); }

function placeholderCanvas(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 384; canvas.height = 512;
  const c = canvas.getContext('2d');
  c.fillStyle = cssColor('--placeholder') || '#D9DBE0';
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.strokeStyle = cssColor('--ink-2') || '#7C808A';
  c.setLineDash([4, 5]); c.lineWidth = 2; c.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  c.fillStyle = cssColor('--ink-2') || '#7C808A';
  c.font = '22px "Nanum Gothic Coding", "Courier New", monospace';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(label, canvas.width / 2, canvas.height / 2);
  return canvas;
}

/* Same cool, low-saturation register as the archive cards (CSS filter there; baked into the texture here). */
function tonedTexture(THREE, source, saturation = .72) {
  const image = source.image;
  if (!image || !image.width) return source;
  const max = 1024;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const c = canvas.getContext('2d', { willReadFrequently: true });
  c.drawImage(image, 0, 0, canvas.width, canvas.height);
  try {
    const data = c.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const l = px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114;
      px[i] = l + (px[i] - l) * saturation;
      px[i + 1] = l + (px[i + 1] - l) * saturation;
      px[i + 2] = l + (px[i + 2] - l) * saturation;
    }
    c.putImageData(data, 0, 0);
  } catch { return source; }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = source.colorSpace;
  texture.anisotropy = source.anisotropy;
  source.dispose();
  return texture;
}

function coverTexture(THREE, texture, aspect) {
  const image = texture.image;
  const imageAspect = image && image.width ? image.width / image.height : aspect;
  if (imageAspect > aspect) { const r = aspect / imageAspect; texture.repeat.set(r, 1); texture.offset.set((1 - r) / 2, 0); }
  else { const r = imageAspect / aspect; texture.repeat.set(1, r); texture.offset.set(0, (1 - r) / 2); }
  texture.needsUpdate = true;
}

let modelPromise = null;

async function createRing(section, projects, lang, onDispose) {
  /* contexts coexist now — the ring, the NAME glass and the photo lens each own their own; disposing one another caused ping-pong */
  const THREE = await import('../vendor/three.module.min.js');
  if (!section.isConnected || mobileQuery.matches) return null;

  const wrap = section.querySelector('.work-canvas-wrap');
  /* a context that was force-lost cannot be reused: always start from a fresh canvas */
  const canvas = document.createElement('canvas');
  canvas.className = 'work-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.querySelector('.work-canvas')?.replaceWith(canvas);
  const tooltip = section.querySelector('.work-tooltip');
  const indexButtons = [...section.querySelectorAll('.work-index button')];
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  /* no tone mapping: the porcelain keeps the texture's own blue; the room light is dialled down instead */
  renderer.toneMapping = THREE.NoToneMapping;
  window.__webglLog?.push({ section: 'WORK', action: 'create', time: performance.now() });
  window.__workNote?.('ring ok · obj loading');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 13);
  camera.lookAt(0, 0, 0);

  const ring = new THREE.Group();
  ring.rotation.x = -0.5; /* tilt: bottom of the ring comes toward the viewer (TILT below) */
  scene.add(ring);

  /* the object in the middle of the ring — 연서's broken-plate flower (Tripo GLB). It sits at the
     ring's centre, lit by a room environment, turning gently with the pointer; the ring's near cards
     pass in front of it and the far cards behind (painter's order by depth, like the cards). */
  const OBJECT_URL = window.REVIEW_MODEL || SITE.workUi?.objectModel || 'models/plate-flower.glb';
  /* parsed once per page; every ring instance clones it */
  modelPromise ||= (async () => {
    const { GLTFLoader } = await import('../vendor/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync(OBJECT_URL);
    return gltf.scene;
  })();
  const OBJECT_SIZE = 6.0; /* world units, longest side — the centrepiece, larger than a card */
  const pivot = new THREE.Group();
  scene.add(pivot);
  let object = null;
  let pmrem = null;
  const slotEl = wrap.querySelector('.work-object-slot');
  (async () => {
    try {
      const [source, { RoomEnvironment }] = await Promise.all([modelPromise, import('../vendor/RoomEnvironment.js')]);
      if (disposed) return;
      pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      object = source.clone();
      object.traverse((node) => { if (node.isMesh) node.material = node.material.clone(); });
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const k = OBJECT_SIZE / Math.max(size.x, size.y, size.z);
      object.position.copy(centre).multiplyScalar(-k);
      object.scale.setScalar(k);
      object.traverse((node) => {
        if (!node.isMesh) return;
        node.renderOrder = Math.round(20 * 100) * 2 + 1; /* the same painter's order the cards use, at depth 0 */
        /* the cards are transparent and Three draws every transparent object after the opaque ones — the object
           joins that pass (alpha 1) so the painter's order really puts it between far and near cards */
        node.material.transparent = true;
        node.material.opacity = 1;
        node.material.depthWrite = true;
        node.material.envMapIntensity = 0.8;
        node.material.needsUpdate = true;
      });
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d6e0, 0.45)); /* a soft lift so the white stays airy */
      pivot.add(object);
      slotEl?.classList.add('is-loaded');
      const mat = object.getObjectByProperty('isMesh', true)?.material;
      window.__workNote?.(`ring ok · obj ok · map ${mat?.map?.image?.width || 'none'} · mr ${mat?.metalnessMap ? 'map' : mat?.metalness} · env ${scene.environment ? 'on' : 'off'} · tm ${renderer.toneMapping}`);
    } catch (error) {
      console.warn('work object failed to load', error);
      window.__workNote?.(`ring ok · obj error: ${String(error?.message || error).slice(0, 60)}`);
    }
  })();

  const N = projects.length;
  /* bigger cards that overlap, on a ring stretched sideways (an ellipse) */
  const CARD_W = 3.0, CARD_H = 4.0;
  const RADIUS = Math.max(3.4, (N * (CARD_W - 0.85)) / TAU);
  /* RX grows to use whatever width the stage has (see resize); RY stays flat so the cards read large */
  let RX = RADIUS * 1.5;
  const RY = RADIUS * 0.72;
  const TILT = -0.5, PARALLAX_X = 0.07, PARALLAX_Y = 0.16;
  const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const frameGeometry = new THREE.PlaneGeometry(CARD_W + 0.04, CARD_H + 0.04);
  /* painter's order instead of the depth buffer: overlapping cards at near-equal depth were z-fighting (flicker) */
  const frameMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(cssColor('--ink-2') || '#7C808A'), transparent: true, opacity: 0.35, depthTest: false, depthWrite: false, toneMapped: false });
  const loader = new THREE.TextureLoader();
  const cards = [];

  projects.forEach((project, i) => {
    const holder = new THREE.Group(); /* sits on the ring, keeps cards upright */
    const placeholder = new THREE.CanvasTexture(placeholderCanvas(SITE.workUi?.imageSlot || 'IMAGE 3:4'));
    placeholder.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: placeholder, transparent: true, opacity: 1, depthTest: false, depthWrite: false, toneMapped: false });
    const mesh = new THREE.Mesh(geometry, material);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial.clone());
    frame.position.z = -0.01;
    holder.add(frame, mesh);
    holder.userData = { index: i, slug: project.slug, baseScale: 1 };
    mesh.userData = holder.userData;
    ring.add(holder);
    cards.push({ holder, mesh, frame, material, project, texture: placeholder });
    if (!isPlaceholderPath(project.thumb)) {
      loader.load(normalizeSource(project.thumb), (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const texture = tonedTexture(THREE, loaded);
        coverTexture(THREE, texture, CARD_W / CARD_H);
        material.map = texture; material.needsUpdate = true;
        placeholder.dispose();
        cards[i].texture = texture;
      });
    }
  });

  const paper = new THREE.Color(cssColor('--bg') || '#F1F1F3');
  let angle = -Math.PI / 2;            /* current rotation of the ring */
  let scrollAngle = 0;                 /* driven by the pinned scroll */
  let offsetAngle = 0;                 /* index clicks */
  let drift = 0;                       /* idle rotation accumulator */
  let hovered = null;
  let hoverSlow = 1;
  let parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  let disposed = false;
  let lastTime = performance.now();
  let activeIndex = -1;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-2, -2);
  const worldPos = new THREE.Vector3();

  function resize() {
    if (disposed) return;
    const rect = wrap.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    /* the canvas spans the stage, but the ring lives to the right of the index column: an off-centre
       view keeps the ring centred in that region so no card runs under the list */
    const index = section.querySelector('.work-index');
    const reserved = index && getComputedStyle(index).display !== 'none' ? Math.round(index.getBoundingClientRect().width + 24) : 0;
    const region = Math.max(200, width - reserved);
    camera.aspect = region / height;
    if (reserved > 0) camera.setViewOffset(region, height, -reserved, 0, width, height); else camera.clearViewOffset();
    const slot = wrap.querySelector('.work-object-slot');
    if (slot) slot.style.left = `${reserved + region / 2}px`;
    /* Fit the whole ring — every card corner, at any ring angle, at the strongest pointer parallax and
       hover scale — inside the canvas. Projected extents are measured, not estimated, so the near side
       (which the tilt brings toward the camera and perspective enlarges) is never cut off. */
    const cz = camera.position.z;
    const rot = new THREE.Matrix4();
    const corner = new THREE.Vector3();
    const s = 1.07 * 1.02;
    const extents = () => {
      const half = { x: 0, y: 0 };
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([px, py]) => {
        rot.makeRotationFromEuler(new THREE.Euler(TILT + py * PARALLAX_X, px * PARALLAX_Y, 0));
        for (let step = 0; step < 72; step += 1) {
          const a = (step / 72) * TAU;
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([cx, cy]) => {
            corner.set(Math.cos(a) * RX + cx * CARD_W * 0.5 * s, Math.sin(a) * RY + cy * CARD_H * 0.5 * s, 0).applyMatrix4(rot);
            const d = Math.max(1, cz - corner.z);
            half.x = Math.max(half.x, Math.abs(corner.x) / d);
            half.y = Math.max(half.y, Math.abs(corner.y) / d);
          });
        }
      });
      return half;
    };
    /* stretch the ellipse sideways until the ring is as wide as the stage allows (the height sets the scale) */
    RX = RADIUS * 1.5;
    let half = extents();
    for (let pass = 0; pass < 4; pass += 1) {
      const room = (half.y * camera.aspect) / half.x; /* > 1: width to spare */
      if (Math.abs(room - 1) < .01) break;
      RX = THREE.MathUtils.clamp(RX * (1 + (room - 1) * .85), RADIUS * 1.5, RADIUS * 3.2);
      half = extents();
    }
    const fovY = 2 * Math.atan(half.y * 1.01);
    const fovFromX = 2 * Math.atan((half.x * 1.01) / camera.aspect);
    camera.fov = THREE.MathUtils.radToDeg(Math.max(fovY, fovFromX));
    camera.updateProjectionMatrix();
  }

  function layout() {
    cards.forEach(({ holder }, i) => {
      const a = angle + (i / N) * TAU;
      holder.position.set(Math.cos(a) * RX, Math.sin(a) * RY, 0);
      holder.rotation.set(0, 0, 0);
    });
    ring.rotation.y = parallax.x * PARALLAX_Y;
    ring.rotation.x = TILT + parallax.y * PARALLAX_X;
    /* depth cue: farther cards fade toward the paper */
    let nearest = -1, nearestZ = -Infinity;
    cards.forEach(({ holder, material, frame }, i) => {
      holder.getWorldPosition(worldPos);
      const depth = worldPos.z; /* roughly -1.2 … 1.2 */
      const t = THREE.MathUtils.clamp((depth + 2.4) / 4.8, 0, 1);
      const target = holder.userData.hoverScale || 1;
      holder.userData.baseScale += (target - holder.userData.baseScale) * 0.12;
      holder.scale.setScalar(holder.userData.baseScale);
      material.opacity = 0.42 + t * 0.58;
      frame.material.opacity = 0.12 + t * 0.28;
      /* far cards first, near cards last; each frame just under its own card */
      const order = Math.round((depth + 20) * 100) * 2;
      frame.renderOrder = order;
      holder.children[1].renderOrder = order + 1;
      if (depth > nearestZ) { nearestZ = depth; nearest = i; }
    });
    if (nearest !== activeIndex) {
      activeIndex = nearest;
      indexButtons.forEach((button, i) => button.classList.toggle('is-active', i === nearest));
    }
  }

  function frame(now) {
    if (disposed) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000); lastTime = now;
    if (!reducedQuery.matches && !hovered) drift += dt * 0.05 * hoverSlow;
    hoverSlow += ((hovered ? 0.25 : 1) - hoverSlow) * 0.1;
    const target = -Math.PI / 2 + scrollAngle + offsetAngle + drift;
    angle += (target - angle) * (1 - Math.pow(0.001, dt)); /* inertial damping */
    parallax.x += (parallax.tx - parallax.x) * 0.06;
    parallax.y += (parallax.ty - parallax.y) * 0.06;
    layout();
    if (object) {
      const t = now / 1000;
      const sway = reducedQuery.matches ? 0 : Math.sin(t * 0.45) * 0.26;
      pivot.rotation.y += ((sway + parallax.x * 0.5 + (angle + Math.PI / 2) * 0.12) - pivot.rotation.y) * 0.05;
      pivot.rotation.x += ((-0.08 + parallax.y * 0.22) - pivot.rotation.x) * 0.05;
      pivot.position.y = reducedQuery.matches ? 0 : Math.sin(t * 0.7) * 0.06;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  let raf = requestAnimationFrame(frame);

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(cards.map((c) => c.mesh), false)[0];
    return hit ? cards[hit.object.userData.index] : null;
  }

  function onMove(event) {
    const rect = canvas.getBoundingClientRect();
    parallax.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    parallax.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    const card = pick(event);
    if (card !== hovered) {
      if (hovered) hovered.holder.userData.hoverScale = 1;
      hovered = card;
      if (hovered) hovered.holder.userData.hoverScale = 1.07;
      canvas.style.cursor = hovered ? 'pointer' : '';
      tooltip.hidden = !hovered;
      if (hovered) {
        const copy = hovered.project.nar[document.documentElement.lang] || hovered.project.nar.ko;
        tooltip.querySelector('strong').textContent = copy.title;
        tooltip.querySelector('span').textContent = copy.cat || '';
      }
    }
    if (hovered) {
      tooltip.style.transform = `translate(${event.clientX - rect.left + 18}px, ${event.clientY - rect.top + 18}px)`;
    }
  }
  function onLeave() {
    if (hovered) hovered.holder.userData.hoverScale = 1;
    hovered = null; tooltip.hidden = true; canvas.style.cursor = '';
    parallax.tx = 0; parallax.ty = 0;
  }
  function onClick(event) {
    const card = pick(event);
    if (card) openDetail(card.project.slug, document.documentElement.lang);
  }
  /* drag to rotate */
  let dragging = false, dragX = 0, dragMoved = 0;
  function onDown(event) { dragging = true; dragX = event.clientX; dragMoved = 0; }
  function onDrag(event) {
    if (!dragging) return;
    const dx = event.clientX - dragX; dragX = event.clientX; dragMoved += Math.abs(dx);
    offsetAngle += dx * 0.004;
  }
  function onUp(event) { if (dragging && dragMoved > 6) event.stopPropagation?.(); dragging = false; }

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', (event) => { if (dragMoved > 6) { dragMoved = 0; return; } onClick(event); });
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onDrag);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('resize', resize);
  resize();

  const controller = {
    setScroll(progress) { scrollAngle = progress * TAU; },
    goTo(index) {
      /* rotate so card `index` sits at the bottom (front) */
      const desired = -Math.PI / 2 - (index / N) * TAU;
      const current = -Math.PI / 2 + scrollAngle + offsetAngle + drift;
      let delta = desired - current;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      offsetAngle += delta;
    },
    setLanguage() { if (hovered) { const copy = hovered.project.nar[document.documentElement.lang] || hovered.project.nar.ko; tooltip.querySelector('strong').textContent = copy.title; tooltip.querySelector('span').textContent = copy.cat || ''; } },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onDrag);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', resize);
      cards.forEach(({ texture, material, frame }) => { texture.dispose(); material.dispose(); frame.material.dispose(); });
      geometry.dispose(); frameGeometry.dispose(); frameMaterial.dispose();
      object?.traverse((node) => { if (node.isMesh) node.material.dispose(); }); /* geometry and textures are shared with the cached model */
      scene.environment?.dispose(); pmrem?.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      window.__webglLog?.push({ section: 'WORK', action: 'dispose', time: performance.now() });
      onDispose?.();
      releaseWebGL(controller);
    },
  };
  controller.debug = () => ({ fov: camera.fov, RX, RY, aspect: camera.aspect, size: renderer.getSize(new THREE.Vector2()), angle, RADIUS, cards: cards.map(c => { c.holder.getWorldPosition(worldPos); return [worldPos.x.toFixed(2), worldPos.y.toFixed(2), worldPos.z.toFixed(2), c.material.opacity.toFixed(2), !!c.material.map] }) });
  window.__work = controller;
  window.__activeWebGLController = controller;
  return controller;
}

function renderMobileList(root, projects, lang) {
  root.innerHTML = '';
  projects.forEach((project, i) => {
    const copy = project.nar[lang] || project.nar.ko;
    const card = document.createElement('article');
    card.className = 'project-card work-card';
    card.dataset.slug = project.slug;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'work-card-button';
    const img = document.createElement('div');
    img.className = 'card-img';
    img.innerHTML = `<span class="archive-image-slot">${SITE.workUi?.imageSlot || 'IMAGE 3:4'}</span>`;
    if (!isPlaceholderPath(project.thumb)) {
      const image = document.createElement('img'); image.loading = 'lazy'; image.decoding = 'async'; image.alt = copy.title; image.src = normalizeSource(project.thumb);
      image.addEventListener('load', () => img.classList.add('has-image'), { once: true });
      img.append(image);
    }
    const meta = document.createElement('div');
    meta.className = 'work-card-meta';
    meta.innerHTML = `<span class="work-card-index">${pad(i + 1)}</span><h3 class="work-card-title"></h3><p class="work-card-cat"></p>`;
    meta.querySelector('h3').textContent = copy.title;
    meta.querySelector('p').textContent = copy.cat || '';
    button.append(img, meta);
    button.addEventListener('click', () => openDetail(project.slug, lang));
    card.append(button);
    root.append(card);
  });
}

export function renderWork(lang) {
  const section = document.querySelector('#work');
  const projects = featuredProjects();
  if (instance && instance.section === section) { instance.setLanguage(lang); return instance; }

  section.className = 'site-section work-section';
  section.innerHTML = `
    <div class="work-inner">
      <div class="work-stage">
        <div class="section-heading work-heading"><span>${SITE.sections.work.title}</span><span class="section-heading__index">${SITE.sections.work.index || '02 / 06'}</span></div>
        <div class="work-body">
          <ol class="work-index" aria-label="${SITE.sections.work.title}"></ol>
          <div class="work-canvas-wrap">
            <canvas class="work-canvas" aria-hidden="true"></canvas>
            <div class="work-object-slot" aria-hidden="true"><span>${SITE.workUi?.objectLabel || '3D OBJECT'}</span></div>
            <div class="work-tooltip" hidden><strong></strong><span></span></div>
          </div>
        </div>
        <div class="work-hint">${SITE.workUi?.hint || 'SCROLL TO ROTATE · CLICK TO OPEN'}</div>
      </div>
      <div class="work-list"></div>
    </div>`;

  const indexRoot = section.querySelector('.work-index');
  const listRoot = section.querySelector('.work-list');
  let ring = null;
  let trigger = null;
  let observer = null;
  let creating = false;

  function renderIndex(currentLang) {
    indexRoot.innerHTML = '';
    projects.forEach((project, i) => {
      const copy = project.nar[currentLang] || project.nar.ko;
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<span class="work-index-number">${pad(i + 1)}</span><span class="work-index-title"></span>`;
      button.querySelector('.work-index-title').textContent = copy.title;
      button.addEventListener('click', () => { if (ring) ring.goTo(i); else openDetail(project.slug, currentLang); });
      button.addEventListener('dblclick', () => openDetail(project.slug, currentLang));
      item.append(button);
      indexRoot.append(item);
    });
  }

  /* review builds show the ring's state in a corner badge (like the NAME glass badge) */
  function note(text) { if (window.REVIEW_LABELS) (section.querySelector('.work-stage') || section).dataset.gl = text; }
  window.__workNote = note;

  let visible = false;
  async function ensureRing() {
    if (ring || creating || mobileQuery.matches || !visible) return;
    creating = true;
    let created = null;
    try {
      created = await createRing(section, projects, document.documentElement.lang, () => { ring = null; });
    } catch (error) {
      console.warn('work ring failed', error);
      window.__webglLog?.push({ section: 'WORK', action: 'error', time: performance.now(), reason: String(error?.message || error) });
      note(`ring error: ${String(error?.message || error).slice(0, 80)}`);
    } finally {
      creating = false;
    }
    if (!created) return;
    if (!visible) { created.dispose(); return; }
    ring = created;
    if (trigger) ring.setScroll(trigger.progress);
  }
  function dropRing() { ring?.dispose(); ring = null; }
  /* another section (NAME glass, the photo lens) may have taken the context — take it back when it is freed */
  function onWebGLFree() { if (visible && !ring) ensureRing(); }
  window.addEventListener('portfolio:webgl-free', onWebGLFree);

  function setupScroll() {
    if (!window.gsap || !window.ScrollTrigger || mobileQuery.matches || trigger) return;
    /* the intro pins first and changes the page height — measure only after it is ready */
    if (!window.__introReady) { window.addEventListener('portfolio:intro-ready', setupScroll, { once: true }); return; }
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3}`,
      pin: section.querySelector('.work-stage'),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => ring?.setScroll(self.progress),
    });
    ScrollTrigger.refresh();
  }

  /* The section flickers out of the observer's view for a frame when ScrollTrigger re-pins (font load,
     refresh, hash jumps). Disposing on that flicker left the stage empty, so a drop waits a moment and
     a slow heartbeat rebuilds the ring whenever it is on screen without one. */
  let dropTimer = 0;
  let heartbeat = 0;
  function setupObserver() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        clearTimeout(dropTimer);
        if (visible) ensureRing();
        else dropTimer = window.setTimeout(() => { if (!visible) dropRing(); }, 800);
      });
    }, { rootMargin: '100% 0px 100% 0px' });
    observer.observe(section);
    heartbeat = window.setInterval(() => { if (visible && !ring && !creating) ensureRing(); }, 1200);
  }

  function mount() {
    renderIndex(lang);
    if (mobileQuery.matches) { renderMobileList(listRoot, projects, lang); return; }
    setupScroll();
    setupObserver();
  }
  mount();

  instance = {
    section,
    setLanguage(nextLang) { renderIndex(nextLang); if (mobileQuery.matches) renderMobileList(listRoot, projects, nextLang); ring?.setLanguage(nextLang); },
    destroy() { window.removeEventListener('portfolio:webgl-free', onWebGLFree); observer?.disconnect(); clearTimeout(dropTimer); clearInterval(heartbeat); trigger?.kill(); dropRing(); instance = null; },
  };
  return instance;
}
