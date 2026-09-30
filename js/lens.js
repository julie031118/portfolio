import { releaseWebGL } from './sections/render-shell.js';

const mobileQuery = window.matchMedia('(max-width: 768px), (hover: none)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* The square lens from Codrops' "Mouse-Following Square Lens Effect" (Tomoyuki Nakata, MIT, 2026-08),
   ported to the project cover in the detail page. When the pointer comes onto the photo, the picture
   around the lens drains to grey and starts to shimmer (a slow sine wave + fine noise in the UVs); inside
   the square the colour photo shows through a CC Lens bulge with a radial RGB split. No frame — the
   hard edge of the mask is the border. The effect eases in on enter and back out to the plain photo on leave.
   Parameters are the tutorial's defaults, apart from a gentler bulge and RGB split and `saturation` (a touch more colour inside the lens). */
const PARAMS = {
  squareSize: .4,      /* half the side, in the -1…1 space of the photo's short side → 40 % of it */
  lensDistortion: 1.0, /* tutorial 1.5 — softer bulge */
  rgbShiftR: .004, rgbShiftG: 0, rgbShiftB: -.004, /* tutorial .01 — much less, the covers are busier than its rose */
  waveFrequency: 10, waveStrength: .01, waveSpeed: 1,
  randomFrequency: 1, randomStrength: .02, randomSpeed: .2,
  pointerEase: .1,
  saturation: 1.12,
  openTime: .22,       /* seconds — how fast the grey and the square come and go */
};

const FRAG = `precision highp float;
uniform sampler2D u_texture;
uniform vec2 u_meshSize;
uniform vec2 u_textureSize;
uniform vec2 u_mouse;
uniform float u_squareSize;
uniform float u_lensDistortion;
uniform float u_rgbShiftR;
uniform float u_rgbShiftG;
uniform float u_rgbShiftB;
uniform float u_waveFrequency;
uniform float u_waveStrength;
uniform float u_waveSpeed;
uniform float u_randomFrequency;
uniform float u_randomStrength;
uniform float u_randomSpeed;
uniform float u_saturation;
uniform float u_open;
uniform float u_time;
varying vec2 v_uv;

vec2 getCoverUv(vec2 uv, vec2 meshSize, vec2 textureSize) {
  vec2 meshRatio = vec2(meshSize.x / meshSize.y, meshSize.y / meshSize.x);
  vec2 textureRatio = vec2(textureSize.x / textureSize.y, textureSize.y / textureSize.x);
  vec2 resolutionRatio = vec2(min(meshRatio.x / textureRatio.x, 1.0), min(meshRatio.y / textureRatio.y, 1.0));
  return (uv - 0.5) * resolutionRatio + 0.5;
}
float getCCLensScale(float distortion, float radius2) {
  if (distortion >= 0.0) return 1.0 + distortion * radius2;
  return 1.0 / (1.0 - distortion * radius2);
}
vec2 getCCLensUv(vec2 uv, vec2 resolution, float distortion) {
  vec2 centeredUv = uv - 0.5;
  vec2 aspectScale = vec2(resolution.x / resolution.y, 1.0);
  vec2 centeredPosition = centeredUv * aspectScale;
  float radius2 = dot(centeredPosition, centeredPosition);
  vec2 distortedPosition = centeredPosition * getCCLensScale(distortion, radius2);
  vec2 distortedUv = distortedPosition / aspectScale + 0.5;
  return uv - (distortedUv - uv);
}
/* per-pixel noise, -0.5…0.5. The tutorial hashes the UV with a large sin() (Shadertoy XsX3zB), which some
   GPUs round into diagonal streaks; this is Dave Hoskins' "hash without sine" on the pixel grid instead —
   the same fine, shimmering grain everywhere */
vec3 random3(vec3 p3) {
  p3 = fract(p3 * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx) - 0.5;
}
vec3 grey(vec3 c) { float l = dot(c, vec3(0.299, 0.587, 0.114)); l = clamp((l - 0.5) * 1.06 + 0.5, 0.0, 1.0); return vec3(l); }

void main() {
  vec2 plainUv = getCoverUv(v_uv, u_meshSize, u_textureSize);

  vec2 uvSquare = v_uv * 2.0 - 1.0;
  uvSquare -= u_mouse;
  vec2 squareAspectScale = vec2(min(u_meshSize.y / u_meshSize.x, 1.0), min(u_meshSize.x / u_meshSize.y, 1.0));
  uvSquare /= squareAspectScale;

  /* outside: the shimmering grey photo */
  vec2 greyUv = plainUv;
  greyUv.y += sin(greyUv.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveStrength * u_open;
  greyUv += random3(vec3(gl_FragCoord.xy * u_randomFrequency, floor(u_time * u_randomSpeed * 120.0))).xy * u_randomStrength * u_open; /* x and y apart: an even spray like the demo's, not a diagonal smear */
  vec3 outside = mix(texture2D(u_texture, plainUv).rgb, grey(texture2D(u_texture, greyUv).rgb), u_open);

  /* inside: the colour photo through the lens */
  float squareHalfSize = max(u_squareSize * u_open, 0.0001);
  float squareMask = step(-squareHalfSize, uvSquare.x) * (1.0 - step(squareHalfSize, uvSquare.x))
                   * step(-squareHalfSize, uvSquare.y) * (1.0 - step(squareHalfSize, uvSquare.y));
  vec2 squareUv = uvSquare / (squareHalfSize * 2.0) + 0.5;
  vec2 distortedSquareUv = getCCLensUv(squareUv, vec2(1.0), u_lensDistortion);
  vec2 viewportLensOffset = (distortedSquareUv - squareUv) * squareHalfSize * squareAspectScale;
  vec2 lensUv = getCoverUv(v_uv + viewportLensOffset, u_meshSize, u_textureSize);
  vec2 rgbShiftDirection = (squareUv - 0.5) * 2.0;
  vec3 inside = vec3(
    texture2D(u_texture, lensUv + rgbShiftDirection * u_rgbShiftR).r,
    texture2D(u_texture, lensUv + rgbShiftDirection * u_rgbShiftG).g,
    texture2D(u_texture, lensUv + rgbShiftDirection * u_rgbShiftB).b);
  float l = dot(inside, vec3(0.299, 0.587, 0.114));
  inside = clamp(mix(vec3(l), inside, u_saturation), 0.0, 1.0);

  gl_FragColor = vec4(mix(outside, inside, squareMask), 1.0);
}`;
const VERT = 'varying vec2 v_uv;void main(){v_uv=uv;gl_Position=vec4(position,1.0);}';

/* builds the lens for one figure; resolves to null when it can't (phone, reduced motion, image not ready) */
export async function createPhotoLens(figure, image) {
  if (mobileQuery.matches || reducedQuery.matches || !image.complete || !image.naturalWidth) return null;
  const THREE = await import('./vendor/three.module.min.js');
  /* Three reads an <img>'s CSS size, not its natural size, so an object-fit image uploads wrong (black);
     a detached copy of the same (cached) file has its natural size */
  const source = new Image(); source.decoding = 'sync'; source.src = image.currentSrc || image.src;
  try { await source.decode(); } catch (error) { return null; }

  const canvas = document.createElement('canvas');
  canvas.className = 'photo-lens-canvas'; canvas.setAttribute('aria-hidden', 'true');
  figure.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' });
  window.__webglLog?.push({ section: 'LENS', action: 'create', time: performance.now() });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const texture = new THREE.Texture(source);
  texture.colorSpace = THREE.NoColorSpace; /* raw values in, raw values out — as the tutorial's RawShaderMaterial; an sRGB texture in a ShaderMaterial comes out dark */
  texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false;
  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping; texture.needsUpdate = true;
  const uniforms = {
    u_texture: { value: texture },
    u_meshSize: { value: new THREE.Vector2(1, 1) },
    u_textureSize: { value: new THREE.Vector2(source.naturalWidth, source.naturalHeight) },
    u_mouse: { value: new THREE.Vector2() },
    u_squareSize: { value: PARAMS.squareSize },
    u_lensDistortion: { value: PARAMS.lensDistortion },
    u_rgbShiftR: { value: PARAMS.rgbShiftR }, u_rgbShiftG: { value: PARAMS.rgbShiftG }, u_rgbShiftB: { value: PARAMS.rgbShiftB },
    u_waveFrequency: { value: PARAMS.waveFrequency }, u_waveStrength: { value: PARAMS.waveStrength }, u_waveSpeed: { value: PARAMS.waveSpeed },
    u_randomFrequency: { value: PARAMS.randomFrequency }, u_randomStrength: { value: PARAMS.randomStrength }, u_randomSpeed: { value: PARAMS.randomSpeed },
    u_saturation: { value: PARAMS.saturation },
    u_open: { value: 0 },
    u_time: { value: 0 },
  };
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false });
  scene.add(new THREE.Mesh(geometry, material));

  const mouse = new THREE.Vector2();
  const eased = new THREE.Vector2();
  let target = 0;       /* 1 while the pointer is on the photo */
  let raf = 0;
  let last = 0;
  let disposed = false;
  let onClosed = null;
  let controller = null;

  function resize() {
    if (disposed) return;
    const rect = figure.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    uniforms.u_meshSize.value.set(rect.width, rect.height);
  }
  function pointerTo(event, snap = false) {
    const rect = figure.getBoundingClientRect();
    mouse.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    if (snap) eased.copy(mouse);
  }
  function frame(now) {
    raf = 0;
    if (disposed) return;
    /* the tutorial eases per frame at 60 fps; the same feel, measured in time so slow machines keep up */
    const dt = Math.min(.1, last ? (now - last) / 1000 : 1 / 60); last = now;
    eased.lerp(mouse, 1 - Math.pow(1 - PARAMS.pointerEase, dt * 60));
    uniforms.u_mouse.value.copy(eased);
    const open = uniforms.u_open.value + (target - uniforms.u_open.value) * (1 - Math.exp(-dt / PARAMS.openTime));
    uniforms.u_open.value = Math.abs(open - target) < .003 ? target : open;
    uniforms.u_time.value = performance.now() * .001;
    renderer.render(scene, camera);
    if (target === 0 && uniforms.u_open.value === 0) { last = 0; onClosed?.(); return; }
    raf = requestAnimationFrame(frame);
  }
  const run = () => { if (!raf && !disposed) raf = requestAnimationFrame(frame); };

  function open(event) { if (event) pointerTo(event, uniforms.u_open.value < .02); target = 1; run(); }
  function close(done) { target = 0; onClosed = done; run(); }
  function move(event) { pointerTo(event); run(); }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    texture.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss();
    window.__webglLog?.push({ section: 'LENS', action: 'dispose', time: performance.now() });
    canvas.remove();
    releaseWebGL(controller);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();
  renderer.render(scene, camera); /* frame 0 is the plain photo, so the swap to the canvas is invisible */
  controller = { open, close, move, dispose, get isOpen() { return target === 1; } };
  window.__activeWebGLController = controller;
  return controller;
}

/* wires the lens to a figure that contains an <img>; the WebGL context lives from the first hover until
   the grey has faded back out after the pointer leaves */
export function attachLens(figure) {
  const image = figure.querySelector('img');
  if (!image) return () => {};
  let lens = null;
  let pending = null;
  let inside = false;
  let lastEvent = null;
  const enter = (event) => {
    inside = true; lastEvent = event;
    if (lens) { lens.open(event); return; }
    if (pending) return;
    pending = createPhotoLens(figure, image).then((created) => {
      pending = null;
      if (!created) return;
      lens = created;
      if (inside) lens.open(lastEvent); else { lens.dispose(); lens = null; }
    });
  };
  const move = (event) => { lastEvent = event; lens?.move(event); };
  const leave = () => {
    inside = false;
    const closing = lens;
    closing?.close(() => { if (!inside && lens === closing) { closing.dispose(); lens = null; } });
  };
  figure.addEventListener('pointerenter', enter);
  figure.addEventListener('pointermove', move);
  figure.addEventListener('pointerleave', leave);
  return () => {
    inside = false; lens?.dispose(); lens = null;
    figure.removeEventListener('pointerenter', enter);
    figure.removeEventListener('pointermove', move);
    figure.removeEventListener('pointerleave', leave);
  };
}
