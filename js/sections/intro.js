import { T } from './render-shell.js';
import { typeClick } from '../audio.js';
import { openDetail } from './detail.js';

import { createHandNotes } from './intro-hand.js';
let controller = null;
const compactQuery = window.matchMedia('(max-width: 760px), (hover: none)'); /* hand-drawn notes need room; the rest of the desktop site runs down to 601px (2026-10-03) */

function fragmentsFor(keyword, lang) {
  return keyword.fragments?.[lang] || [T(keyword.text, lang)];
}

/* Latin punctuation falls to the typewriter face, whose full stop is far too heavy next to the Korean
   glyphs — punctuation is set in the Korean font at the same size instead. */
const PUNCT = /([.,!?…:;—])/g;
function appendText(target, text) {
  text.split(PUNCT).forEach((part, index) => {
    if (!part) return;
    if (index % 2 === 1) { const span = document.createElement('span'); span.className = 'intro-punct'; span.textContent = part; target.append(span); }
    else target.append(document.createTextNode(part));
  });
}

/* how far the pinned intro scrolls per sentence, in viewport heights */
const STEP_VH = .7;
const STEPS = 7; /* six typed lines + the full paragraph */
/* once the paragraph has been read in full it stays: the pin then only holds it this long */
const HOLD_VH = .5;

function appendRichLine(row, line, lang, bindKeyword) {
  const matches = [];
  SITE.intro.keywords.forEach((keyword) => {
    fragmentsFor(keyword, lang).forEach((fragment) => {
      const index = line.indexOf(fragment);
      if (index >= 0) matches.push({ keyword, fragment, index });
    });
  });
  matches.sort((a, b) => a.index - b.index || b.fragment.length - a.fragment.length);
  row.innerHTML = '';
  let cursor = 0;
  matches.forEach(({ keyword, fragment, index }) => {
    if (index < cursor) return;
    appendText(row, line.slice(cursor, index));
    const word = document.createElement('button');
    word.type = 'button';
    word.className = 'intro-keyword';
    word.dataset.keyword = keyword.key;
    word.dataset.anchorId = `${keyword.key}-${index}-${row.dataset.row}`;
    appendText(word, fragment);
    bindKeyword(word, keyword);
    row.append(word);
    cursor = index + fragment.length;
  });
  appendText(row, line.slice(cursor));
}

export function renderIntro(siteLang) {
  const lang = SITE.intro.defaultLang || 'en'; /* the paragraph has its own en / ko, apart from the site toggle */
  const section = document.querySelector('#intro');
  section.innerHTML = `
    <div class="intro-stage">
      <div class="intro-visual-host"></div>
      <div class="intro-frame">
        <div class="section-heading"><span>${SITE.sections.intro.title}</span><span class="section-heading__index">${SITE.sections.intro.index}</span></div>
        <div class="intro-copy">
          <div class="intro-lang" role="group" aria-label="${SITE.intro.ui.langAria}"><button type="button" data-lang="en">en</button><span aria-hidden="true">/</span><button type="button" data-lang="ko">ko</button></div>
          <div class="intro-lines" aria-live="polite"></div>
          <p class="intro-hint" aria-hidden="true"><span class="intro-hint-pill"><span class="intro-hint-text"></span><span class="intro-hint-cursor">_</span></span></p>
        </div>
        <p class="intro-scroll-hint">${SITE.intro.ui.scroll}<span aria-hidden="true">_</span></p>
      </div>
    </div>`;

  const stage = section.querySelector('.intro-stage');
  const frame = section.querySelector('.intro-frame');
  const linesRoot = section.querySelector('.intro-lines');
  const hintEl = section.querySelector('.intro-hint');
  const hintText = section.querySelector('.intro-hint-text');
  const hand = createHandNotes({ frame, linesRoot, isCompact: () => compactQuery.matches });
  const rows = Array.from({ length: 6 }, (_, index) => {
    const row = document.createElement('div');
    row.className = 'intro-line';
    row.dataset.row = `${index + 1}`;
    linesRoot.append(row);
    return row;
  });
  /* while typing, every line appears in the same spot — the centre of the block */
  const solo = document.createElement('div');
  solo.className = 'intro-line intro-line--solo';
  solo.dataset.row = 'solo';
  linesRoot.append(solo);

  let currentLang = lang;
  let trigger = null;
  let previousCount = 0;
  let activeStep = -1;
  let mode = '';
  let resizeTimer = 0;
  let hintTimer = 0;
  let locked = false;    /* the full paragraph has been shown once: no more line-by-line typing */
  let shrunk = false;    /* …and the pinned stretch has been cut down to a short hold */
  let previewed = false; /* the faint whole-mind-map preview plays once per visit */

  /* the hint follows the paragraph's own language and types itself in once the paragraph has settled */
  function resetHint() {
    clearTimeout(hintTimer);
    hintText.textContent = '';
    hintEl.classList.remove('is-typing');
  }
  function typeHint() {
    resetHint();
    /* it stays for good; a phone has no notes to open, so no hint there */
    if (compactQuery.matches) return;
    const source = SITE.intro.ui.hint;
    const copy = typeof source === 'string' ? source : (source[currentLang] || source.en);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { hintText.textContent = copy; hintEl.classList.add('is-typing'); return; }
    let count = 0;
    const step = () => {
      if (mode !== 'final') return;
      count += 1;
      hintText.textContent = copy.slice(0, count);
      if (count < copy.length) hintTimer = window.setTimeout(step, 42);
    };
    hintTimer = window.setTimeout(() => { hintEl.classList.add('is-typing'); hintTimer = window.setTimeout(step, 700); }, 900);
  }

  function bindKeyword(word, keyword) { hand.bind(word, keyword); }

  function renderFinal() {
    if (mode === 'final') return;
    mode = 'final';
    activeStep = 6;
    const lines = SITE.intro.finalLines?.[currentLang] || SITE.intro.lines[currentLang];
    solo.textContent = '';
    solo.classList.remove('is-visible', 'is-active');
    rows.forEach((row, index) => {
      appendRichLine(row, lines[index], currentLang, bindKeyword);
      row.classList.remove('is-active');
      row.classList.add('is-visible');
    });
    linesRoot.classList.add('is-final');
    previousCount = lines.reduce((sum, line) => sum + line.length, 0);
    requestAnimationFrame(() => hand.layout());
    document.fonts?.ready.then(() => hand.layout());
    typeHint();
    locked = true;
    if (!previewed) {
      previewed = true;
      window.setTimeout(() => { if (mode === 'final') hand.preview(); }, 600); /* 1500 until 2026-10-02: too slow to arrive */
    }
  }

  /* the dotted underlines pulse until the reader has tried one word; the hint under the paragraph stays */
  const discover = (event) => {
    if (!event.target.closest?.('.intro-keyword, .hand-hot')) return;
    frame.classList.add('is-discovered');
  };
  frame.addEventListener('pointerenter', discover, true);
  frame.addEventListener('click', discover, true);

  function renderStep(step, local) {
    if (mode === 'final') {
      rows.forEach((row) => { row.innerHTML = ''; });
      hand.reset();
      resetHint();
    }
    if (activeStep !== step) { activeStep = step; previousCount = 0; }
    mode = `step-${step}`;
    linesRoot.classList.remove('is-final');
    const lines = SITE.intro.lines[currentLang];
    const chars = Math.max(0, Math.min(1, (local - .08) / .72));
    rows.forEach((row) => { row.classList.remove('is-visible', 'is-active'); });
    solo.classList.add('is-visible', 'is-active');
    const typed = lines[step].slice(0, Math.round(lines[step].length * chars));
    if (typed !== solo.textContent) { solo.textContent = ''; appendText(solo, typed); }
    const count = typed.length;
    if (count > previousCount) typeClick(); /* one click per step, throttled in audio.js (was up to 3) */
    previousCount = count;
  }

  function update(progress) {
    frame.classList.toggle('is-started', progress > .004);
    if (locked) { renderFinal(); return; }
    const scaled = Math.min(progress * STEPS, STEPS - .001);
    const step = Math.floor(scaled);
    if (step >= 6) renderFinal();
    else renderStep(step, scaled - step);
  }

  const langButtons = [...section.querySelectorAll('.intro-lang button')];
  langButtons.forEach((button) => button.addEventListener('click', () => { if (button.dataset.lang !== currentLang) setLanguage(button.dataset.lang); }));

  function setLanguage(nextLang) {
    currentLang = nextLang;
    langButtons.forEach((button) => button.classList.toggle('is-current', button.dataset.lang === nextLang));
    mode = '';
    rows.forEach((row) => { row.innerHTML = ''; row.classList.remove('is-visible', 'is-active'); });
    solo.textContent = ''; solo.classList.remove('is-visible', 'is-active');
    hand.reset();
    resetHint();
    update(trigger ? trigger.progress : 0);
  }

  function start() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { renderFinal(); return; }
    trigger?.kill();
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * (shrunk ? HOLD_VH : STEPS * STEP_VH)}`,
      pin: stage,
      scrub: .18,
      anticipatePin: 1,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
      onLeave: () => { if (locked) window.requestAnimationFrame(shrink); },
      onLeaveBack: () => { if (locked) window.requestAnimationFrame(shrink); },
    });
    update(0); /* nothing on the paper until the first scroll */
  }

  /* After the paragraph has been read, scrolling back up should not walk through five screens of a still
     page. The pin is cut to a short hold once the reader is out of it, and the scroll position moves by the
     same amount so nothing on screen jumps. */
  function shrink() {
    if (shrunk || !trigger) return;
    const before = trigger.end - trigger.start;
    const below = window.scrollY >= trigger.end - 1;
    shrunk = true;
    ScrollTrigger.refresh();
    const delta = before - (trigger.end - trigger.start);
    if (!below || delta <= 0) return;
    const target = Math.max(0, window.scrollY - delta);
    if (window.__lenis) { window.__lenis.resize?.(); window.__lenis.scrollTo(target, { immediate: true, force: true }); }
    else window.scrollTo(0, target);
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { if (mode === 'final') hand.layout(); }, 120);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowRight'].includes(event.key)) return;
    const bounds = section.getBoundingClientRect();
    if (bounds.top > 1 || bounds.bottom < window.innerHeight) return;
    if (['BUTTON', 'A'].includes(document.activeElement?.tagName)) return;
    event.preventDefault();
    window.__lenis?.scrollTo(window.scrollY + window.innerHeight * STEP_VH, { duration: .8 });
  });

  setLanguage(lang);
  controller = {
    host: section.querySelector('.intro-visual-host'),
    start,
    setLanguage,
    update,
    layoutGraph: () => hand.layout(),
    showKeyword: (key) => { renderFinal(); hand.show(key); },
    graphState: () => ({ active: hand.active }),
  };
  window.__stage1Intro = controller;
  return controller;
}

export function getIntroController() {
  return controller;
}
