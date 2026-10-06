import { dropPlip } from './audio.js';
/* A round glass ball under the pointer, after Codrops' "Progressively Enhanced WebGL Lens Refraction" (2023),
   on photographs only (2026-10-03): the cover and the pictures of a project page, and the archive cards
   (under every filter). Like the original it is drawn in WebGL, so Chrome and Safari show the same thing:
   one small canvas follows the pointer and paints the photo under it again, magnified in the middle, bent
   and fanned into red / green / blue near the rim, with a darker rim and a highlight. Outside the photo the
   ball is cut away, so it never spills over the page.
   (The SVG-filter versions before it ran differently in each browser: Safari bent the wrong pixels and made
   gallery photos vanish.) The photo under the pointer is found every frame, so the ball is there the moment a
   project page opens over a still pointer, and it follows when the page scrolls under it.
   Phones and reduced motion get nothing. */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const LENS = {
  zoom: .56,      /* the middle shows the photo at 1 / .56 ≈ 1.8× */
  rimReach: 1.26, /* at the rim it shows 26 % beyond its own edge */
  curve: 2.2,
  split: [.9, 1.05, 1.2], /* how far red, green and blue are bent, relative to each other */
  ease: .22,
};

/* which photo is under the pointer, the box it is clipped to, and the colour treatment the page gives it */
function photoAt(node) {
  if (!node || node.nodeType !== 1) return null;
  const card = node.closest('.card-img.has-image');
  if (card && card.closest('.archive-grid')) {
    const img = card.querySelector('img');
    /* a hovered card is veiled in vellum with its title on top: the ball sits between the two, so it shows the
       photo through the veil and the title stays readable over it */
    return img ? { img, clip: card, host: card.closest('.archive-card-button'), saturate: .72, contrast: 1.02, veil: .42 } : null; /* .card-img img { filter: saturate(.72) contrast(1.02) } */
  }
  /* the NOW box is frosted glass over the page photo: the ball is a drop on it that shows the photo clear through
     it, and bends the box's own text and video like the drops on the photos do (2026-10-06) */
  const now = node.closest('.now-block');
  if (now) {
    const img = [...document.querySelectorAll('.ground-photo.is-on')].sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
    return img ? { img, clip: now, host: null, saturate: 1.2, contrast: .97, veil: .5, scene: now } : null; /* .ground-photo { filter: saturate(1.2) contrast(.97) } */
  }
  const frame = node.closest('.detail-hero.has-image, .detail-gallery-item.has-image');
  if (frame) {
    const img = frame.querySelector('img');
    if (!img || (node !== img && !frame.classList.contains('detail-hero'))) return null; /* not over a caption */
    return { img, clip: img, host: null, saturate: 1, contrast: 1 };
  }
  return null;
}

const VERT = 'attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }';
const FRAG = `precision highp float;
varying vec2 v;
uniform sampler2D tex;
uniform vec2 origin;     /* the canvas' top left, in page pixels */
uniform float ball;
uniform vec4 imgRect;    /* the image box on the page */
uniform vec4 clipRect;   /* what of it is visible */
uniform vec4 cover;      /* the picture inside its box (object-fit: cover): offset and size */
uniform float zoom, reach, curve;
uniform vec3 split;
uniform float saturation, contrast, veil;
uniform float scene, hasVid;  /* scene: the NOW box (photo + its video + its text) */
uniform sampler2D textTex, vidTex;
uniform vec4 boxRect, vidRect, vidCover;
vec3 grade(vec3 c) { float l = dot(c, vec3(.2126, .7152, .0722)); return (mix(vec3(l), c, saturation) - .5) * contrast + .5; }
vec3 pick(vec2 P) {
  vec2 uv = (P - imgRect.xy - cover.xy) / cover.zw;
  vec3 c = texture2D(tex, clamp(uv, vec2(.0005), vec2(.9995))).rgb;
  if (scene < .5) return c;
  c = mix(grade(c), vec3(.945, .945, .953), veil);
  if (hasVid > .5 && P.x >= vidRect.x && P.y >= vidRect.y && P.x <= vidRect.x + vidRect.z && P.y <= vidRect.y + vidRect.w)
    c = texture2D(vidTex, clamp((P - vidRect.xy - vidCover.xy) / vidCover.zw, vec2(.0005), vec2(.9995))).rgb;
  vec4 t = texture2D(textTex, clamp((P - boxRect.xy) / boxRect.zw, vec2(0.), vec2(1.)));
  return mix(c, t.rgb, t.a);
}
float glare(vec2 u, vec2 c, vec2 radius, float rot) {
  vec2 q = u - c; float cs = cos(rot), sn = sin(rot);
  q = vec2(q.x * cs + q.y * sn, -q.x * sn + q.y * cs);
  return max(0., 1. - length(q / radius));
}
void main() {
  vec2 p = vec2(v.x, 1. - v.y) * ball;
  float r = ball * .5;
  vec2 d = p - vec2(r);
  float dist = length(d);
  float n = dist / r;
  if (n > 1.) discard;
  vec2 P = origin + p;
  if (P.x < clipRect.x || P.y < clipRect.y || P.x > clipRect.x + clipRect.z || P.y > clipRect.y + clipRect.w) discard;
  float k = zoom + (reach - zoom) * pow(n, curve);
  vec2 C = origin + vec2(r);
  vec3 col = vec3(pick(C + d * (1. + (k - 1.) * split.x)).r, pick(C + d * (1. + (k - 1.) * split.y)).g, pick(C + d * (1. + (k - 1.) * split.z)).b);
  if (scene < .5) col = grade(col);
  col *= 1. - .2 * smoothstep(.62, .98, n) - .18 * smoothstep(r - 2.2, r - .3, dist); /* the rim, in the photo's own colour */
  vec2 u = p / ball;
  float shine = min(1., .5 * pow(glare(u, vec2(.34, .24), vec2(.2, .12), -.32), 1.6) + .16 * pow(glare(u, vec2(.62, .86), vec2(.17, .07), 0.), 1.6));
  if (scene < .5) col = mix(col, vec3(.945, .945, .953), veil); /* a hovered archive card: a thinner vellum than the card's, so the title reads */
  col = mix(col, vec3(1.), shine);
  float edge = 1. - smoothstep(r - 1., r, dist);
  gl_FragColor = vec4(clamp(col, 0., 1.) * edge, edge);
}`;

export function initCursorLens() {
  if (!finePointer.matches || reducedQuery.matches || document.querySelector('.cursor-lens-canvas')) return;
  const ball = Math.round(Math.min(200, Math.max(140, window.innerWidth * .12)));
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-lens-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(ball * dpr); canvas.height = Math.round(ball * dpr);
  canvas.style.width = `${ball}px`; canvas.style.height = `${ball}px`;
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return;
  document.body.append(canvas);

  const shader = (type, source) => { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); return s; };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(program, name);
  const U = { origin: u('origin'), ball: u('ball'), imgRect: u('imgRect'), clipRect: u('clipRect'), cover: u('cover'), zoom: u('zoom'), reach: u('reach'), curve: u('curve'), split: u('split'), saturation: u('saturation'), contrast: u('contrast'), veil: u('veil'), scene: u('scene'), hasVid: u('hasVid'), boxRect: u('boxRect'), vidRect: u('vidRect'), vidCover: u('vidCover') };
  gl.uniform1i(u('tex'), 0); gl.uniform1i(u('textTex'), 1); gl.uniform1i(u('vidTex'), 2);
  gl.uniform1f(U.ball, ball); gl.uniform1f(U.zoom, LENS.zoom); gl.uniform1f(U.reach, LENS.rimReach); gl.uniform1f(U.curve, LENS.curve);
  gl.uniform3f(U.split, ...LENS.split);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  const blankTexture = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    return t;
  };
  const textTexture = blankTexture();
  const videoTexture = blankTexture();
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textTexture);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.activeTexture(gl.TEXTURE0);

  /* the NOW box's text and rules, painted once into a texture at their places in the box: inside the drop the page
     shows this copy, magnified and bent, over the photo. Painted again when the box changes (language, width, fonts). */
  let sceneKey = '';
  let fontsVersion = 0;
  document.fonts?.ready.then(() => { fontsVersion += 1; });
  document.fonts?.addEventListener?.('loadingdone', () => { fontsVersion += 1; });
  const paintScene = (block, rect) => {
    const scale = Math.min(window.devicePixelRatio || 1, 2, 4096 / Math.max(rect.width, rect.height));
    const sheet = document.createElement('canvas');
    sheet.width = Math.ceil(rect.width * scale); sheet.height = Math.ceil(rect.height * scale);
    const ctx = sheet.getContext('2d');
    ctx.scale(scale, scale);
    block.querySelectorAll('*').forEach((el) => {
      if (el.closest('video')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const b = el.getBoundingClientRect(); const x = b.left - rect.left; const y = b.top - rect.top;
      if (el.tagName === 'IMG') { if (el.complete && el.naturalWidth) { try { ctx.drawImage(el, x, y, b.width, b.height); } catch {} } return; } /* NOW images bend with the text (2026-10-06) */
      [['Top', x, y, b.width, 0], ['Bottom', x, y + b.height, b.width, 0], ['Left', x, y, 0, b.height], ['Right', x + b.width, y, 0, b.height]].forEach(([side, sx, sy, w, h]) => {
        const width = parseFloat(cs[`border${side}Width`]); const style = cs[`border${side}Style`];
        if (!width || style === 'none' || style === 'hidden') return;
        ctx.fillStyle = cs[`border${side}Color`];
        const ox = side === 'Right' ? -width : 0; const oy = side === 'Bottom' ? -width : 0;
        if (style === 'dotted' || style === 'dashed') {
          const step = width * (style === 'dotted' ? 2 : 6); const dash = style === 'dotted' ? width : width * 3;
          for (let t = 0; t < (w || h); t += step) ctx.fillRect(sx + ox + (w ? t : 0), sy + oy + (h ? t : 0), w ? dash : width, h ? dash : width);
        } else ctx.fillRect(sx + ox, sy + oy, w || width, h || width);
      });
    });
    const range = document.createRange();
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest('video') || !parent.getClientRects().length) continue;
      const cs = getComputedStyle(parent);
      if (cs.visibility === 'hidden') continue;
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.fillStyle = cs.color;
      const m = ctx.measureText('Hg');
      const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent; const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
      const text = node.data;
      for (let i = 0; i < text.length; i += 1) {
        const size = text.codePointAt(i) > 0xffff ? 2 : 1;
        let ch = text.slice(i, i + size);
        if (!/\s/.test(ch)) {
          range.setStart(node, i); range.setEnd(node, i + size);
          const q = range.getClientRects()[0];
          if (q && q.width) {
            if (cs.textTransform === 'uppercase') ch = ch.toUpperCase();
            ctx.fillText(ch, q.left - rect.left, q.top - rect.top + (q.height - ascent - descent) / 2 + ascent);
          }
        }
        i += size - 1;
      }
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);
    gl.activeTexture(gl.TEXTURE0);
  };
  const posters = new Map();
  const posterFor = (video) => {
    if (!video.poster) return null;
    if (!posters.has(video.poster)) { const img = new Image(); img.src = video.poster; posters.set(video.poster, img); }
    const img = posters.get(video.poster);
    return img.complete && img.naturalWidth ? img : null;
  };
  let videoSource = null;
  let videoOwner = null; /* the <video> whose frame is in the texture */

  /* one texture per photo, uploaded the first time the ball crosses it */
  const textures = new Map();
  const textureFor = (img) => {
    const key = img.currentSrc || img.src;
    if (textures.has(key)) return textures.get(key);
    if (!img.complete || !img.naturalWidth) return null;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); } catch { gl.deleteTexture(texture); return null; }
    textures.set(key, texture);
    if (textures.size > 40) { const [oldest] = textures.keys(); gl.deleteTexture(textures.get(oldest)); textures.delete(oldest); }
    return texture;
  };

  const pointer = { x: 0, y: 0, known: false };
  const at = { x: 0, y: 0 };
  let current = null;
  let shown = false;
  let last = '';
  const hide = () => { if (shown) { canvas.style.display = 'none'; shown = false; } current = null; last = ''; };

  const frame = () => {
    requestAnimationFrame(frame);
    if (!pointer.known || document.hidden) { hide(); return; }
    const hit = photoAt(document.elementFromPoint(pointer.x, pointer.y));
    if (!hit) { hide(); return; }
    const texture = textureFor(hit.img);
    if (!texture) { hide(); return; }
    if (!current || current.img !== hit.img) { at.x = pointer.x; at.y = pointer.y; } /* a new photo: start right under the pointer */
    if (shown && current && current.clip !== hit.clip) dropPlip(); /* straight from one archive photo to the next (2026-10-06) */
    current = hit;
    at.x += (pointer.x - at.x) * LENS.ease;
    at.y += (pointer.y - at.y) * LENS.ease;
    const box = hit.img.getBoundingClientRect();
    let clip = hit.clip === hit.img ? box : hit.clip.getBoundingClientRect();
    let sceneLive = false;
    if (hit.scene) {
      const navBottom = document.querySelector('#nav')?.getBoundingClientRect().bottom || 0;
      if (clip.top < navBottom) clip = { left: clip.left, top: navBottom, width: clip.width, height: clip.height - (navBottom - clip.top) };
      const sheetRect = hit.scene.getBoundingClientRect();
      const keyNow = `${sheetRect.width.toFixed(0)}x${sheetRect.height.toFixed(0)}|${document.documentElement.lang}|${fontsVersion}|${hit.scene.textContent.length}|${[...hit.scene.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth).length}`;
      if (hit.scene !== paintScene.block || keyNow !== sceneKey) { paintScene(hit.scene, sheetRect); paintScene.block = hit.scene; sceneKey = keyNow; last = ''; }
      gl.uniform4f(U.boxRect, sheetRect.left, sheetRect.top, sheetRect.width, sheetRect.height);
      const videos = [...hit.scene.querySelectorAll('.now-media video')]; /* several videos (2026-10-06): use the one under the drop */
      const under = (r) => at.x + ball / 2 > r.left && at.x - ball / 2 < r.right && at.y + ball / 2 > r.top && at.y - ball / 2 < r.bottom;
      const video = videos.find((v) => under(v.getBoundingClientRect())) || videos[0];
      const source = video && video.readyState >= 2 && video.videoWidth ? video : (video ? posterFor(video) : null);
      if (source) {
        const vr = video.getBoundingClientRect();
        const near = at.x + ball / 2 > vr.left && at.x - ball / 2 < vr.right && at.y + ball / 2 > vr.top && at.y - ball / 2 < vr.bottom;
        const sw = source.videoWidth || source.naturalWidth; const sh = source.videoHeight || source.naturalHeight;
        if (near && (source === video || videoSource !== source || videoOwner !== video)) {
          gl.activeTexture(gl.TEXTURE2);
          try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); videoSource = source; videoOwner = video; } catch { videoSource = null; }
          gl.activeTexture(gl.TEXTURE0);
          sceneLive = source === video && !video.paused;
        }
        const vs = Math.max(vr.width / sw, vr.height / sh);
        gl.uniform4f(U.vidRect, vr.left, vr.top, vr.width, vr.height);
        gl.uniform4f(U.vidCover, (vr.width - sw * vs) / 2, (vr.height - sh * vs) / 2, sw * vs, sh * vs);
        gl.uniform1f(U.hasVid, videoSource && videoOwner === video ? 1 : 0);
      } else gl.uniform1f(U.hasVid, 0);
    }
    gl.uniform1f(U.scene, hit.scene ? 1 : 0);
    if (sceneLive) last = ''; /* a playing video: draw every frame */
    const left = at.x - ball / 2; const top = at.y - ball / 2;
    const key = `${hit.img.src}|${left.toFixed(1)}|${top.toFixed(1)}|${box.left.toFixed(1)}|${box.top.toFixed(1)}|${box.width.toFixed(1)}|${clip.top.toFixed(1)}`;
    if (key === last) return;
    last = key;
    /* object-fit: cover, centred */
    const scale = Math.max(box.width / hit.img.naturalWidth, box.height / hit.img.naturalHeight);
    const dw = hit.img.naturalWidth * scale; const dh = hit.img.naturalHeight * scale;
    /* over a project page the canvas floats on the page; on an archive card it goes inside the card */
    const host = hit.host || document.body;
    if (canvas.parentElement !== host) { host.append(canvas); canvas.classList.toggle('is-in-card', !!hit.host); }
    const hostBox = hit.host ? hit.host.getBoundingClientRect() : { left: 0, top: 0 };
    canvas.style.transform = `translate3d(${(left - hostBox.left).toFixed(1)}px, ${(top - hostBox.top).toFixed(1)}px, 0)`;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform2f(U.origin, left, top);
    gl.uniform4f(U.imgRect, box.left, box.top, box.width, box.height);
    gl.uniform4f(U.clipRect, clip.left, clip.top, clip.width, clip.height);
    gl.uniform4f(U.cover, (box.width - dw) / 2, (box.height - dh) / 2, dw, dh);
    gl.uniform1f(U.saturation, hit.saturate); gl.uniform1f(U.contrast, hit.contrast); gl.uniform1f(U.veil, hit.veil || 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!shown) { canvas.style.display = 'block'; shown = true; dropPlip(); }
  };
  requestAnimationFrame(frame);

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.known = true;
  }, { passive: true });
  document.addEventListener('mouseout', (event) => { if (!event.relatedTarget) pointer.known = false; });
  window.addEventListener('blur', () => { pointer.known = false; });
}
