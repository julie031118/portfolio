import { T } from './render-shell.js';
import { openDetail } from './detail.js';

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let instance = null;

function sortedProjects() {
  return PROJECTS.map((project, index) => ({ project, index })).sort((a, b) => {
    const featuredA = Number.isFinite(a.project.featured) ? a.project.featured : Number.POSITIVE_INFINITY;
    const featuredB = Number.isFinite(b.project.featured) ? b.project.featured : Number.POSITIVE_INFINITY;
    if (featuredA !== featuredB) return featuredA - featuredB;
    const rankA = Number.isFinite(a.project.archiveRank) ? a.project.archiveRank : Number.POSITIVE_INFINITY;
    const rankB = Number.isFinite(b.project.archiveRank) ? b.project.archiveRank : Number.POSITIVE_INFINITY;
    if (rankA !== rankB) return rankA - rankB;
    const yearDifference = Number.parseInt(b.project.year, 10) - Number.parseInt(a.project.year, 10);
    return yearDifference || a.index - b.index;
  }).map(({ project }) => project);
}

function filterFromHash() {
  if (!window.location.hash.startsWith('#archive/')) return 'ALL';
  let value = 'ALL';
  try { value = decodeURIComponent(window.location.hash.slice('#archive/'.length)).toUpperCase(); } catch { value = 'ALL'; }
  return SITE.archiveUi.filters.some((filter) => filter.label === value) ? value : 'ALL';
}

function filterHash(filter) {
  return `#archive/${encodeURIComponent(filter)}`;
}

function projectMatches(project, filter) {
  if (filter === 'ALL') return true;
  const target = SITE.archiveUi.filters.find((item) => item.label === filter)?.tag;
  return target ? project.tags.includes(target) : true;
}

/* NOW: this term's courses, as three short lines under the grid (they used to be placeholder cards) */
function nowMarkup(lang) {
  const items = SITE.now || [];
  if (!items.length) return '';
  const list = items.map((item) => `
        <li class="now-item">
          <p class="now-label">${T(item.label, lang)}</p>
          <p class="now-claim">${T(item.claim, lang)}</p>
          <p class="now-evidence">${T(item.evidence, lang)}</p>
          ${item.media?.video ? `<figure class="now-media"><video poster="${item.media.poster || ''}" muted loop playsinline preload="none" aria-label="${T(item.media.caption, lang) || ''}">${item.media.webm ? `<source src="${item.media.webm}" type="video/webm">` : ''}<source src="${item.media.video}" type="video/mp4"></video><figcaption>${T(item.media.caption, lang) || ''}</figcaption></figure>` : ''}
          ${item.next ? `<p class="now-next"><span>${T(SITE.nowUi.next, lang)}</span>${T(item.next, lang)}</p>` : ''}
        </li>`).join('');
  return `
      <section class="now-block" id="now" aria-labelledby="now-title">
        <div class="now-head"><h2 id="now-title">${SITE.nowUi.title}</h2><span>${SITE.nowUi.index}</span></div>
        ${SITE.nowUi.lead ? `<p class="now-lead">${T(SITE.nowUi.lead, lang)}</p>` : ''}
        <ol class="now-list">${list}
        </ol>
      </section>`;
}

export function renderArchive(lang) {
  instance?.destroy();
  const section = document.querySelector('#archive');
  section.className = 'site-section archive-section';
  section.innerHTML = `
    <div class="archive-inner">
      <div class="section-heading"><span>${SITE.sections.archive.title}</span><span class="section-heading__index">${SITE.sections.archive.index}</span></div>
      <nav class="archive-filters" aria-label="${SITE.archiveUi.filterLabel}"></nav>
      <div class="archive-grid" aria-live="polite"></div>
      ${nowMarkup(lang)}
    </div>`;

  const filtersRoot = section.querySelector('.archive-filters');
  const grid = section.querySelector('.archive-grid');
  const projects = sortedProjects();
  let activeFilter = filterFromHash();
  let flipAnimation = null;

  const filterButtons = SITE.archiveUi.filters.map((filter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'archive-filter';
    button.dataset.filter = filter.label;
    button.addEventListener('click', () => applyFilter(filter.label, true, true));
    filtersRoot.append(button);
    return button;
  });

  const cards = projects.map((project) => {
    const copy = project.nar[lang] || project.nar.ko;
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.slug = project.slug;
    card.dataset.tags = project.tags.join(' ');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'archive-card-button';
    button.setAttribute('aria-label', `${copy.title} · ${copy.cat}`);
    const image = document.createElement('div');
    image.className = 'card-img';
    const slot = document.createElement('span');
    slot.className = 'archive-image-slot';
    slot.textContent = SITE.archiveUi.imageSlot;
    image.append(slot);
    const cardSource = project.cardThumb || project.thumb; /* cardThumb: a crop for the 3:4 card only, the detail hero keeps thumb */
    if (cardSource && !/\/images\/x\.jpg$|\/images\/projects\/x\//.test(cardSource)) {
      const picture = document.createElement('img');
      picture.loading = 'lazy';
      picture.decoding = 'async';
      picture.alt = '';
      picture.addEventListener('load', () => image.classList.add('has-image'), { once: true });
      picture.addEventListener('error', () => image.classList.remove('has-image'), { once: true });
      picture.src = cardSource.replace(/^\//, '');
      image.append(picture);
    }
    if (project.tags.includes('NOW')) {
      const badge = document.createElement('span');
      badge.className = 'archive-now-badge';
      badge.textContent = SITE.archiveUi.inProgress;
      image.append(badge);
    }
    const meta = document.createElement('div');
    meta.className = 'archive-card-meta';
    const title = document.createElement('h2');
    title.className = 'archive-card-title';
    title.textContent = copy.title;
    const details = document.createElement('div');
    details.className = 'archive-card-details';
    const category = document.createElement('span');
    category.textContent = copy.cat;
    const year = document.createElement('span');
    year.textContent = project.year;
    details.append(category, year);
    meta.append(title, details);
    button.append(image, meta);
    button.addEventListener('click', () => openDetail(project.slug, lang));
    card.append(button);
    grid.append(card);
    return card;
  });

  function updateFilterButtons() {
    filterButtons.forEach((button) => {
      const filter = button.dataset.filter;
      const active = filter === activeFilter;
      const count = projects.filter((project) => projectMatches(project, filter)).length;
      button.textContent = active ? `${filter} (${count})` : filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  /* a filter can carry its own order (SITE.archiveUi.order, keyed by tag): the cards are re-appended in that order.
     Moving DOM nodes (not inline `order`) because finishFlip wipes every inline style. */
  function orderCards() {
    const tag = SITE.archiveUi.filters.find((item) => item.label === activeFilter)?.tag;
    const list = (tag && SITE.archiveUi.order?.[tag]) || [];
    const rank = (index) => { const at = list.indexOf(projects[index].slug); return at < 0 ? list.length + index : at; };
    cards.map((card, index) => index).sort((a, b) => rank(a) - rank(b)).forEach((index) => grid.append(cards[index]));
  }

  /* a project can show another card image while one filter is on (fashion show: its Instagram feed under CONTENT) */
  function swapThumbs() {
    const tag = SITE.archiveUi.filters.find((item) => item.label === activeFilter)?.tag;
    cards.forEach((card, index) => {
      const project = projects[index];
      if (!project.filterThumbs) return;
      const picture = card.querySelector('.card-img img');
      if (!picture) return;
      const next = ((tag && project.filterThumbs[tag]) || project.cardThumb || project.thumb).replace(/^\//, '');
      if (picture.getAttribute('src') !== next) picture.src = next;
    });
  }

  function toggleCards() {
    orderCards();
    swapThumbs();
    cards.forEach((card, index) => { card.hidden = !projectMatches(projects[index], activeFilter); });
  }

  /* a Flip stopped halfway leaves the cards absolutely positioned on top of each other: always run it to the
     end and wipe the inline styles before starting another */
  function finishFlip() {
    const running = flipAnimation;
    flipAnimation = null;
    if (running) { running.progress(1); running.kill(); }
    if (window.gsap) gsap.set(cards, { clearProps: 'all' });
  }

  function applyFilter(nextFilter, animate = true, updateUrl = false) {
    if (!SITE.archiveUi.filters.some((filter) => filter.label === nextFilter)) nextFilter = 'ALL';
    const changed = nextFilter !== activeFilter;
    /* a link click fires both hashchange and popstate: the second call must not touch a running Flip */
    if (!changed && flipAnimation) { updateFilterButtons(); return; }
    activeFilter = nextFilter;
    finishFlip();
    if (changed && animate && !reducedQuery.matches && window.Flip && window.gsap) {
      const state = Flip.getState(cards);
      toggleCards();
      flipAnimation = Flip.from(state, {
        duration: .8,
        ease: 'expo.inOut',
        absolute: true,
        stagger: .02,
        onEnter: (elements) => gsap.fromTo(elements, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .35, overwrite: true }),
        onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: .96, duration: .25, overwrite: true }),
        onComplete: () => { flipAnimation = null; gsap.set(cards, { clearProps: 'all' }); },
      });
    } else toggleCards();
    updateFilterButtons();
    if (updateUrl && window.location.hash !== filterHash(activeFilter)) window.history.pushState({ archiveFilter: activeFilter }, '', filterHash(activeFilter));
  }

  function scrollToArchive() {
    requestAnimationFrame(() => {
      if (window.__lenis) window.__lenis.scrollTo(section, { duration: .8, force: true, onComplete: () => { const offset = section.getBoundingClientRect().top; if (Math.abs(offset) > 1) window.__lenis.scrollTo(window.scrollY + offset, { immediate: true, force: true }); } });
      else section.scrollIntoView({ behavior: reducedQuery.matches ? 'auto' : 'smooth' });
    });
  }

  function syncFromLocation() {
    if (!window.location.hash.startsWith('#archive/')) return;
    /* coming from far away (an intro label), the grid just switches: nobody is watching it move */
    const bounds = section.getBoundingClientRect();
    const inView = bounds.top < window.innerHeight && bounds.bottom > 0;
    applyFilter(filterFromHash(), inView, false);
    scrollToArchive();
  }

  const nowVideos = [...section.querySelectorAll('.now-media video')];
  let nowObserver = null;
  if (nowVideos.length && !reducedQuery.matches && 'IntersectionObserver' in window) {
    nowObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) { const playing = video.play(); if (playing?.catch) playing.catch(() => {}); }
      else video.pause();
    }), { rootMargin: '120px 0px' });
    nowVideos.forEach((video) => nowObserver.observe(video));
  }

  function onHistory() { syncFromLocation(); }
  window.addEventListener('hashchange', onHistory);
  window.addEventListener('popstate', onHistory);
  applyFilter(activeFilter, false, false);

  let readyHandler = null;
  if (window.location.hash.startsWith('#archive/')) {
    if (window.__introReady) scrollToArchive();
    else {
      readyHandler = scrollToArchive;
      window.addEventListener('portfolio:intro-ready', readyHandler, { once: true });
    }
  }

  instance = {
    destroy() {
      finishFlip();
      nowObserver?.disconnect();
      window.removeEventListener('hashchange', onHistory);
      window.removeEventListener('popstate', onHistory);
      if (readyHandler) window.removeEventListener('portfolio:intro-ready', readyHandler);
    },
    applyFilter,
    getFilter: () => activeFilter,
  };
  window.__archiveStage = instance;
  return instance;
}
