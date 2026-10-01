import { attachLens } from '../lens.js';
let lastFocus = null;
let currentSlug = null;
let openedViaPush = false;
let listenersBound = false;

function translated(value, lang) {
  if (value && typeof value === 'object' && !Array.isArray(value) && ('ko' in value || 'en' in value)) return value[lang] || value.ko || value.en;
  return value;
}

function isPlaceholderPath(source) {
  return !source || /\/images\/x\.jpg$|\/images\/projects\/x\//.test(source);
}

function normalizeSource(source) {
  return source?.startsWith('/') ? source.slice(1) : source;
}

/* Justified rows: every image in a row shares one height and the row fills the width exactly.
   Row height aims for ~560px (or `rowTarget`) and never scales an image past its own pixels — a file marked
   small (low resolution) is held to under half of them, so nothing is shown blown up. */
function justifyGallery(gallery, rowTarget = 0) {
  const items = [...gallery.querySelectorAll('.detail-gallery-item')];
  const layout = () => {
    const width = gallery.clientWidth;
    if (!width) return;
    const ready = items.filter((item) => item.querySelector('img')?.naturalWidth);
    if (!ready.length) return;
    const target = rowTarget || Math.min(620, Math.max(360, width * .46));
    let row = []; let rowRatio = 0;
    const flush = (last) => {
      if (!row.length) return;
      let height = width / rowRatio;
      if (last && height > target * 1.15) height = target * 1.15; /* a short last row is left-aligned, not stretched */
      const maxNatural = Math.min(...row.map(({ item, img }) => img.naturalHeight * (item.classList.contains('is-small') ? .35 : 1)));
      height = Math.min(height, maxNatural);
      row.forEach(({ item, ratio }) => { item.style.width = `${Math.floor(ratio * height)}px`; item.style.height = `${Math.floor(height)}px`; });
      row = []; rowRatio = 0;
    };
    ready.forEach((item) => {
      const img = item.querySelector('img');
      const ratio = img.naturalWidth / img.naturalHeight;
      row.push({ item, img, ratio }); rowRatio += ratio;
      if (width / rowRatio <= target) flush(false);
    });
    flush(true);
    gallery.classList.add('is-justified');
  };
  items.forEach((item) => { const img = item.querySelector('img'); if (img) img.addEventListener('load', layout, { once: true }); });
  let timer = 0;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = window.setTimeout(layout, 120); }, { passive: true });
  layout();
}

function createMedia(source, label, className, alt, eager = false) {
  const figure = document.createElement('figure');
  figure.className = className;
  const slot = document.createElement('span');
  slot.className = 'detail-media-slot';
  slot.textContent = label;
  figure.append(slot);
  if (!isPlaceholderPath(source)) {
    const image = document.createElement('img');
    /* every gallery image loads up front: a lazy image inside a hidden (not-yet-justified) item never
       scrolls into view, so it never loaded — which is why galleries showed one or two photos */
    image.loading = 'eager';
    image.fetchPriority = eager ? 'high' : 'low';
    image.decoding = 'async';
    image.alt = alt;
    image.addEventListener('load', () => figure.classList.add('has-image'), { once: true });
    image.addEventListener('error', () => figure.classList.remove('has-image'), { once: true });
    image.src = normalizeSource(source);
    figure.append(image);
    if (window.REVIEW_LABELS) {
      /* review builds only: show the file id so images can be named for removal */
      const tag = document.createElement('span');
      tag.className = 'detail-review-tag';
      tag.textContent = normalizeSource(source).replace(/^images\/(projects\/)?/, '').replace(/\.(jpe?g|png|webp)$/i, '');
      figure.append(tag);
    }
  }
  return figure;
}

function appendLabelledBlock(parent, label, value, list = false) {
  const block = document.createElement('section');
  block.className = 'detail-story-block';
  const heading = document.createElement('h3');
  heading.textContent = label;
  block.append(heading);
  if (list) {
    const items = document.createElement('ol');
    value.forEach((entry) => { const item = document.createElement('li'); item.textContent = entry; items.append(item); });
    block.append(items);
  } else {
    const paragraph = document.createElement('p');
    paragraph.textContent = value;
    block.append(paragraph);
  }
  parent.append(block);
}

function spotifyUrl(value) {
  if (/^https?:\/\//.test(value)) {
    const match = value.match(/(?:track|episode|album)\/([A-Za-z0-9_-]+)/);
    return match ? `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator` : value;
  }
  return `https://open.spotify.com/embed/track/${encodeURIComponent(value)}?utm_source=generator`;
}

export function renderDetailShell() {
  const detail = document.querySelector('#detail');
  if (!detail) return;
  detail.setAttribute('role', 'dialog');
  detail.setAttribute('aria-modal', 'true');
  detail.setAttribute('aria-labelledby', 'detail-project-title');
  detail.innerHTML = '<div class="detail-ground" aria-hidden="true"><img class="detail-ground-photo" alt="" decoding="async"><div class="detail-ground-vellum"></div></div><div class="detail-shell"><button class="detail-close" type="button"></button><div class="detail-content"></div></div>';
  const close = detail.querySelector('.detail-close');
  close.textContent = SITE.detailUi.close;
  close.addEventListener('click', () => closeDetail());
  detail.addEventListener('keydown', trapFocus);
  if (!listenersBound) {
    window.addEventListener('hashchange', syncDetailFromHash);
    window.addEventListener('portfolio:languagechange', () => { if (currentSlug) openDetail(currentSlug, document.documentElement.lang, { updateHash: false, preserveFocus: true }); });
    listenersBound = true;
  }
  requestAnimationFrame(syncDetailFromHash);
}

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const focusable = [...event.currentTarget.querySelectorAll('button, [href], iframe, [tabindex]:not([tabindex="-1"])')].filter((node) => !node.disabled && !node.closest('[hidden]'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

let detachLens = null;

function groundFor(project) {
  const map = SITE.detailGround || {};
  if (map[project.slug]) return map[project.slug];
  const pool = SITE.detailGroundPool || [];
  const index = Math.max(0, PROJECTS.findIndex((item) => item.slug === project.slug));
  return pool.length ? pool[index % pool.length] : project.thumb;
}

function renderProject(detail, project, lang) {
  const copy = project.nar[lang] || project.nar.ko;
  const content = detail.querySelector('.detail-content');
  content.innerHTML = '';
  /* the moodboard ground: the project's photo, blurred, under translucent paper */
  const ground = detail.querySelector('.detail-ground-photo');
  if (ground) {
    const source = groundFor(project);
    ground.classList.remove('is-on');
    ground.onload = () => ground.classList.add('is-on');
    ground.src = source;
    if (ground.complete && ground.naturalWidth) ground.classList.add('is-on');
  }

  /* the project's song: top right of the page, as small as it goes — three tiny lines (SOUNDTRACK, why this
     song, the full song on YouTube) to the left of the 80px Spotify bar. No autoplay; the player is toned down
     and comes back to full colour under the pointer */
  if (project.spotify) {
    const track = document.createElement('aside');
    track.className = 'detail-track';
    const text = document.createElement('div');
    text.className = 'detail-track-text';
    const label = document.createElement('span'); label.className = 'detail-track-label'; label.textContent = SITE.detailUi.soundtrack;
    text.append(label);
    const noteText = translated(project.spotifyNote, lang);
    if (noteText) { const note = document.createElement('span'); note.textContent = noteText; text.append(note); }
    const youtube = project.songYoutube || (project.song ? `https://www.youtube.com/results?search_query=${encodeURIComponent(project.song)}` : null);
    if (youtube) {
      const listen = document.createElement('a');
      listen.href = youtube; listen.target = '_blank'; listen.rel = 'noopener noreferrer';
      listen.textContent = translated(SITE.detailUi.fullSong, lang) || 'Full song on YouTube ↗';
      text.append(listen);
    }
    const iframe = document.createElement('iframe');
    iframe.className = 'detail-spotify';
    iframe.title = `${SITE.detailUi.soundtrack} · ${copy.title}`;
    iframe.src = spotifyUrl(project.spotify);
    iframe.allow = 'clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    track.append(text, iframe);
    content.append(track);
  }

  const hero = createMedia(project.thumb, SITE.detailUi.heroSlot, 'detail-hero', copy.title, true);
  detachLens?.(); detachLens = attachLens(hero); /* the magnifier lives on the cover photo */
  const header = document.createElement('header');
  header.className = 'detail-header';
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = /\d{4}/.test(copy.cat || '') ? copy.cat : [project.period, copy.cat].filter(Boolean).join(' · ');
  const title = document.createElement('h2');
  title.id = 'detail-project-title';
  title.className = 'detail-title';
  title.textContent = copy.title;
  const headline = document.createElement('p');
  headline.className = 'detail-headline';
  headline.textContent = copy.headline;
  header.append(meta, title, headline);
  content.append(hero, header);

  if (Array.isArray(copy.metrics) && copy.metrics.length) {
    const metrics = document.createElement('div');
    metrics.className = 'detail-metrics';
    copy.metrics.slice(0, 3).forEach((metric) => {
      const item = document.createElement('div');
      const value = document.createElement('strong'); value.textContent = metric.v;
      const label = document.createElement('span'); label.textContent = metric.l;
      item.append(value, label); metrics.append(item);
    });
    content.append(metrics);
  }

  const role = document.createElement('p');
  role.className = 'detail-role';
  const roleLabel = document.createElement('span'); roleLabel.textContent = SITE.detailUi.role;
  role.append(roleLabel, document.createTextNode(translated(project.role, lang) || ''));
  content.append(role);
  if (copy.note) {
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = copy.note;
    content.append(note);
  }

  const films = [project.video, project.video2].filter(Boolean);
  if (films.length) {
    const filmSection = document.createElement('section');
    filmSection.className = 'detail-films';
    const filmTitle = document.createElement('h3'); filmTitle.textContent = SITE.detailUi.film;
    filmSection.append(filmTitle);
    films.forEach((source, index) => {
      const frame = document.createElement('div');
      frame.className = 'detail-film';
      const iframe = document.createElement('iframe');
      iframe.src = source;
      iframe.title = `${copy.title} · ${SITE.detailUi.film} ${index + 1}`;
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.append(iframe);
      filmSection.append(frame);
      /* a plain link under every film: the embed can be blocked (the review preview blocks all outside
         frames, some browsers block YouTube cookies), and then this is the way to the video */
      const id = (source.match(/(?:embed\/|youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{6,})/) || [])[1];
      if (id) {
        const link = document.createElement('a');
        link.className = 'detail-film-link';
        link.href = `https://www.youtube.com/watch?v=${id}`;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = translated(SITE.detailUi.watch, lang) || 'Watch on YouTube ↗';
        filmSection.append(link);
      }
    });
    content.append(filmSection);
  }

  if (Array.isArray(copy.roles) && copy.roles.length) {
    /* one project, two jobs (the fashion show: designer | promotion team) — each column carries its own
       need / action / result, side by side with a gap between them and no rule */
    const roles = document.createElement('div');
    roles.className = 'detail-roles';
    copy.roles.forEach((part) => {
      const column = document.createElement('div');
      column.className = 'detail-story detail-role-column';
      const label = document.createElement('h3'); label.className = 'detail-role-label'; label.textContent = part.label;
      column.append(label);
      appendLabelledBlock(column, SITE.detailUi.need, part.need || '');
      appendLabelledBlock(column, SITE.detailUi.action, Array.isArray(part.action) ? part.action : [], true);
      if (Array.isArray(part.result) && part.result.length) appendLabelledBlock(column, SITE.detailUi.result, part.result, true);
      (part.images || []).forEach((source) => column.append(createMedia(source, SITE.detailUi.gallerySlot, 'detail-role-image', `${copy.title} · ${part.label}`)));
      roles.append(column);
    });
    content.append(roles);
  } else {
    const story = document.createElement('div');
    story.className = 'detail-story';
    appendLabelledBlock(story, SITE.detailUi.need, copy.need || '');
    appendLabelledBlock(story, SITE.detailUi.action, Array.isArray(copy.action) ? copy.action : [], true);
    if (Array.isArray(copy.result) && copy.result.length) appendLabelledBlock(story, SITE.detailUi.result, copy.result, true);
    else {
      const pending = document.createElement('section');
      pending.className = 'detail-story-block detail-result-pending';
      const heading = document.createElement('h3'); heading.textContent = SITE.detailUi.result;
      const message = document.createElement('p'); message.textContent = SITE.detail.resultTbc;
      pending.append(heading, message); story.append(pending);
    }
    content.append(story);
  }

  if (copy.detail?.title && Array.isArray(copy.detail.body) && copy.detail.body.length) {
    const expandable = document.createElement('section');
    expandable.className = 'detail-expandable';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'detail-expand-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const body = document.createElement('div');
    body.className = 'detail-expand-body';
    body.hidden = true;
    copy.detail.body.forEach((paragraphText) => { const paragraph = document.createElement('p'); paragraph.textContent = paragraphText; body.append(paragraph); });
    const syncToggle = () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.textContent = open ? `${copy.detail.title} · ${SITE.detailUi.closeExpanded}` : `${copy.detail.title} +`; };
    toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', `${!open}`); body.hidden = open; expandable.classList.toggle('is-open', !open); syncToggle(); });
    syncToggle();
    expandable.append(toggle, body); content.append(expandable);
  }

  if (project.press) {
    /* one quoted article (an object), or a list of articles; an entry without a quote is just a link line */
    const items = Array.isArray(project.press) ? project.press : [project.press];
    const pressSection = document.createElement('section');
    pressSection.className = 'detail-press';
    const pressTitle = document.createElement('h3'); pressTitle.textContent = SITE.detailUi.press;
    pressSection.append(pressTitle);
    items.forEach((press) => {
      const outlet = translated(press.outlet, lang) || '';
      const headline = translated(press.headline, lang) || '';
      const cite = document.createElement('cite');
      if (press.url) {
        const link = document.createElement('a');
        link.href = press.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = `${outlet} · ${headline}${press.quote ? '' : ' ↗'}`;
        cite.append(link);
      } else cite.textContent = `${outlet} · ${headline}`;
      if (press.date) cite.append(document.createTextNode(` · ${press.date}`));
      if (press.quote) {
        const quote = document.createElement('blockquote');
        const quoteText = document.createElement('p'); quoteText.textContent = translated(press.quote, lang) || '';
        quote.append(quoteText, cite);
        pressSection.append(quote);
      } else {
        const line = document.createElement('p'); line.className = 'detail-press-link';
        line.append(cite);
        pressSection.append(line);
      }
    });
    content.append(pressSection);
  }

  const small = new Set((project.small || []).map(normalizeSource));
  const addGallery = (sources, title, extraClass, rowTarget) => {
    const gallerySection = document.createElement('section');
    gallerySection.className = `detail-gallery-section${extraClass ? ` ${extraClass}` : ''}`;
    const galleryTitle = document.createElement('h3'); galleryTitle.textContent = title;
    const gallery = document.createElement('div'); gallery.className = 'detail-gallery';
    sources.forEach((source, index) => {
      const item = createMedia(source, `${SITE.detailUi.gallerySlot} ${String(index + 1).padStart(2, '0')}`, 'detail-gallery-item', `${copy.title} ${index + 1}`);
      if (small.has(normalizeSource(source))) item.classList.add('is-small');
      gallery.append(item);
    });
    justifyGallery(gallery, rowTarget);
    gallerySection.append(galleryTitle, gallery); content.append(gallerySection);
  };
  /* the hero already shows the thumb — don't repeat it as the first gallery item */
  const gallerySources = (project.images || []).filter((source) => normalizeSource(source) !== normalizeSource(project.thumb));
  if (gallerySources.length) addGallery(gallerySources, SITE.detailUi.gallery);
  /* extra titled sets in a fixed order, e.g. how the mind map grew from a sketch */
  (project.galleries || []).forEach((set) => { if (set.images?.length) addGallery(set.images, translated(set.title, lang) || '', 'detail-extra', set.rowTarget || 340); });
  /* 작업과정 — the making-of pictures, gathered under the finished work with a small label */
  if (Array.isArray(project.process) && project.process.length) addGallery(project.process, translated(SITE.detailUi.process, lang) || 'PROCESS', 'detail-process', 300);

}

export function openDetail(slug, lang = document.documentElement.lang, options = {}) {
  const detail = document.querySelector('#detail');
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!detail || !project) return;
  if (!options.preserveFocus) lastFocus = document.activeElement;
  currentSlug = slug;
  renderProject(detail, project, lang);
  detail.hidden = false;
  detail.setAttribute('data-lenis-prevent', ''); /* Lenis is paused while the overlay is open — it must not swallow the overlay's own wheel events */
  detail.scrollTop = 0;
  document.body.classList.add('detail-open');
  window.__lenis?.stop?.();
  if (options.updateHash !== false && location.hash !== `#p/${encodeURIComponent(slug)}`) {
    openedViaPush = true;
    history.pushState({ project: slug }, '', `#p/${encodeURIComponent(slug)}`);
  }
  detail.querySelector('.detail-close')?.focus();
}

export function closeDetail(options = {}) {
  const detail = document.querySelector('#detail');
  if (!detail || detail.hidden) return;
  detail.hidden = true;
  /* closing the project silences anything still playing in it (the song, a film) */
  detail.querySelectorAll('iframe').forEach((frame) => { frame.src = 'about:blank'; });
  document.body.classList.remove('detail-open');
  window.__lenis?.start?.();
  currentSlug = null;
  if (options.updateHash !== false && location.hash.startsWith('#p/')) {
    if (openedViaPush && history.length > 1) history.back();
    else history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
  openedViaPush = false;
  if (!options.preserveFocus && lastFocus?.isConnected) lastFocus.focus();
}

function syncDetailFromHash() {
  if (location.hash.startsWith('#p/')) {
    const slug = decodeURIComponent(location.hash.slice(3));
    openedViaPush = false;
    openDetail(slug, document.documentElement.lang, { updateHash: false });
  } else if (currentSlug) closeDetail({ updateHash: false });
}

export function getOpenDetailSlug() {
  return currentSlug;
}
