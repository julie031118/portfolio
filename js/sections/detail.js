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
   Row height aims for ~560px and never scales an image past 1.15× its pixels. */
function justifyGallery(gallery) {
  const items = [...gallery.querySelectorAll('.detail-gallery-item')];
  const layout = () => {
    const width = gallery.clientWidth;
    if (!width) return;
    const ready = items.filter((item) => item.querySelector('img')?.naturalWidth);
    if (!ready.length) return;
    const target = Math.min(620, Math.max(360, width * .46));
    let row = []; let rowRatio = 0;
    const flush = (last) => {
      if (!row.length) return;
      let height = width / rowRatio;
      if (last && height > target * 1.15) height = target * 1.15; /* a short last row is left-aligned, not stretched */
      const maxNatural = Math.min(...row.map(({ img }) => img.naturalHeight * 1.15));
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
    image.loading = eager ? 'eager' : 'lazy';
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
  detail.innerHTML = '<div class="detail-shell"><button class="detail-close" type="button"></button><div class="detail-content"></div></div>';
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

function renderProject(detail, project, lang) {
  const copy = project.nar[lang] || project.nar.ko;
  const content = detail.querySelector('.detail-content');
  content.innerHTML = '';

  const hero = createMedia(project.thumb, SITE.detailUi.heroSlot, 'detail-hero', copy.title, true);
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
      iframe.title = `${copy.title} — ${SITE.detailUi.film} ${index + 1}`;
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.append(iframe);
      filmSection.append(frame);
    });
    content.append(filmSection);
  }

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
    const press = project.press;
    const pressSection = document.createElement('section');
    pressSection.className = 'detail-press';
    const pressTitle = document.createElement('h3'); pressTitle.textContent = SITE.detailUi.press;
    const quote = document.createElement('blockquote');
    const quoteText = document.createElement('p'); quoteText.textContent = translated(press.quote, lang) || '';
    const cite = document.createElement('cite');
    const outlet = translated(press.outlet, lang) || '';
    const headline = translated(press.headline, lang) || '';
    if (press.url) {
      const link = document.createElement('a');
      link.href = press.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = `${outlet} · ${headline}`;
      cite.append(link);
    } else cite.textContent = `${outlet} · ${headline}`;
    if (press.date) cite.append(document.createTextNode(` · ${press.date}`));
    quote.append(quoteText, cite);
    pressSection.append(pressTitle, quote);
    content.append(pressSection);
  }

  if (Array.isArray(project.images) && project.images.length) {
    const gallerySection = document.createElement('section');
    gallerySection.className = 'detail-gallery-section';
    const galleryTitle = document.createElement('h3'); galleryTitle.textContent = SITE.detailUi.gallery;
    const gallery = document.createElement('div'); gallery.className = 'detail-gallery';
    /* the hero already shows the thumb — don't repeat it as the first gallery item */
    project.images.filter((source) => normalizeSource(source) !== normalizeSource(project.thumb)).forEach((source, index) => gallery.append(createMedia(source, `${SITE.detailUi.gallerySlot} ${String(index + 1).padStart(2, '0')}`, 'detail-gallery-item', `${copy.title} ${index + 1}`)));
    justifyGallery(gallery);
    gallerySection.append(galleryTitle, gallery); content.append(gallerySection);
  }

  if (project.spotify) {
    const soundtrack = document.createElement('section');
    soundtrack.className = 'detail-soundtrack';
    const soundtrackTitle = document.createElement('h3'); soundtrackTitle.textContent = SITE.detailUi.soundtrack;
    const iframe = document.createElement('iframe');
    iframe.className = 'detail-spotify';
    iframe.title = `${SITE.detailUi.soundtrack} — ${copy.title}`;
    iframe.loading = 'lazy';
    iframe.src = spotifyUrl(project.spotify);
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    soundtrack.append(soundtrackTitle, iframe);
    const noteText = translated(project.spotifyNote, lang);
    if (noteText) { const note = document.createElement('p'); note.textContent = noteText; soundtrack.append(note); }
    content.append(soundtrack);
  }
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
