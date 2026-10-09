import { renderIntro } from './sections/intro.js';
import { renderWork } from './sections/work.js';
import { renderName } from './sections/name.js';
import { renderAbout } from './sections/about.js';
import { renderArchive } from './sections/archive.js';
import { renderContact } from './sections/contact.js';
import { renderDetailShell, closeDetail } from './sections/detail.js';
import { initLoader } from './loader.js';
import { initGround } from './ground.js';
import { initCursorLens } from './cursor-lens.js';
import { getSoundEnabled, setSoundEnabled, toggleSound } from './audio.js';
import { storageGet, storageSet } from './sections/render-shell.js';

const LANG_KEY = 'yeonseo-lang';
/* the site follows the visitor's browser language until they pick one (the intro paragraph opens in English either way) */
const browserLang = /^ko\b/i.test(navigator.language || '') || (navigator.languages || []).slice(0, 1).some((l) => /^ko\b/i.test(l)) ? 'ko' : 'en';
let LANG = storageGet('localStorage', LANG_KEY) || browserLang;
let introController = null;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* The ring, the name's water and the timeline are built once for desktop or once for phones. A window resized
   across that line (split screen, then full screen) rebuilds the page so the right version runs (2026-10-03). */
{
  const layoutQuery = window.matchMedia('(max-width: 600px), (hover: none)');
  let reloadTimer = 0;
  layoutQuery.addEventListener('change', () => { clearTimeout(reloadTimer); reloadTimer = window.setTimeout(() => window.location.reload(), 400); });
}
const T = (value) => value && typeof value === 'object' && 'ko' in value ? (value[LANG] || value.ko) : value;

function toggleLanguage() {
  LANG = LANG === 'ko' ? 'en' : 'ko';
  storageSet('localStorage', LANG_KEY, LANG);
  document.documentElement.lang = LANG;
  renderNav();
  renderLaterSections(); /* the intro paragraph keeps its own en / ko */
  window.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: LANG }));
}

async function toggleSiteSound() {
  await toggleSound();
  renderNav();
}

/* phones (2026-10-09, 연서: "the list at the top is hard to see, put it behind a ≡ button"): the bar is the name and
   a ≡ button, the links and the two toggles open in a panel under it. SELECTED is left out on phones, which have no
   ring; the section itself is hidden there too (styles.css). */
const compactNavQuery = window.matchMedia('(max-width: 600px), (hover: none)');
let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  const nav = document.querySelector('#nav');
  nav?.classList.toggle('is-menu-open', open);
  nav?.querySelector('.nav-menu-button')?.setAttribute('aria-expanded', String(open));
}
document.addEventListener('click', (event) => { if (menuOpen && !event.composedPath().some((node) => node.id === 'nav')) setMenu(false); /* the path, not closest(): a toggle rebuilds the nav before the click reaches here */ });

function renderNav() {
  const nav = document.querySelector('#nav');
  nav.innerHTML = '';
  const compact = compactNavQuery.matches;
  const links = compact ? SITE.nav.links.filter((item) => item.target !== '#work') : SITE.nav.links;
  const wordmark = document.createElement('a'); wordmark.className = 'nav-wordmark'; wordmark.href = '#intro'; wordmark.textContent = SITE.nav.wordmark;
  const actions = document.createElement('div'); actions.className = 'nav-actions';
  links.forEach((item, index) => {
    const link = document.createElement('a'); link.className = 'nav-link'; link.href = item.target; link.textContent = item.label; actions.append(link);
    if (compact) link.addEventListener('click', () => setMenu(false));
    if (index < links.length - 1) { const divider = document.createElement('span'); divider.className = 'nav-divider'; divider.textContent = '·'; actions.append(divider); }
  });
  const language = document.createElement('button'); language.className = 'nav-toggle'; language.type = 'button'; language.setAttribute('aria-label', SITE.nav.languageAria); language.textContent = T(SITE.nav.language);
  language.addEventListener('click', toggleLanguage);
  const sound = document.createElement('button'); sound.className = 'nav-toggle'; sound.type = 'button'; sound.setAttribute('aria-label', SITE.nav.soundAria); sound.textContent = getSoundEnabled() ? SITE.nav.soundOn : SITE.nav.soundOff;
  sound.addEventListener('click', toggleSiteSound);
  if (!compact) { actions.append(language, sound); nav.append(wordmark, actions); return; }
  const toggles = document.createElement('div'); toggles.className = 'nav-menu-toggles'; toggles.append(language, sound); actions.append(toggles);
  actions.id = 'nav-menu';
  const button = document.createElement('button'); button.className = 'nav-menu-button'; button.type = 'button';
  button.setAttribute('aria-label', 'Menu'); button.setAttribute('aria-controls', 'nav-menu');
  button.innerHTML = '<span></span><span></span><span></span>';
  button.addEventListener('click', () => setMenu(!menuOpen));
  nav.append(wordmark, button, actions);
  setMenu(menuOpen);
}

function renderLaterSections() { renderWork(LANG); renderName(LANG); renderAbout(LANG); renderArchive(LANG); renderContact(LANG); }

function initScroll() {
  if (!window.Lenis || !window.gsap || !window.ScrollTrigger || reduced) return;
  const lenis = new Lenis({ smoothWheel: true, lerp: .1 });
  gsap.registerPlugin(ScrollTrigger, Flip);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

function initNavState() {
  const sync = () => document.querySelector('#nav')?.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', sync, { passive: true }); sync();
}

document.documentElement.lang = LANG;
window.__webglLog = window.__webglLog || [];
window.__siteActions = { toggleLanguage, toggleSound: toggleSiteSound, getLanguage: () => LANG };
initGround(); renderNav(); renderDetailShell(); renderLaterSections(); introController = renderIntro(LANG); initNavState();
window.addEventListener('portfolio:soundchange', renderNav);
document.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; if (menuOpen) setMenu(false); if (!document.querySelector('#detail')?.hidden) closeDetail(); });
/* the "best viewed on a computer" note for phones was removed (2026-10-09, 연서: no notes about what phones do not have) */
function startRuntime() {
  initScroll();
  initLoader({ host: introController.host, onComplete: () => { introController.start(); window.__introReady = true; window.dispatchEvent(new Event('portfolio:intro-ready')); window.ScrollTrigger?.refresh(); initCursorLens(); }, onGesture: () => { setSoundEnabled(true); renderNav(); } });
}

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', startRuntime, { once: true });
else startRuntime();
