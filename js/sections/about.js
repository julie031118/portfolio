import { ringTick } from '../audio.js';
import { phoneSrc } from '../phone-images.js';
import { T, releaseWebGL } from './render-shell.js';
import { openDetail } from './detail.js';
import { reducedMotion } from '../motion.js';

const mobileQuery = window.matchMedia('(max-width: 600px), (hover: none)');
const reducedQuery = reducedMotion;
let instance = null;

function appendMarkedClaim(container, claim, keyword, onBind) {
  const index = claim.indexOf(keyword);
  if (index < 0) { container.textContent = claim; return; }
  container.append(document.createTextNode(claim.slice(0, index)));
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'about-strength-keyword'; button.textContent = keyword;
  onBind(button);
  container.append(button, document.createTextNode(claim.slice(index + keyword.length)));
}

function mediaMarkup(className, label) {
  return `<div class="${className}"><img alt=""><span>${label}</span></div>`;
}

function loadMedia(frame, source, alt) {
  source = phoneSrc(source); /* phones get the lighter copy, if there is one */
  const image = frame.querySelector('img');
  image.alt = alt;
  const shown = () => frame.classList.add('has-image');
  /* hovering the same word again sets the same src: Safari fires no load event then, and the photo never came
     back (2026-10-02). An image that is already there is shown at once. */
  if (image.getAttribute('src') === source && image.complete && image.naturalWidth) { shown(); return; }
  image.addEventListener('load', shown, { once: true });
  image.addEventListener('error', () => frame.classList.remove('has-image'), { once: true });
  image.src = source;
  if (image.complete && image.naturalWidth) shown();
}

/* '2024.07 ~ 2025.06', or '2024.09 ~ 12' inside one year */
function dateRange(item) {
  if (!item.until) return item.date;
  const [startYear] = item.date.split('.'); const [endYear, endMonth] = item.until.split('.');
  return `${item.date} ~ ${startYear === endYear ? endMonth : item.until}`;
}

/* which semester column a month falls in: '2024-1' (Jan to Jun) or '2024-2', else the whole-year column */
function semesterOf(month) {
  const [year, value] = month.split('.').map(Number); const half = value <= 6 ? 1 : 2;
  let index = SITE.timeline.findIndex((segment) => segment.segment === `${year}-${half}`);
  if (index < 0) index = SITE.timeline.findIndex((segment) => String(segment.segment).startsWith(String(year)));
  return { index, half, value };
}

function buildTimeline(track, lang) {
  track.innerHTML = SITE.timeline.map((segment) => {
    const grade = T(segment.grade, lang);
    const items = segment.items.map((item, index) => `<button class="timeline-item${item.major ? ' is-major' : ''}" type="button" data-item-index="${index}"><span class="timeline-item-date">${dateRange(item)}</span><span class="timeline-item-title">${T(item.title, lang)}</span></button>`).join('');
    return `<section class="timeline-segment timeline-segment--count-${segment.items.length}"><div class="timeline-segment-marker"><span class="timeline-year">${segment.segment}</span><span class="timeline-grade">${grade}</span></div><div class="timeline-items">${items}</div></section>`;
  }).join('');
}

export function renderAbout(lang) {
  instance?.destroy();
  const section = document.querySelector('#about');
  section.className = 'site-section about-section';
  section.innerHTML = `
    <div class="about-inner">
      <div class="section-heading"><span>${SITE.sections.about.title}</span><span class="section-heading__index">${SITE.sections.about.index}</span></div>
      <section class="about-strengths-grid" aria-labelledby="about-strengths-title">
        <div class="about-strengths-copy"><p id="about-strengths-title" class="about-kicker">${SITE.aboutUi.strengths}</p><ol class="about-strength-list"></ol><p class="about-strength-hint">${T(mobileQuery.matches ? SITE.aboutUi.strengthHintTouch : SITE.aboutUi.strengthHint, lang)}</p></div>
        <figure class="about-photo ${(SITE.profile.photos || [SITE.profile.photo]).length === 1 ? 'about-photo--single' : `about-photo--stack about-photo--count-${(SITE.profile.photos || [SITE.profile.photo]).length}`}">${(SITE.profile.photos || [SITE.profile.photo]).map((_, index) => mediaMarkup(`about-photo-frame about-photo-frame--${index + 1}`, SITE.aboutUi.photoSlot)).join('')}<figcaption>${SITE.aboutUi.profile}</figcaption></figure>
      </section>
      <section class="about-stats" aria-label="${SITE.aboutUi.stats}"></section>
      ${(SITE.profile.experience || []).length ? `<section class="about-awards about-experience" aria-labelledby="about-exp-title"><h2 id="about-exp-title">${SITE.aboutUi.experience || 'EXPERIENCE'}</h2><ol class="about-award-list about-exp-list"></ol></section>` : ''}
      ${(SITE.profile.activities || []).length ? `<section class="about-awards about-activities" aria-labelledby="about-act-title"><h2 id="about-act-title">${SITE.aboutUi.activities || 'ACTIVITIES'}</h2><ol class="about-award-list about-act-list"></ol></section>` : ''}
      ${(SITE.profile.awards || []).length ? `<section class="about-awards" aria-labelledby="about-awards-title"><h2 id="about-awards-title">${SITE.aboutUi.awards || 'AWARDS'}</h2><ol class="about-award-list"></ol></section>` : ''}
      <section class="about-skills" aria-labelledby="about-skills-title"><h2 id="about-skills-title">${SITE.aboutUi.skills}</h2><div class="about-skill-groups"></div></section>
      <section class="about-timeline is-collapsed" aria-labelledby="about-timeline-title"><div class="timeline-pin"><div class="timeline-topline"><h2 id="about-timeline-title">${SITE.aboutUi.timeline}</h2><span class="timeline-topline-end"><span>${String(SITE.timeline[0].segment).slice(0, 4)} <span class="timeline-topline-arrow">→</span> ${String(SITE.timeline[SITE.timeline.length - 1].segment).slice(0, 4)}</span><button class="timeline-toggle" type="button" aria-expanded="false" aria-controls="about-timeline-viewport"></button></span></div><div class="timeline-viewport" id="about-timeline-viewport"><div class="timeline-track"></div></div></div></section>
    </div>
    <div class="strength-media-popup" aria-hidden="true">${mediaMarkup('strength-media-frame', SITE.aboutUi.mediaSlot)}</div>
    <aside class="timeline-side-panel" aria-hidden="true"><div class="timeline-panel-inner"></div></aside>`;

  const strengthsList = section.querySelector('.about-strength-list');
  const popup = section.querySelector('.strength-media-popup');
  const popupFrame = popup.querySelector('.strength-media-frame');
  /* One tween at a time. The old enter (0.3 s) and leave (0.2 s) tweens ran side by side, so a quick
     hover-and-leave let the enter tween finish last and park the popup at opacity 1 — the "stuck photo". */
  function showPopup(event) {
    gsap.killTweensOf(popup);
    popup.classList.add('is-visible');
    gsap.set(popup, { x: Math.min(window.innerWidth - 244, event.clientX + 20), y: Math.min(window.innerHeight - 295, event.clientY + 18) });
    gsap.fromTo(popup, { clipPath: 'inset(0 100% 0 0)', opacity: 0 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: .3, ease: 'power2.out', overwrite: true });
  }
  function hidePopup() {
    gsap.killTweensOf(popup);
    gsap.to(popup, { opacity: 0, duration: .18, overwrite: true, onComplete: () => { popup.classList.remove('is-visible'); gsap.set(popup, { opacity: 0 }); } });
  }
  /* safety nets: leaving the list or scrolling always clears it */
  section.addEventListener('pointerleave', () => { if (popup.classList.contains('is-visible')) hidePopup(); });
  window.addEventListener('scroll', () => { if (popup.classList.contains('is-visible')) hidePopup(); }, { passive: true });
  const photoFrames = [...section.querySelectorAll('.about-photo-frame')];
  const stats = section.querySelector('.about-stats');
  const track = section.querySelector('.timeline-track');
  const timeline = section.querySelector('.about-timeline');
  const timelinePin = section.querySelector('.timeline-pin');
  const panel = section.querySelector('.timeline-side-panel');
  const panelInner = panel.querySelector('.timeline-panel-inner');
  const skills = section.querySelector('.about-skill-groups');
  let horizontalTween = null;
  let mobileObserver = null;
  let panelTimer = 0;
  let pendingLoadHandler = null;

  SITE.profile.strengths.slice(0, 3).forEach((strength) => {
    const item = document.createElement('li'); item.className = 'about-strength-item';
    const claim = document.createElement('p'); claim.className = 'about-strength-claim';
    const evidence = document.createElement('p'); evidence.className = 'about-strength-evidence'; evidence.textContent = T(strength.evidence, lang);
    const inline = document.createElement('div'); inline.className = 'about-strength-inline'; inline.innerHTML = mediaMarkup('strength-inline-frame', SITE.aboutUi.mediaSlot);
    loadMedia(inline.querySelector('.strength-inline-frame'), strength.media, T(strength.claim, lang));
    appendMarkedClaim(claim, T(strength.claim, lang), T(strength.keyword, lang), (keyword) => {
      if (mobileQuery.matches) {
        keyword.addEventListener('click', () => { const open = item.classList.contains('is-media-open'); strengthsList.querySelectorAll('.about-strength-item').forEach((node) => node.classList.remove('is-media-open')); if (!open) item.classList.add('is-media-open'); });
      } else {
        keyword.addEventListener('pointerenter', (event) => { popupFrame.classList.remove('has-image'); loadMedia(popupFrame, strength.media, T(strength.claim, lang)); showPopup(event); });
        keyword.addEventListener('pointermove', (event) => gsap.set(popup, { x: Math.min(window.innerWidth - 244, event.clientX + 20), y: Math.min(window.innerHeight - 295, event.clientY + 18) }));
        keyword.addEventListener('pointerleave', hidePopup);
        if (strength.link) keyword.addEventListener('click', () => openDetail(strength.link, lang));
      }
    });
    item.append(claim, evidence, inline); strengthsList.append(item);
  });

  /* three overlapping photos (the lens moved to the project cover — a magnified face looked wrong) */
  const photoSources = SITE.profile.photos || [SITE.profile.photo];
  photoFrames.forEach((frame, index) => { loadMedia(frame, photoSources[index], SITE.profile.photoAlt[lang] || SITE.profile.photoAlt.ko); });

  SITE.profile.stats.forEach((stat) => { const cell = document.createElement('div'); cell.className = 'about-stat'; const value = document.createElement('strong'); value.textContent = stat.v; const label = document.createElement('span'); label.textContent = stat.l; cell.append(value, label); stats.append(cell); });
  const isAnchor = (link) => link.startsWith('#');
  /* EXPERIENCE and AWARDS (2026-10-09): one line each; a line with a project opens it.
     WORK EXPERIENCE and ACTIVITIES (2026-10-10, 연서): rows without a project showed nothing, and the festival row only
     led to the design-team project, so each row now opens the timeline's side panel for the same entry (hover or focus);
     on a phone a tap shows that text under the row, with the project link if there is one */
  const timelineFor = (entry) => {
    const name = T(entry.title, 'ko'); const full = `${name}: ${T(entry.label, 'ko')}`;
    let exact = null; let near = null; let byLink = null;
    SITE.timeline.forEach((segment) => segment.items.forEach((item) => {
      const title = T(item.title, 'ko');
      const found = { item, segment: segment.segment, grade: T(segment.grade, lang) };
      if (!exact && title === full) exact = found;
      if (!near && title.startsWith(`${name}:`)) near = found;
      /* AWARDS (2026-10-11, 연서: hover should open the side panel like the rows above): award titles differ
         from the timeline's, so an award finds its entry through the project it links to */
      if (!byLink && entry.link && item.link === entry.link) byLink = found;
    }));
    return exact || near || byLink;
  };
  const fillList = (list, entries, withPanel = false) => (entries || []).forEach((award) => {
    const item = document.createElement('li');
    const hit = withPanel ? timelineFor(award) : null;
    const row = document.createElement(award.link || hit ? 'button' : 'div'); row.className = 'about-award'; if (row.tagName === 'BUTTON') row.type = 'button';
    const year = document.createElement('span'); year.className = 'about-award-year'; year.textContent = award.year;
    const label = document.createElement('span'); label.className = 'about-award-label'; label.textContent = T(award.label, lang);
    const title = document.createElement('span'); title.className = 'about-award-title'; title.textContent = T(award.title, lang);
    row.append(year, label, title);
    if (award.link) { const go = document.createElement('span'); go.className = 'about-award-go'; go.setAttribute('aria-hidden', 'true'); go.textContent = '→'; row.append(go); }
    item.append(row);
    if (hit && mobileQuery.matches) {
      const more = document.createElement('div'); more.className = 'about-award-more'; more.hidden = true;
      if (T(hit.item.desc, lang)) { const desc = document.createElement('p'); desc.className = 'about-award-desc'; desc.textContent = T(hit.item.desc, lang); more.append(desc); }
      const link = hit.item.link || award.link;
      if (link) { const open = document.createElement('button'); open.type = 'button'; open.className = 'timeline-panel-open'; open.textContent = isAnchor(link) ? SITE.aboutUi.openNow : SITE.aboutUi.openProject; open.addEventListener('click', () => follow(link)); more.append(open); }
      row.setAttribute('aria-expanded', 'false');
      row.addEventListener('click', () => { const show = more.hidden; more.hidden = !show; row.setAttribute('aria-expanded', String(show)); });
      item.append(more);
    } else {
      if (hit) {
        row.addEventListener('pointerenter', () => openPanel(hit.item, hit.segment, hit.grade));
        row.addEventListener('pointerleave', closePanel);
        row.addEventListener('focus', () => openPanel(hit.item, hit.segment, hit.grade));
        row.addEventListener('blur', closePanel);
      }
      if (award.link) row.addEventListener('click', () => openDetail(award.link, lang));
    }
    list?.append(item);
  });
  fillList(section.querySelector('.about-exp-list'), SITE.profile.experience, true);
  fillList(section.querySelector('.about-act-list'), SITE.profile.activities, true);
  fillList(section.querySelector('.about-awards:not(.about-experience):not(.about-activities) .about-award-list'), SITE.profile.awards, true);
  buildTimeline(track, lang);
  SITE.profile.skills.forEach((group) => { const block = document.createElement('section'); block.className = 'about-skill-group'; const label = document.createElement('h3'); label.textContent = T(group.group, lang).toUpperCase(); const items = document.createElement('p'); items.textContent = group.items.map((entry) => T(entry, lang)).join(' · '); block.append(label, items); skills.append(block); });

  function closePanel() { clearTimeout(panelTimer); panelTimer = window.setTimeout(() => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); }, 250); }
  function openPanel(item, segment, grade) {
    clearTimeout(panelTimer); panelInner.innerHTML = '';
    /* phones: the panel is a sheet from the bottom, with a close button (a tap anywhere else closes it too) */
    if (mobileQuery.matches) { const close = document.createElement('button'); close.type = 'button'; close.className = 'timeline-panel-close'; close.textContent = 'CLOSE ×'; close.addEventListener('click', closePanel); panelInner.append(close); }
    const date = document.createElement('p'); date.className = 'timeline-panel-date'; date.textContent = dateRange(item);
    const title = document.createElement('h3'); title.className = 'timeline-panel-title'; title.textContent = T(item.title, lang);
    const meta = document.createElement('p'); meta.className = 'timeline-panel-grade'; meta.textContent = [segment, grade].filter(Boolean).join(' · ');
    panelInner.append(date, title, meta);
    if (T(item.desc, lang)) { const desc = document.createElement('p'); desc.className = 'timeline-panel-desc'; desc.textContent = T(item.desc, lang); panelInner.append(desc); }
    if (item.link) { const open = document.createElement('button'); open.type = 'button'; open.className = 'timeline-panel-open'; open.textContent = isAnchor(item.link) ? SITE.aboutUi.openNow : SITE.aboutUi.openProject; open.addEventListener('click', () => follow(item.link)); panelInner.append(open); }
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
  }
  /* a timeline link is a project slug, or '#id' for a spot on the page (NOW, 2026-10-04): isAnchor is defined above the lists */
  function follow(link) {
    if (!isAnchor(link)) { openDetail(link, lang); return; }
    const target = document.querySelector(link); if (!target) return;
    closePanel();
    if (window.__lenis) window.__lenis.scrollTo(target, { offset: -40 }); else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  panel.addEventListener('pointerenter', () => clearTimeout(panelTimer));
  panel.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') closePanel(); });
  document.addEventListener('pointerdown', (event) => {
    if (!mobileQuery.matches || !panel.classList.contains('is-open')) return;
    if (panel.contains(event.target) || event.target.closest?.('.timeline-item')) return;
    closePanel();
  }, { passive: true });

  section.querySelectorAll('.timeline-segment').forEach((segmentElement, segmentIndex) => {
    const segment = SITE.timeline[segmentIndex]; const grade = T(segment.grade, lang);
    segmentElement.querySelectorAll('.timeline-item').forEach((button, itemIndex) => {
      const item = segment.items[itemIndex];
      /* phones (2026-10-17): the same horizontal timeline as the computer; a tap opens the item in the bottom sheet */
      if (mobileQuery.matches) {
        button.addEventListener('click', () => {
          section.querySelectorAll('.timeline-span.is-hot').forEach((node) => node.classList.remove('is-hot'));
          button.timelineSpan?.classList.add('is-hot');
          openPanel(item, segment.segment, grade);
        });
        return;
      }
      button.addEventListener('pointerenter', () => { openPanel(item, segment.segment, grade); button.timelineSpan?.classList.add('is-hot'); });
      button.addEventListener('pointerleave', () => { closePanel(); button.timelineSpan?.classList.remove('is-hot'); });
      button.addEventListener('focus', () => openPanel(item, segment.segment, grade));
      button.addEventListener('blur', closePanel);
    });
  });

  /* the same tick as the ring (2026-10-06): one each time another item reaches the middle while the timeline scrolls */
  let middleIndex = -1;
  function tickTimeline() {
    const items = section.querySelectorAll('.timeline-item'); let nearest = -1; let best = Infinity;
    items.forEach((item, index) => { const rect = item.getBoundingClientRect(); const off = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2); if (off < best) { best = off; nearest = index; } });
    if (middleIndex !== -1 && nearest !== middleIndex) ringTick();
    middleIndex = nearest;
  }

  function updateDepth() {
    if (reducedQuery.matches) return;
    section.querySelectorAll('.timeline-item').forEach((item) => {
      const rect = item.getBoundingClientRect(); const ratio = (rect.left + rect.width / 2) / window.innerWidth;
      if (ratio >= .2 && ratio <= .8) gsap.set(item, { rotationY: 0, z: 0, opacity: 1 });
      else { const distance = ratio < .2 ? .2 - ratio : ratio - .8; const direction = ratio < .2 ? -1 : 1; gsap.set(item, { rotationY: direction * Math.min(28, distance * 80), z: -Math.min(56, distance * 130), opacity: Math.max(.5, 1 - distance * 1.4) }); }
    });
  }

  function drawSpans() {
    track.querySelectorAll('.timeline-span').forEach((node) => node.remove());
    if (!SITE.timelineSpans) return;
    const segments = [...track.querySelectorAll('.timeline-segment')];
    const spans = [];
    segments.forEach((segmentElement, segmentIndex) => {
      const buttons = segmentElement.querySelectorAll('.timeline-item');
      SITE.timeline[segmentIndex].items.forEach((item, itemIndex) => {
        const button = buttons[itemIndex]; if (button) button.timelineSpan = null;
        if (!item.until || !button) return;
        const end = semesterOf(item.until);
        if (end.index < 0 || end.index === segmentIndex) return;
        const endElement = segments[end.index];
        const halfYear = /-\d$/.test(SITE.timeline[end.index].segment);
        const fraction = halfYear ? ((end.half === 1 ? end.value - 1 : end.value - 7) + .5) / 6 : end.value / 12;
        const x0 = segmentElement.offsetLeft + button.offsetLeft;
        const x1 = endElement.offsetLeft + endElement.offsetWidth * Math.min(.95, Math.max(.08, fraction));
        if (x1 - x0 > 40) spans.push({ x0, x1, button });
      });
    });
    const lanes = [];
    spans.sort((a, b) => a.x0 - b.x0).forEach((span) => {
      let lane = lanes.findIndex((laneEnd) => laneEnd < span.x0 - 4);
      if (lane < 0) { lane = lanes.length; lanes.push(0); }
      lanes[lane] = span.x1;
      const line = document.createElement('span');
      line.className = 'timeline-span'; line.setAttribute('aria-hidden', 'true');
      line.style.left = `${span.x0}px`; line.style.width = `${span.x1 - span.x0}px`; line.style.setProperty('--lane', lane);
      track.append(line); span.button.timelineSpan = line;
    });
  }
  let spanTimer = 0;
  const onSpanResize = () => { clearTimeout(spanTimer); spanTimer = window.setTimeout(() => { if (timelineOpen) drawSpans(); }, 150); };

  /* folded by default (연서, 2026-10-16: the pinned timeline took too long every time she scrolled past it). OPEN builds the
     pinned horizontal scroll, CLOSE removes it, so a closed timeline is one line on the page. */
  const toggle = section.querySelector('.timeline-toggle');
  let timelineOpen = false;
  let interactionsReady = false;
  const toggleLabel = () => { toggle.innerHTML = timelineOpen ? SITE.aboutUi.timelineClose : SITE.aboutUi.timelineOpen; toggle.setAttribute('aria-expanded', String(timelineOpen)); };
  toggleLabel();
  const scrollToY = (y, immediate) => { if (window.__lenis) window.__lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: .9, force: true }); else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' }); };
  function buildTimelineMotion() {
    if (horizontalTween || reducedQuery.matches) return;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    horizontalTween = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: timeline, start: 'top top', end: () => `+=${Math.round(distance() * .6)}` /* scroll 0.6px per px of travel (was 0.6 screen per column, too long) */, pin: timelinePin, scrub: true, invalidateOnRefresh: true, onUpdate: () => { updateDepth(); tickTimeline(); }, onRefresh: updateDepth } });
  }
  function killTimelineMotion() {
    if (!horizontalTween) return;
    horizontalTween.scrollTrigger?.kill(true); horizontalTween.kill(); horizontalTween = null;
    gsap.set(track, { x: 0 }); middleIndex = -1;
  }
  function setTimeline(open) {
    if (open === timelineOpen) return;
    const navOffset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64) + 28;
    const wasTop = timeline.getBoundingClientRect().top + window.scrollY;
    timelineOpen = open;
    timeline.classList.toggle('is-collapsed', !open);
    toggleLabel();
    if (open) {
      if (interactionsReady) { drawSpans(); buildTimelineMotion(); }
      window.ScrollTrigger?.refresh();
      /* desktop: bring the top of the timeline up so the pinned scroll starts from its first year */
      if (horizontalTween) scrollToY(horizontalTween.scrollTrigger.start, false);
    } else {
      killTimelineMotion();
      window.ScrollTrigger?.refresh();
      /* closing from the middle of the pinned scroll: land on the folded line instead of far below it */
      if (window.scrollY > wasTop - navOffset) scrollToY(Math.max(0, wasTop - navOffset), true);
    }
  }
  toggle.addEventListener('click', () => setTimeline(!timelineOpen));
  section.querySelector('.timeline-viewport').addEventListener('click', () => { if (!timelineOpen) setTimeline(true); }); /* the drifting strip opens it too */

  function setupInteractions() {
    interactionsReady = true;
    window.addEventListener('resize', onSpanResize);
    if (reducedQuery.matches) { section.classList.add('about-reduced'); return; }
    if (timelineOpen) { drawSpans(); buildTimelineMotion(); }
    window.ScrollTrigger?.refresh();
  }

  if (window.__introReady) setupInteractions();
  else { pendingLoadHandler = () => requestAnimationFrame(setupInteractions); window.addEventListener('portfolio:intro-ready', pendingLoadHandler, { once: true }); }

  instance = { destroy() { if (pendingLoadHandler) window.removeEventListener('portfolio:intro-ready', pendingLoadHandler); horizontalTween?.scrollTrigger?.kill(); horizontalTween?.kill(); mobileObserver?.disconnect(); clearTimeout(panelTimer); clearTimeout(spanTimer); window.removeEventListener('resize', onSpanResize); } };
  return instance;
}
