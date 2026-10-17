import { T } from './render-shell.js';
import { typeClick, getSoundEnabled } from '../audio.js';
import { openDetail } from './detail.js';

import { createHandNotes } from './intro-hand.js';
import { reducedMotion } from '../motion.js';
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
const PER_STEP = 2; /* lines typed per scroll step (one until 2026-10-17: too long a scroll, 연서) */
const STEPS = 4; /* three typed pairs + the full paragraph (7 until 2026-10-17) */
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
        <p class="intro-sound-hint" aria-hidden="true"></p>
      </div>
    </div>`;

  const stage = section.querySelector('.intro-stage');
  const frame = section.querySelector('.intro-frame');
  /* browsers hold sound until the first click: on the empty first screen, where the typing will start, a small line
     asks for one. It goes on the first scroll, where the typing takes its place (2026-10-06) */
  const soundHint = section.querySelector('.intro-sound-hint');
  {
    const copy = SITE.sound?.hint || {};
    soundHint.textContent = window.matchMedia('(hover: none)').matches ? (copy.touch || '♪ Tap anywhere for sound') : (copy.mouse || '♪ Click anywhere to turn on the sound');
    const off = () => soundHint.classList.add('is-hidden');
    /* it stays until the first scroll even when the browser already lets sound play (a site visited often):
       hiding it on audioready made it flash for half a second on reload (2026-10-06) */
    if (!getSoundEnabled()) off();
    window.addEventListener('portfolio:soundchange', (event) => { if (!event.detail) off(); });
  }
  const linesRoot = section.querySelector('.intro-lines');
  const hintEl = section.querySelector('.intro-hint');
  const hintText = section.querySelector('.intro-hint-text');
  const hand = createHandNotes({ frame, linesRoot });
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
    /* it stays for good. A narrow desktop window has no notes, so no hint there; phones have notes that open by
       themselves and on a tap (2026-10-17), so they get the hint in tap words, on the row of the en / ko switch */
    if (window.matchMedia('(max-width: 760px) and (hover: hover)').matches) return;
    const source = window.matchMedia('(hover: none)').matches ? (SITE.intro.ui.hintTouch || SITE.intro.ui.hint) : SITE.intro.ui.hint;
    /* 2026-10-16: a visitor on the Korean site reads the English paragraph but missed the English hint, so the hint
       follows the site language when that is Korean */
    const hintLang = siteLang === 'ko' ? 'ko' : currentLang;
    const copy = typeof source === 'string' ? source : (source[hintLang] || source.en);
    if (reducedMotion.matches) { hintText.textContent = copy; hintEl.classList.add('is-typing'); return; }
    let count = 0;
    const step = () => {
      if (mode !== 'final') return;
      count += 1;
      hintText.textContent = copy.slice(0, count);
      if (count < copy.length) hintTimer = window.setTimeout(step, 42);
    };
    hintTimer = window.setTimeout(() => { hintEl.classList.add('is-typing'); hintTimer = window.setTimeout(step, 350); }, 450); /* sooner (was 900 + 700 ms) */
  }

  function bindKeyword(word, keyword) { hand.bind(word, keyword); }

  function renderFinal() {
    if (mode === 'final') return;
    mode = 'final';
    soundHint.classList.add('is-hidden'); /* the sound line sits where the paragraph is: never both (2026-10-17, they overlapped on a phone) */
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
    hand.autoplay(true); /* phones: the notes open by themselves (does nothing with a mouse) */
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
    const text = lines.slice(step * PER_STEP, step * PER_STEP + PER_STEP).join('\n');
    const typed = text.slice(0, Math.round(text.length * chars));
    if (typed !== solo.textContent) { solo.textContent = ''; appendText(solo, typed); }
    const count = typed.length;
    if (count > previousCount) typeClick(); /* one click per step, throttled in audio.js (was up to 3) */
    previousCount = count;
  }

  function update(progress) {
    frame.classList.toggle('is-started', progress > .004);
    /* once scrolled away, the sound line is gone for the visit: back at the top it came back over the paragraph (2026-10-06) */
    if (progress > .004 || locked) soundHint.classList.add('is-hidden');
    if (locked) { renderFinal(); return; }
    const scaled = Math.min(progress * STEPS, STEPS - .001);
    const step = Math.floor(scaled);
    if (step >= STEPS - 1) renderFinal();
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
    if (reducedMotion.matches) { renderFinal(); return; }
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
      onLeave: () => { if (locked) requestShrink(); },
      onLeaveBack: () => { if (locked) requestShrink(); },
    });
    update(0); /* nothing on the paper until the first scroll */
  }

  /* After the paragraph has been read, scrolling back up should not walk through five screens of a still
     page. The pin is cut to a short hold once the reader is out of it, and the scroll position moves by the
     same amount so nothing on screen jumps. */
  /* Phones (2026-10-17, 연서: reading the intro, the page suddenly jumped to the archive): a finger flick keeps the page
     gliding after it lets go, and a scroll position set during that glide is dropped, so the page landed where the
     glide was going, now several screens lower because the intro had just got shorter. On a touch screen the intro is
     shortened only once the page has come to rest with no finger on it, and only if the reader is still below it. */
  const touchScreen = window.matchMedia('(hover: none)').matches;
  let shrinkTimer = 0;
  let lastScrollAt = 0;
  let touching = false;
  if (touchScreen) {
    window.addEventListener('scroll', () => { lastScrollAt = performance.now(); }, { passive: true });
    window.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    window.addEventListener('touchend', () => { touching = false; lastScrollAt = performance.now(); }, { passive: true });
    window.addEventListener('touchcancel', () => { touching = false; }, { passive: true });
  }
  function requestShrink() {
    if (!touchScreen) { window.requestAnimationFrame(shrink); return; }
    clearTimeout(shrinkTimer);
    const check = () => {
      if (shrunk || !trigger) return;
      if (touching || performance.now() - lastScrollAt < 600) { shrinkTimer = window.setTimeout(check, 300); return; }
      if (window.scrollY < trigger.end - 1) return; /* back inside or above the intro: wait for the next time it is left */
      shrink();
    };
    shrinkTimer = window.setTimeout(check, 600);
  }

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
